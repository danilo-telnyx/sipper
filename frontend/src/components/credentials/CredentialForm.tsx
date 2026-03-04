import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import type { SipCredential, CreateCredentialRequest } from '../../types/index'

interface CredentialFormProps {
  credential?: SipCredential
  onSubmit: (data: CreateCredentialRequest) => void
  onCancel: () => void
  isSubmitting?: boolean
}

interface FormData extends CreateCredentialRequest {
  authRealm?: string
  telnyxEnabled?: boolean
  telnyxApiKey?: string
  telnyxConnectionId?: string
}

export function CredentialForm({
  credential,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CredentialFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [telnyxEnabled, setTelnyxEnabled] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: credential
      ? {
          name: credential.name,
          username: credential.username,
          password: '',
          domain: credential.domain,
          proxy: credential.proxy,
          port: credential.port,
          transport: credential.transport,
        }
      : {
          port: 5060,
          transport: 'UDP',
        },
  })

  const transport = watch('transport')

  // Auto-adjust port based on transport
  useEffect(() => {
    if (!credential) {
      const defaultPorts = { UDP: 5060, TCP: 5060, TLS: 5061 }
      setValue('port', defaultPorts[transport as keyof typeof defaultPorts])
    }
  }, [transport, credential, setValue])

  const validateDomain = (value: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-_.]+[a-zA-Z0-9]$/
    return domainRegex.test(value) || 'Invalid domain format'
  }

  const validatePort = (value: number) => {
    return (value >= 1 && value <= 65535) || 'Port must be between 1 and 65535'
  }

  const onFormSubmit = (data: FormData) => {
    // Remove empty optional fields
    const submitData: CreateCredentialRequest = {
      name: data.name,
      username: data.username,
      password: data.password,
      domain: data.domain,
      port: data.port,
      transport: data.transport,
    }

    if (data.proxy?.trim()) {
      submitData.proxy = data.proxy.trim()
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 50, message: 'Name must not exceed 50 characters' },
          })}
          placeholder="Production SIP Account"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.name.message}
          </p>
        )}
      </div>

      {/* SIP Server */}
      <div className="space-y-2">
        <Label htmlFor="domain">
          SIP Server <span className="text-destructive">*</span>
        </Label>
        <Input
          id="domain"
          {...register('domain', {
            required: 'SIP server is required',
            validate: validateDomain,
          })}
          placeholder="sip.example.com or 192.168.1.100"
          className={errors.domain ? 'border-destructive' : ''}
        />
        {errors.domain && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.domain.message}
          </p>
        )}
      </div>

      {/* Port & Transport */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="port">
            Port <span className="text-destructive">*</span>
          </Label>
          <Input
            id="port"
            type="number"
            {...register('port', {
              required: 'Port is required',
              valueAsNumber: true,
              validate: validatePort,
            })}
            className={errors.port ? 'border-destructive' : ''}
          />
          {errors.port && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.port.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="transport">
            Transport <span className="text-destructive">*</span>
          </Label>
          <select
            id="transport"
            {...register('transport', { required: 'Transport is required' })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="UDP">UDP</option>
            <option value="TCP">TCP</option>
            <option value="TLS">TLS (Secure)</option>
          </select>
        </div>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">
          Username <span className="text-destructive">*</span>
        </Label>
        <Input
          id="username"
          {...register('username', {
            required: 'Username is required',
            minLength: { value: 1, message: 'Username is required' },
          })}
          placeholder="1234567890"
          autoComplete="off"
          className={errors.username ? 'border-destructive' : ''}
        />
        {errors.username && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">
          Password {!credential && <span className="text-destructive">*</span>}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: !credential ? 'Password is required' : false,
              minLength: credential
                ? undefined
                : { value: 6, message: 'Password must be at least 6 characters' },
            })}
            placeholder={credential ? '••••••••' : 'Enter password'}
            autoComplete="new-password"
            className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.password.message}
          </p>
        )}
        {credential && (
          <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
        )}
      </div>

      {/* Proxy (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="proxy">Outbound Proxy (Optional)</Label>
        <Input
          id="proxy"
          {...register('proxy', {
            validate: (value) => {
              if (!value?.trim()) return true
              return validateDomain(value) || 'Invalid proxy format'
            },
          })}
          placeholder="proxy.example.com"
          className={errors.proxy ? 'border-destructive' : ''}
        />
        {errors.proxy && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.proxy.message}
          </p>
        )}
      </div>

      {/* Telnyx Integration Toggle */}
      <div className="border-t pt-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label htmlFor="telnyx-toggle">Telnyx Integration</Label>
            <p className="text-xs text-muted-foreground">
              Auto-configure using Telnyx SIP credentials
            </p>
          </div>
          <Switch
            id="telnyx-toggle"
            checked={telnyxEnabled}
            onCheckedChange={setTelnyxEnabled}
          />
        </div>

        {telnyxEnabled && (
          <div className="space-y-4 pl-4 border-l-2 border-muted">
            <div className="space-y-2">
              <Label htmlFor="telnyxConnectionId">Telnyx Connection ID</Label>
              <Input
                id="telnyxConnectionId"
                {...register('telnyxConnectionId')}
                placeholder="1234567890"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telnyxApiKey">Telnyx API Key</Label>
              <Input
                id="telnyxApiKey"
                type="password"
                {...register('telnyxApiKey')}
                placeholder="KEY..."
                autoComplete="off"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Credentials will be auto-populated from Telnyx
            </p>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : credential ? 'Update Credential' : 'Add Credential'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
