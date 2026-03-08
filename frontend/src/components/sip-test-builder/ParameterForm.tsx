/**
 * Parameter Form Component
 * Dynamic form for SIP base parameters (RFC 3261 mandatory fields)
 */

import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'

interface ParameterFormProps {
  fromUser: string
  fromDomain: string
  toUser: string
  toDomain: string
  username: string
  password: string
  authenticated: boolean
  onFromUserChange: (value: string) => void
  onFromDomainChange: (value: string) => void
  onToUserChange: (value: string) => void
  onToDomainChange: (value: string) => void
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  disabled?: boolean
}

export function ParameterForm({
  fromUser,
  fromDomain,
  toUser,
  toDomain,
  username,
  password,
  authenticated,
  onFromUserChange,
  onFromDomainChange,
  onToUserChange,
  onToDomainChange,
  onUsernameChange,
  onPasswordChange,
  disabled = false,
}: ParameterFormProps) {
  return (
    <div className="space-y-4">
      {/* From Header */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          From User
          <Badge variant="destructive" className="text-xs">Required</Badge>
        </Label>
        <Input
          placeholder="alice"
          value={fromUser}
          onChange={(e) => onFromUserChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          SIP username for the From header (e.g., alice)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          From Domain
          <Badge variant="destructive" className="text-xs">Required</Badge>
        </Label>
        <Input
          placeholder="example.com"
          value={fromDomain}
          onChange={(e) => onFromDomainChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          SIP domain for the From header (e.g., example.com)
        </p>
      </div>

      {/* To Header */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          To User
          <Badge variant="destructive" className="text-xs">Required</Badge>
        </Label>
        <Input
          placeholder="bob"
          value={toUser}
          onChange={(e) => onToUserChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          SIP username for the To header (e.g., bob)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          To Domain
          <Badge variant="destructive" className="text-xs">Required</Badge>
        </Label>
        <Input
          placeholder="example.com"
          value={toDomain}
          onChange={(e) => onToDomainChange(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          SIP domain for the To header (e.g., example.com)
        </p>
      </div>

      {/* Authentication Credentials (conditional) */}
      {authenticated && (
        <>
          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-3">Authentication Credentials</h4>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Username
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </Label>
            <Input
              placeholder="alice"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Username for Digest authentication
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Password
              <Badge variant="destructive" className="text-xs">Required</Badge>
            </Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground">
              Password for Digest authentication (MD5 hashed)
            </p>
          </div>
        </>
      )}

      {/* RFC Reference */}
      <div className="bg-muted/50 p-3 rounded-md text-xs text-muted-foreground">
        <strong>RFC 3261 §8.1.1:</strong> Mandatory headers include Via, From (with tag), 
        To, Call-ID, CSeq, and Max-Forwards. Contact required for INVITE and REGISTER.
      </div>
    </div>
  )
}
