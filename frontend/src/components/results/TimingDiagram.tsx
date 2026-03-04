import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { TestTiming } from '../../types/index'
import { formatDuration } from '../../lib/utils'
import { CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'

interface TimingDiagramProps {
  timings: TestTiming[]
}

export function TimingDiagram({ timings }: TimingDiagramProps) {
  if (timings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8 text-muted-foreground">
          No timing data available
        </CardContent>
      </Card>
    )
  }

  const maxDuration = Math.max(...timings.map(t => t.duration))
  const totalDuration = timings.reduce((sum, t) => sum + t.duration, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timing Diagram</CardTitle>
        <CardDescription>
          Step-by-step execution timeline • Total: {formatDuration(totalDuration)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timings.map((timing, index) => {
            const widthPercent = (timing.duration / maxDuration) * 100
            const startTime = timings
              .slice(0, index)
              .reduce((sum, t) => sum + t.duration, 0)

            return (
              <div key={index} className="space-y-2">
                {/* Timeline Item */}
                <div className="flex items-center gap-3">
                  {/* Timestamp */}
                  <div className="flex items-center gap-2 w-32 flex-shrink-0">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">
                      +{formatDuration(startTime)}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium truncate">
                        {timing.event}
                      </span>
                      {timing.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDuration(timing.duration)}
                      </span>
                    </div>

                    {/* Duration Bar */}
                    <div className="h-6 bg-gray-100 rounded-md overflow-hidden relative">
                      <div
                        className={`h-full transition-all duration-300 ${
                          timing.success
                            ? 'bg-gradient-to-r from-green-400 to-green-500'
                            : 'bg-gradient-to-r from-red-400 to-red-500'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      >
                        <div className="h-full flex items-center px-2">
                          <span className="text-xs font-semibold text-white">
                            {formatDuration(timing.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrow between items (except last) */}
                {index < timings.length - 1 && (
                  <div className="flex items-center gap-3 ml-32 pl-3">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="h-px bg-gray-200 flex-1" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Steps</div>
            <div className="text-2xl font-bold">{timings.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Successful</div>
            <div className="text-2xl font-bold text-green-600">
              {timings.filter(t => t.success).length}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Failed</div>
            <div className="text-2xl font-bold text-red-600">
              {timings.filter(t => !t.success).length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
