import { io, Socket } from 'socket.io-client'
import type { TestProgress, TestLog } from '../types/index'
import { useAuthStore } from '../store/auth'
import { testsApi } from './api'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'
const RECONNECT_ATTEMPTS = 5
const RECONNECT_DELAY = 1000
const POLLING_INTERVAL = 2000

class WebSocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts = 0
  private isConnected = false
  private shouldUsePolling = true // Start with polling by default (WebSocket not implemented)
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private wsEnabled = false // WebSocket feature flag - set to true when backend supports it
  private pollingModeLogged = false // Only log polling mode once

  connect() {
    // Skip WebSocket connection if not enabled
    if (!this.wsEnabled) {
      console.info('WebSocket not enabled, using HTTP polling for updates')
      this.enablePollingFallback()
      return
    }

    if (this.socket?.connected) return

    const token = useAuthStore.getState().token
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      this.enablePollingFallback()
      return
    }

    try {
      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: RECONNECT_DELAY,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: RECONNECT_ATTEMPTS,
      })

      this.setupSocketListeners()
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error)
      this.enablePollingFallback()
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.shouldUsePolling = false
      this.stopAllPolling()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      this.isConnected = false
      
      // If disconnect was unexpected, enable polling fallback
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.enablePollingFallback()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      this.reconnectAttempts++
      
      // If we've exceeded reconnect attempts, fall back to polling
      if (this.reconnectAttempts >= RECONNECT_ATTEMPTS) {
        console.warn('Max reconnection attempts reached, falling back to polling')
        this.enablePollingFallback()
      }
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    // Test progress updates
    this.socket.on('test:progress', (data: TestProgress & { logs?: TestLog[] }) => {
      this.emit('test:progress', data)
    })

    // Test logs
    this.socket.on('test:log', (data: TestLog) => {
      this.emit('test:log', data)
    })

    // Test completed
    this.socket.on('test:completed', (data: { testId: string }) => {
      this.emit('test:completed', data)
      this.stopPollingForTest(data.testId)
    })

    // Test failed
    this.socket.on('test:failed', (data: { testId: string; error: string }) => {
      this.emit('test:failed', data)
      this.stopPollingForTest(data.testId)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.stopAllPolling()
    this.listeners.clear()
    this.isConnected = false
  }

  subscribe<T = any>(event: string, callback: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.listeners.delete(event)
        }
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }
  }

  subscribeToTest(testId: string, callback: (progress: TestProgress) => void) {
    // If polling is enabled, start polling for this test
    if (this.shouldUsePolling) {
      this.startPollingForTest(testId)
    }

    return this.subscribe<TestProgress>('test:progress', (data) => {
      if (data.testId === testId) {
        callback(data)
      }
    })
  }

  onTestCompleted(callback: (data: { testId: string }) => void) {
    return this.subscribe('test:completed', callback)
  }

  onTestFailed(callback: (data: { testId: string; error: string }) => void) {
    return this.subscribe('test:failed', callback)
  }

  onTestLog(callback: (log: TestLog) => void) {
    return this.subscribe('test:log', callback)
  }

  // Polling fallback mechanism
  private enablePollingFallback() {
    this.shouldUsePolling = true
    if (!this.pollingModeLogged) {
      console.info('Using HTTP polling for test updates (WebSocket not yet available)')
      this.pollingModeLogged = true
    }
  }

  private async startPollingForTest(testId: string) {
    if (this.pollingIntervals.has(testId)) return

    const poll = async () => {
      try {
        const response = await testsApi.getProgress(testId)
        if (response.data) {
          this.emit('test:progress', response.data)

          // Check if test is complete
          if (response.data.status === 'completed') {
            this.emit('test:completed', { testId })
            this.stopPollingForTest(testId)
          } else if (response.data.status === 'failed') {
            this.emit('test:failed', { 
              testId, 
              error: response.data.message || 'Test failed' 
            })
            this.stopPollingForTest(testId)
          }
        }
      } catch (error) {
        console.error('Polling error for test', testId, error)
      }
    }

    // Initial poll
    await poll()

    // Set up interval
    const interval = setInterval(poll, POLLING_INTERVAL)
    this.pollingIntervals.set(testId, interval)
  }

  private stopPollingForTest(testId: string) {
    const interval = this.pollingIntervals.get(testId)
    if (interval) {
      clearInterval(interval)
      this.pollingIntervals.delete(testId)
    }
  }

  private stopAllPolling() {
    this.pollingIntervals.forEach((interval) => clearInterval(interval))
    this.pollingIntervals.clear()
  }

  isUsingPolling(): boolean {
    return this.shouldUsePolling
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'polling' {
    if (this.isConnected) return 'connected'
    if (this.shouldUsePolling) return 'polling'
    return 'disconnected'
  }
}

export const wsService = new WebSocketService()

// Add API method for polling
declare module './api' {
  interface TestsApi {
    getProgress(testId: string): Promise<{ data?: TestProgress }>
  }
}
