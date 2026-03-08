/**
 * Recording Metadata Form Component
 * RFC 7865 - Session Recording Metadata
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Badge } from '../ui/badge'
import { Mic, MicOff } from 'lucide-react'
import type { RecordingSessionParams, RecordingMode, RecordingReason } from '../../types/sip'
import { v4 as uuidv4 } from 'uuid'

interface RecordingMetadataFormProps {
  value?: RecordingSessionParams
  onChange: (value: RecordingSessionParams | undefined) => void
  disabled?: boolean
}

export function RecordingMetadataForm({
  value,
  onChange,
  disabled = false,
}: RecordingMetadataFormProps) {
  const [enabled, setEnabled] = useState(!!value)
  const [sessionId, setSessionId] = useState(value?.sessionId || '')
  const [reason, setReason] = useState<RecordingReason>(value?.reason || 'QualityAssurance')
  const [mode, setMode] = useState<RecordingMode>(value?.mode || 'always')
  const [customReason, setCustomReason] = useState(value?.customReason || '')

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    if (checked) {
      const newSessionId = sessionId || uuidv4()
      setSessionId(newSessionId)
      onChange({
        sessionId: newSessionId,
        reason,
        mode,
        ...(reason === 'Other' && customReason && { customReason }),
      })
    } else {
      onChange(undefined)
    }
  }

  const handleReasonChange = (newReason: RecordingReason) => {
    setReason(newReason)
    if (enabled) {
      onChange({
        sessionId,
        reason: newReason,
        mode,
        ...(newReason === 'Other' && customReason && { customReason }),
      })
    }
  }

  const handleModeChange = (newMode: RecordingMode) => {
    setMode(newMode)
    if (enabled) {
      onChange({
        sessionId,
        reason,
        mode: newMode,
        ...(reason === 'Other' && customReason && { customReason }),
      })
    }
  }

  const handleCustomReasonChange = (value: string) => {
    setCustomReason(value)
    if (enabled && reason === 'Other') {
      onChange({
        sessionId,
        reason,
        mode,
        customReason: value,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Session Recording (Optional)</CardTitle>
            <CardDescription>
              RFC 7865 - Session Recording Metadata
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {enabled ? (
              <Mic className="h-5 w-5 text-primary" />
            ) : (
              <MicOff className="h-5 w-5 text-muted-foreground" />
            )}
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={disabled}
            />
          </div>
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-4">
          {/* Session ID */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Session ID
              <Badge variant="outline" className="text-xs">UUID</Badge>
            </Label>
            <Input
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled={disabled}
              placeholder="Auto-generated UUID"
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for this recording session
            </p>
          </div>

          {/* Recording Reason */}
          <div className="space-y-2">
            <Label>Recording Reason</Label>
            <Select value={reason} onValueChange={handleReasonChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Legal">Legal Compliance</SelectItem>
                <SelectItem value="QualityAssurance">Quality Assurance</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Compliance">Regulatory Compliance</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Other">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Purpose of the recording session
            </p>
          </div>

          {/* Custom Reason (if Other selected) */}
          {reason === 'Other' && (
            <div className="space-y-2">
              <Label>Custom Reason</Label>
              <Input
                placeholder="Specify custom reason"
                value={customReason}
                onChange={(e) => handleCustomReasonChange(e.target.value)}
                disabled={disabled}
              />
            </div>
          )}

          {/* Recording Mode */}
          <div className="space-y-2">
            <Label>Recording Mode</Label>
            <Select value={mode} onValueChange={handleModeChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always (from call start)</SelectItem>
                <SelectItem value="never">Never (disabled)</SelectItem>
                <SelectItem value="on-demand">On-Demand (start/stop during call)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              When recording should be active
            </p>
          </div>

          {/* RFC Reference */}
          <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground">
            <strong>RFC 7865:</strong> Session Recording Metadata. Recording-Session header 
            carries metadata about session recording including session ID, reason, and mode.
          </div>

          <Badge variant="outline" className="text-xs">RFC 7865</Badge>
        </CardContent>
      )}
    </Card>
  )
}
