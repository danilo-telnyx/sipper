/**
 * Authentication Toggle Component
 * Toggle for authenticated vs unauthenticated SIP flow
 */

import { Shield, ShieldOff } from 'lucide-react'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'

interface AuthenticationToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  disabled?: boolean
}

export function AuthenticationToggle({
  enabled,
  onToggle,
  disabled = false,
}: AuthenticationToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
      <div className="flex items-start gap-3">
        <div className={`
          p-2 rounded-md
          ${enabled ? 'bg-primary text-primary-foreground' : 'bg-muted'}
        `}>
          {enabled ? (
            <Shield className="h-5 w-5" />
          ) : (
            <ShieldOff className="h-5 w-5" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Label htmlFor="auth-toggle" className="font-semibold cursor-pointer">
              {enabled ? 'Authenticated Flow' : 'Unauthenticated Flow'}
            </Label>
            <Badge variant={enabled ? 'default' : 'outline'} className="text-xs">
              {enabled ? 'Digest MD5' : 'No Auth'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {enabled
              ? 'Test with authentication headers. Server will challenge with 401/407 and expect digest credentials.'
              : 'Send unauthenticated message. Useful for testing server response to unauthorized requests.'
            }
          </p>
          {enabled && (
            <p className="text-xs text-muted-foreground mt-2">
              <strong>RFC 2617:</strong> HTTP Digest Authentication
            </p>
          )}
        </div>
      </div>
      <Switch
        id="auth-toggle"
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        className="ml-4"
      />
    </div>
  )
}
