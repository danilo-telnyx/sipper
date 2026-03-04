import { io, Socket } from 'socket.io-client'
import type { TestProgress } from '@/types'
import { useAuthStore } from '@/store/auth'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080'

class WebSocketService {
  private socket: Socket | null = null
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  connect() {
    if (this.socket?.connected) return

    const token = useAuthStore.getState().token
    if (!token) {
      console.warn('No auth token available for WebSocket connection')
      return
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    this.socket.on('connect', () => {
      console.log('WebSocket connected')
    })

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected')
    })

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error)
    })

    // Test progress updates
    this.socket.on('test:progress', (data: TestProgress) => {
      this.emit('test:progress', data)
    })

    // Test completed
    this.socket.on('test:completed', (data: { testId: string }) => {
      this.emit('test:completed', data)
    })

    // Test failed
    this.socket.on('test:failed', (data: { testId: string; error: string }) => {
      this.emit('test:failed', data)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.listeners.clear()
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
}

export const wsService = new WebSocketService()
