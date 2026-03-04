import { useEffect, useRef } from 'react'
import { Terminal, Info, AlertTriangle, XCircle, Bug } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { TestLog } from '../../types/index'

interface LiveLogProps {
  logs: TestLog[]
  isRunning: boolean
  maxHeight?: string
}

export function LiveLog({ logs, isRunning, maxHeight = '400px' }: LiveLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-3 w-3 text-red-500" />
      case 'warn':
        return <AlertTriangle className="h-3 w-3 text-yellow-500" />
      case 'debug':
        return <Bug className="h-3 w-3 text-gray-400" />
      default:
        return <Info className="h-3 w-3 text-blue-500" />
    }
  }

  const getLogColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400'
      case 'warn':
        return 'text-yellow-400'
      case 'debug':
        return 'text-gray-500'
      default:
        return 'text-blue-400'
    }
  }

  return (
    <div className="border rounded-lg bg-black/95 text-green-400 font-mono text-xs overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
        <Terminal className="h-4 w-4" />
        <span className="font-semibold">Test Execution Log</span>
        {isRunning && (
          <div className="ml-auto flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-400">Running...</span>
          </div>
        )}
      </div>

      {/* Log Content */}
      <div
        ref={containerRef}
        className="overflow-y-auto p-4 space-y-1"
        style={{ maxHeight }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            Waiting for test to start...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex gap-2 items-start">
              <span className="text-gray-500 select-none min-w-[80px]">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="select-none">{getLogIcon(log.level)}</span>
              <span className={cn('flex-1', getLogColor(log.level))}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-800 px-4 py-2 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400">
        <span>{logs.length} lines</span>
        <span>
          Errors: {logs.filter(l => l.level === 'error').length} | 
          Warnings: {logs.filter(l => l.level === 'warn').length}
        </span>
      </div>
    </div>
  )
}
