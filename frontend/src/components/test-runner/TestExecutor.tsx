import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { LiveLog } from './LiveLog'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  X
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { TestProgress, TestLog } from '../../types/index'

interface TestExecutorProps {
  isRunning: boolean
  progress: TestProgress | null
  logs: TestLog[]
  elapsedTime: number
  onCancel: () => void
  onRetry: () => void
  onViewResults: () => void
  testCompleted: boolean
  testSuccess: boolean | null
}

export function TestExecutor({
  isRunning,
  progress,
  logs,
  elapsedTime,
  onCancel,
  onRetry,
  onViewResults,
  testCompleted,
  testSuccess,
}: TestExecutorProps) {
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    if (testCompleted) {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [testCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Test Execution</CardTitle>
            <CardDescription>
              {isRunning
                ? 'Test in progress...'
                : testCompleted
                ? testSuccess
                  ? 'Test completed successfully'
                  : 'Test failed'
                : 'Ready to start'}
            </CardDescription>
          </div>
          
          {/* Elapsed Time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono font-medium">{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Success/Failure Animation */}
        {showAnimation && testCompleted && (
          <div className="flex items-center justify-center py-8">
            <div className={cn(
              "flex flex-col items-center gap-4 animate-in zoom-in-50 duration-500",
              testSuccess ? "text-green-600" : "text-red-600"
            )}>
              {testSuccess ? (
                <>
                  <CheckCircle2 className="h-20 w-20 animate-pulse" />
                  <p className="text-xl font-bold">Test Passed!</p>
                </>
              ) : (
                <>
                  <XCircle className="h-20 w-20 animate-pulse" />
                  <p className="text-xl font-bold">Test Failed</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        {isRunning && progress && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{progress.currentStep}</span>
              <span className="text-muted-foreground">{progress.progress}%</span>
            </div>
            <Progress value={progress.progress} className="h-2" />
            {progress.message && (
              <p className="text-sm text-muted-foreground">{progress.message}</p>
            )}
          </div>
        )}

        {/* Status Badge */}
        {progress && (
          <div className="flex items-center gap-2">
            <Badge variant={
              progress.status === 'running' ? 'default' :
              progress.status === 'completed' ? 'success' :
              progress.status === 'failed' ? 'destructive' :
              'secondary'
            }>
              {progress.status}
            </Badge>
          </div>
        )}

        {/* Live Log Output */}
        <LiveLog logs={logs} isRunning={isRunning} />

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {isRunning ? (
            <Button
              variant="destructive"
              onClick={onCancel}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel Test
            </Button>
          ) : testCompleted ? (
            <>
              <Button
                variant="outline"
                onClick={onRetry}
                className="flex-1"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry Test
              </Button>
              <Button
                onClick={onViewResults}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Full Results
              </Button>
            </>
          ) : null}
        </div>

        {/* Keyboard Shortcuts Hint */}
        {isRunning && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Press <kbd className="px-1.5 py-0.5 bg-muted rounded">ESC</kbd> to cancel
          </div>
        )}
      </CardContent>
    </Card>
  )
}
