/**
 * REFER Builder Component
 * REFER-specific parameters (RFC 3515)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Switch } from '../ui/switch'
import { Info } from 'lucide-react'

interface REFERBuilderProps {
  referTo: string
  replaces: string
  onReferToChange: (value: string) => void
  onReplacesChange: (value: string) => void
  disabled?: boolean
}

export function REFERBuilder({
  referTo,
  replaces,
  onReferToChange,
  onReplacesChange,
  disabled = false,
}: REFERBuilderProps) {
  const transferType = replaces ? 'attended' : 'blind'

  return (
    <Card>
      <CardHeader>
        <CardTitle>REFER Parameters (Call Transfer)</CardTitle>
        <CardDescription>
          Configure call transfer target and type
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transfer Type Indicator */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Transfer type:
          </span>
          <Badge variant={transferType === 'attended' ? 'default' : 'outline'}>
            {transferType === 'attended' ? 'Attended Transfer' : 'Blind Transfer'}
          </Badge>
        </div>

        {/* Refer-To Header */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Refer-To (Transfer Target)
            <Badge variant="destructive" className="text-xs">Required</Badge>
          </Label>
          <Input
            placeholder="sip:target@example.com"
            value={referTo}
            onChange={(e) => onReferToChange(e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            <strong>RFC 3515:</strong> The URI to which the referee should send the INVITE.
            Format: <code className="bg-muted px-1 py-0.5 rounded">sip:user@domain</code>
          </p>
        </div>

        {/* Replaces Header (optional, for attended transfer) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Replaces (Attended Transfer)
            <Badge variant="outline" className="text-xs">Optional</Badge>
          </Label>
          <Input
            placeholder="call-id;from-tag=abc;to-tag=def"
            value={replaces}
            onChange={(e) => onReplacesChange(e.target.value)}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            <strong>RFC 3891:</strong> Replaces header for attended transfer.
            Format: <code className="bg-muted px-1 py-0.5 rounded">call-id;from-tag=X;to-tag=Y</code>
          </p>
        </div>

        {/* Transfer Type Explanation */}
        <div className="bg-muted/50 p-4 rounded-md text-sm space-y-2">
          <div>
            <strong>Blind Transfer:</strong> Transferor sends REFER, then hangs up. 
            Referee connects directly to transfer target.
          </div>
          <div>
            <strong>Attended Transfer:</strong> Transferor establishes call with target first, 
            then sends REFER with Replaces header to connect referee to target.
          </div>
        </div>

        {/* RFC References */}
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">RFC 3515 (REFER)</Badge>
          <Badge variant="outline" className="text-xs">RFC 3891 (Replaces)</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
