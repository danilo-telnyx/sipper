import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface AdvancedOptionsProps {
  options: {
    endpoint?: string
    timeout?: number
    retries?: number
    concurrentCalls?: number
  }
  onChange: (options: any) => void
  disabled?: boolean
}

export function AdvancedOptions({ options, onChange, disabled = false }: AdvancedOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Advanced Options</CardTitle>
            <CardDescription>
              Configure timeout, retries, and concurrency (optional)
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Test Endpoint Override</Label>
            <Input
              id="endpoint"
              value={options.endpoint || ''}
              onChange={(e) => onChange({ ...options, endpoint: e.target.value })}
              disabled={disabled}
              placeholder="sip:echo@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default test endpoint
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="1"
                max="300"
                value={options.timeout || 30}
                onChange={(e) => onChange({ ...options, timeout: parseInt(e.target.value) })}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retries">Retries</Label>
              <Input
                id="retries"
                type="number"
                min="0"
                max="10"
                value={options.retries || 3}
                onChange={(e) => onChange({ ...options, retries: parseInt(e.target.value) })}
                disabled={disabled}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="concurrent">Concurrent Calls</Label>
              <Input
                id="concurrent"
                type="number"
                min="1"
                max="10"
                value={options.concurrentCalls || 1}
                onChange={(e) => onChange({ ...options, concurrentCalls: parseInt(e.target.value) })}
                disabled={disabled}
              />
            </div>
          </div>

          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p>• Timeout: Maximum time to wait for each operation</p>
            <p>• Retries: Number of retry attempts on failure</p>
            <p>• Concurrent Calls: Number of simultaneous calls (for load testing)</p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
