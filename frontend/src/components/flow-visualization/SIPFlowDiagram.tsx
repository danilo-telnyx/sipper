/**
 * SIP Flow Diagram Component
 * Sprint 4: Flow Visualization (v0.6.0)
 * Visual sequence diagram of SIP message flow
 */

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Download, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react'
import { MessageSequenceItem } from './MessageSequenceItem'
import { FlowExport } from './FlowExport'
import type { SIPFlowData, FlowVisualizationProps } from './types'

export function SIPFlowDiagram({ 
  data, 
  onExport,
  realTime = false,
}: FlowVisualizationProps) {
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set())
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const diagramRef = useRef<HTMLDivElement>(null)

  const toggleExpanded = (messageId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev)
      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }
      return next
    })
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 200))
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50))
  const handleResetZoom = () => setZoom(100)

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  // Auto-scroll to bottom on new messages (real-time mode)
  useEffect(() => {
    if (realTime && diagramRef.current) {
      diagramRef.current.scrollTop = diagramRef.current.scrollHeight
    }
  }, [data.messages.length, realTime])

  const duration = data.endTime 
    ? ((data.endTime - data.startTime) / 1000).toFixed(2)
    : 'In Progress'

  return (
    <Card className={isFullscreen ? 'fixed inset-4 z-50 flex flex-col' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>SIP Message Flow</CardTitle>
            <CardDescription>
              {data.messages.length} messages • Duration: {duration}s
              {realTime && (
                <Badge variant="default" className="ml-2">
                  Live
                </Badge>
              )}
            </CardDescription>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
              {zoom}%
            </span>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {zoom !== 100 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
              >
                Reset
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFullscreen}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            <FlowExport data={data} diagramRef={diagramRef} onExport={onExport} />
          </div>
        </div>
      </CardHeader>

      <CardContent className={isFullscreen ? 'flex-1 overflow-hidden' : ''}>
        <div
          ref={diagramRef}
          className={`
            relative overflow-auto
            ${isFullscreen ? 'h-full' : 'max-h-[600px]'}
          `}
          style={{ fontSize: `${zoom}%` }}
        >
          {/* Participant Labels */}
          <div className="sticky top-0 bg-background z-10 border-b pb-4 mb-4">
            <div className="flex items-start justify-between gap-4 max-w-4xl mx-auto">
              <div className="flex-1 text-center">
                <div className="font-semibold text-lg">{data.clientLabel}</div>
                <div className="text-xs text-muted-foreground">Client</div>
              </div>
              <div className="flex-1"></div>
              <div className="flex-1 text-center">
                <div className="font-semibold text-lg">{data.serverLabel}</div>
                <div className="text-xs text-muted-foreground">Server</div>
              </div>
            </div>
          </div>

          {/* Message Sequence */}
          <div className="space-y-6 max-w-4xl mx-auto">
            {data.messages.map((message, index) => (
              <MessageSequenceItem
                key={message.id}
                message={message}
                index={index}
                isExpanded={expandedMessages.has(message.id)}
                onToggleExpand={() => toggleExpanded(message.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {data.messages.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No SIP messages recorded yet.</p>
              {realTime && (
                <p className="text-sm mt-2">Messages will appear here as they are sent/received.</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
