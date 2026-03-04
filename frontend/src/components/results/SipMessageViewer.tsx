import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { copyToClipboard, cn } from '../../lib/utils'

interface SipMessage {
  direction: 'sent' | 'received'
  timestamp: string
  method?: string
  statusCode?: number
  statusText?: string
  headers: Record<string, string>
  body?: string
}

interface SipMessageViewerProps {
  message: SipMessage
  index?: number
}

export function SipMessageViewer({ message, index }: SipMessageViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const fullMessage = formatSipMessage(message)
    await copyToClipboard(fullMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatSipMessage = (msg: SipMessage): string => {
    let lines: string[] = []

    // Request/Response line
    if (msg.method) {
      lines.push(`${msg.method} sip:${msg.headers['To'] || 'unknown'} SIP/2.0`)
    } else if (msg.statusCode) {
      lines.push(`SIP/2.0 ${msg.statusCode} ${msg.statusText || ''}`)
    }

    // Headers
    Object.entries(msg.headers).forEach(([key, value]) => {
      lines.push(`${key}: ${value}`)
    })

    // Body
    if (msg.body) {
      lines.push('')
      lines.push(msg.body)
    }

    return lines.join('\n')
  }

  const directionColor = message.direction === 'sent' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
  const directionLabel = message.direction === 'sent' ? 'SENT' : 'RECEIVED'
  const directionBadge = message.direction === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

  return (
    <Card className={cn('border-l-4', directionColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={cn('text-xs font-semibold px-2 py-1 rounded', directionBadge)}>
              {directionLabel}
            </span>
            {index !== undefined && (
              <span className="text-sm text-muted-foreground">#{index + 1}</span>
            )}
            <CardTitle className="text-base">
              {message.method || `${message.statusCode} ${message.statusText}`}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 w-8 p-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="font-mono text-xs bg-gray-50 rounded-md p-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap">
              {/* Request/Response Line */}
              {message.method ? (
                <div className="mb-2">
                  <span className="text-purple-600 font-semibold">{message.method}</span>
                  <span className="text-gray-700"> sip:{message.headers['To'] || 'unknown'} </span>
                  <span className="text-blue-600 font-semibold">SIP/2.0</span>
                </div>
              ) : message.statusCode ? (
                <div className="mb-2">
                  <span className="text-blue-600 font-semibold">SIP/2.0</span>
                  <span className={cn(
                    'font-semibold',
                    message.statusCode >= 200 && message.statusCode < 300 ? 'text-green-600' :
                    message.statusCode >= 300 && message.statusCode < 400 ? 'text-yellow-600' :
                    message.statusCode >= 400 ? 'text-red-600' : 'text-gray-700'
                  )}>
                    {' '}{message.statusCode} {message.statusText}
                  </span>
                </div>
              ) : null}

              {/* Headers */}
              {Object.entries(message.headers).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="text-indigo-600 font-semibold">{key}</span>
                  <span className="text-gray-700">: </span>
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}

              {/* Body */}
              {message.body && (
                <>
                  <div className="my-2 border-t border-gray-300" />
                  <div className="text-gray-700">{message.body}</div>
                </>
              )}
            </pre>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
