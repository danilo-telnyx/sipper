/**
 * Ad-hoc Credential Form
 * Allows running tests without saving credentials
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Alert, AlertDescription } from '../ui/alert'
import { Info } from 'lucide-react'

export interface AdHocCredentials {
  domain: string
  username: string
  password: string
  port: number
  transport: 'UDP' | 'TCP' | 'TLS'
}

interface AdHocCredentialFormProps {
  onSubmit: (credentials: AdHocCredentials) => void
  disabled?: boolean
}

export function AdHocCredentialForm({ onSubmit, disabled }: AdHocCredentialFormProps) {
  const [formData, setFormData] = useState<AdHocCredentials>({
    domain: '',
    username: '',
    password: '',
    port: 5060,
    transport: 'UDP',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof AdHocCredentials, string>>>({})

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AdHocCredentials, string>> = {}

    if (!formData.domain.trim()) {
      newErrors.domain = 'Domain is required'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    if (formData.port < 1 || formData.port > 65535) {
      newErrors.port = 'Port must be between 1 and 65535'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[AdHocForm] Submit clicked, formData:', formData)
    
    const isValid = validate()
    console.log('[AdHocForm] Validation result:', isValid, 'Errors:', errors)
    
    if (isValid) {
      console.log('[AdHocForm] Calling onSubmit with credentials')
      onSubmit(formData)
    } else {
      console.log('[AdHocForm] Validation failed, not submitting')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad-hoc Test Credentials</CardTitle>
        <CardDescription>
          Test SIP credentials without saving them. These credentials will only be used for this test.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            These credentials are <strong>not saved</strong> and will be discarded after the test completes.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Domain */}
          <div className="space-y-2">
            <Label htmlFor="domain">
              SIP Domain <span className="text-destructive">*</span>
            </Label>
            <Input
              id="domain"
              placeholder="sip.example.com"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              disabled={disabled}
              className={errors.domain ? 'border-destructive' : ''}
            />
            {errors.domain && (
              <p className="text-sm text-destructive">{errors.domain}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              placeholder="user123"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={disabled}
              className={errors.username ? 'border-destructive' : ''}
            />
            {errors.username && (
              <p className="text-sm text-destructive">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={disabled}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Port & Transport */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                min={1}
                max={65535}
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 5060 })}
                disabled={disabled}
                className={errors.port ? 'border-destructive' : ''}
              />
              {errors.port && (
                <p className="text-sm text-destructive">{errors.port}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="transport">Transport</Label>
              <Select
                value={formData.transport}
                onValueChange={(value: AdHocCredentials['transport']) =>
                  setFormData({ ...formData, transport: value })
                }
                disabled={disabled}
              >
                <SelectTrigger id="transport">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UDP">UDP</SelectItem>
                  <SelectItem value="TCP">TCP</SelectItem>
                  <SelectItem value="TLS">TLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={disabled}>
            Continue with These Credentials
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
