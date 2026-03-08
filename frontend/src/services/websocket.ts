import type { TestProgress, TestLog } from '../types/index'
import { useAuthStore } from '../store/auth'
import { testsApi } from './api'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'
const RECONNECT_DELAY = 1000
const POLLING_INTERVAL = 2000

class WebSocketService {
  private ws: WebSocket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private isConnected = false
  private shouldUsePolling = false
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map()
  private wsEnabled = true // WebSocket enabled - backend now supports it
  private pollingModeLogged = false
  private subscribedTests: Set<string> = new Set()
  private reconnectTimeout: NodeJS.Timeout | null = null

  connect() {
    // Skip WebSocket connection if not enabled
    if (!this.wsEnabled) {
      console.info('WebSocket not enabled, using HTTP polling for updates')
      this.enablePollingFallback()
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) return

    const token = useAuthStore.getState().token
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      this.enablePollingFallback()
      return
    }

    try {
      // Construct WebSocket URL with token as query parameter
      const wsUrl = `${WS_URL}?token=${token}`
      this.ws = new WebSocket(wsUrl)

      this.setupSocketListeners()
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error)
      this.enablePollingFallback()
    }
  }

  private setupSocketListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('✓ WebSocket connected')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.shouldUsePolling = false
      this.stopAllPolling()

      // Resubscribe to all active tests
      this.subscribedTests.forEach(testId => {
        this.sendMessage({ action: 'subscribe', testId })
      })
    }

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const { event: eventType, data } = message

        switch (eventType) {
          case 'connected':
            console.log('WebSocket server acknowledged connection')
            break

          case 'test:progress':
            this.emit('test:progress', data)
            break

          case 'test:log':
            this.emit('test:log', data)
            break

          case 'test:completed':
            this.emit('test:completed', data)
            this.stopPollingForTest(data.testId)
            break

          case 'test:failed':
            this.emit('test:failed', data)
            this.stopPollingForTest(data.testId)
            break

          case 'subscribed':
            console.log(`Subscribed to test: ${data.testId}`)
            break

          case 'unsubscribed':
            console.log(`Unsubscribed from test: ${data.testId}`)
            break

          case 'pong':
            // Heartbeat response
            break

          case 'error':
            console.error('WebSocket server error:', data.message)
            break

          default:
            console.warn('Unknown WebSocket event:', eventType)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.isConnected = false

      // Attempt to reconnect unless we're over the limit
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        
        this.reconnectTimeout = setTimeout(() => {
          this.connect()
        }, RECONNECT_DELAY * this.reconnectAttempts)
      } else {
        console.warn('Max reconnection attempts reached, falling back to polling')
        this.enablePollingFallback()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    
    this.stopAllPolling()
    this.listeners.clear()
    this.subscribedTests.clear()
    this.isConnected = false
  }

  private sendMessage(message: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
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
    // Track this subscription
    this.subscribedTests.add(testId)

    // Subscribe via WebSocket if connected
    if (this.isConnected) {
      this.sendMessage({ action: 'subscribe', testId })
    }

    // If polling is enabled, start polling for this test
    if (this.shouldUsePolling) {
      this.startPollingForTest(testId)
    }

    // Return combined unsubscribe function
    const unsubscribeFromEvents = this.subscribe<TestProgress>('test:progress', (data) => {
      if (data.testId === testId) {
        callback(data)
      }
    })

    return () => {
      // Remove from tracked subscriptions
      this.subscribedTests.delete(testId)
      
      // Unsubscribe via WebSocket
      if (this.isConnected) {
        this.sendMessage({ action: 'unsubscribe', testId })
      }
      
      // Stop polling
      this.stopPollingForTest(testId)
      
      // Unsubscribe from events
      unsubscribeFromEvents()
    }
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
