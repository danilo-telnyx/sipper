/**
 * Message Sequence Item Component
 * Individual message in the SIP flow diagram
 */

import { ChevronDown, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import type { SIPFlowMessage, SIPResponseClass } from './types'

interface MessageSequenceItemProps {
  message: SIPFlowMessage
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
}

export function MessageSequenceItem({
  message,
  index,
  isExpanded,
  onToggleExpand,
}: MessageSequenceItemProps) {
  const isRequest = !!message.method
  const isClientToServer = message.direction === 'client-to-server'

  const responseClass = getResponseClass(message)
  const colorClass = getColorClass(responseClass)

  const label = isRequest
    ? message.method
    : `${message.statusCode} ${message.statusText}`

  const date = new Date(message.timestamp)
  const timestamp = date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + '.' + String(date.getMilliseconds()).padStart(3, '0')

  return (
    <div className="relative">
      {/* Sequence Number */}
      <div className="absolute -left-12 top-1 text-xs text-muted-foreground font-mono">
        {index + 1}
      </div>

      {/* Message Arrow */}
      <div className="flex items-center gap-4">
        {isClientToServer ? (
          <>
            {/* Client side */}
            <div className="flex-1"></div>
            
            {/* Arrow */}
            <div className="flex-1 relative">
              <div className={`h-0.5 ${colorClass} relative`}>
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 
                  border-l-8 border-y-4 border-y-transparent ${colorClass}`}
                />
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpand}
                  className="h-auto py-1 px-2"
                >
                  <Badge variant={responseClass === 'request' ? 'default' : getVariant(responseClass)} className="text-xs">
                    {label}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronRight className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Server side */}
            <div className="flex-1"></div>
          </>
        ) : (
          <>
            {/* Client side */}
            <div className="flex-1"></div>
            
            {/* Arrow */}
            <div className="flex-1 relative">
              <div className={`h-0.5 ${colorClass} relative`}>
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 
                  border-r-8 border-y-4 border-y-transparent ${colorClass}`}
                />
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpand}
                  className="h-auto py-1 px-2"
                >
                  <Badge variant={responseClass === 'request' ? 'default' : getVariant(responseClass)} className="text-xs">
                    {label}
                  </Badge>
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3 ml-1" />
                  ) : (
                    <ChevronRight className="h-3 w-3 ml-1" />
                  )}
                </Button>
              </div>
            </div>

            {/* Server side */}
            <div className="flex-1"></div>
          </>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 ml-12 mr-12 p-4 bg-muted/50 rounded-md border">
          <div className="space-y-3">
            {/* Timestamp */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="font-mono">{timestamp}</span>
            </div>

            {/* Headers */}
            <div>
              <div className="text-xs font-semibold mb-2">Headers</div>
              <div className="space-y-1 text-xs font-mono max-h-48 overflow-y-auto">
                {Object.entries(message.headers).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="text-muted-foreground min-w-[120px]">{key}:</span>
                    <span className="flex-1 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            {message.body && (
              <div>
                <div className="text-xs font-semibold mb-2">Body</div>
                <pre className="text-xs font-mono bg-background p-3 rounded border overflow-x-auto">
                  {message.body}
                </pre>
              </div>
            )}

            {/* Raw Message */}
            {message.raw && (
              <details>
                <summary className="text-xs font-semibold cursor-pointer hover:text-primary">
                  Raw Message
                </summary>
                <pre className="mt-2 text-xs font-mono bg-background p-3 rounded border overflow-x-auto">
                  {message.raw}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function getResponseClass(message: SIPFlowMessage): SIPResponseClass {
  if (message.method) return 'request'
  if (!message.statusCode) return 'request'
  
  const code = message.statusCode
  if (code >= 100 && code < 200) return '1xx'
  if (code >= 200 && code < 300) return '2xx'
  if (code >= 300 && code < 400) return '3xx'
  if (code >= 400 && code < 500) return '4xx'
  if (code >= 500 && code < 600) return '5xx'
  
  return 'request'
}

function getColorClass(responseClass: SIPResponseClass): string {
  switch (responseClass) {
    case 'request':
      return 'bg-primary'
    case '1xx':
      return 'bg-blue-500'
    case '2xx':
      return 'bg-green-500'
    case '3xx':
      return 'bg-yellow-500'
    case '4xx':
      return 'bg-orange-500'
    case '5xx':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

function getVariant(responseClass: SIPResponseClass): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (responseClass) {
    case '2xx':
      return 'default'
    case '4xx':
    case '5xx':
      return 'destructive'
    default:
      return 'secondary'
  }
}
