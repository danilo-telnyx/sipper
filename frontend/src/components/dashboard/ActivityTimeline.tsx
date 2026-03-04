import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TestResult } from '../../types/index'
import { formatDate } from '../../lib/utils'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  User,
  Key,
  Activity,
  AlertCircle,
} from 'lucide-react'

interface ActivityTimelineProps {
  tests: TestResult[]
  isLoading?: boolean
  maxItems?: number
}

interface TimelineEvent {
  id: string
  type: 'test-completed' | 'test-started' | 'test-failed' | 'credential-added' | 'user-action'
  title: string
  description: string
  timestamp: string
  icon: React.ReactNode
  color: string
  success?: boolean
}

export function ActivityTimeline({ tests, isLoading, maxItems = 10 }: ActivityTimelineProps) {
  const events = useMemo(() => {
    const timelineEvents: TimelineEvent[] = tests.map((test) => {
      const isCompleted = test.status === 'completed'
      const isRunning = test.status === 'running' || test.status === 'pending'
      
      return {
        id: test.id,
        type: isRunning ? 'test-started' : test.success ? 'test-completed' : 'test-failed',
        title: isRunning 
          ? `Test started: ${test.testType.replace(/-/g, ' ')}`
          : test.success
          ? `Test passed: ${test.testType.replace(/-/g, ' ')}`
          : `Test failed: ${test.testType.replace(/-/g, ' ')}`,
        description: `${test.credentialName} - Score: ${test.score}${
          test.duration ? ` (${Math.round(test.duration / 1000)}s)` : ''
        }`,
        timestamp: test.startedAt,
        icon: isRunning ? (
          <Clock className="h-4 w-4" />
        ) : test.success ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        ),
        color: isRunning
          ? 'bg-yellow-500'
          : test.success
          ? 'bg-green-500'
          : 'bg-red-500',
        success: test.success,
      } as TimelineEvent
    })

    // Sort by timestamp (most recent first)
    timelineEvents.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return timelineEvents.slice(0, maxItems)
  }, [tests, maxItems])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  {i < 4 && <div className="w-0.5 h-12 bg-muted animate-pulse" />}
                </div>
                <div className="flex-1 pb-8 space-y-2">
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-64 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-2">Activity will appear here as you run tests</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-4 group">
              {/* Timeline marker */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center h-8 w-8 rounded-full ${event.color} text-white transition-transform group-hover:scale-110`}
                >
                  {event.icon}
                </div>
                {index < events.length - 1 && (
                  <div className="w-0.5 h-full bg-border my-1" />
                )}
              </div>

              {/* Event content */}
              <div className={`flex-1 ${index < events.length - 1 ? 'pb-8' : 'pb-2'}`}>
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {event.title}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {event.description}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatRelativeTime(event.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const date = new Date(timestamp)
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else {
    return formatDate(timestamp)
  }
}
