/**
 * SIP Test Builder - Main Component
 * Sprint 2: Frontend UI (v0.4.0)
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'
import { MethodSelector } from './MethodSelector'
import { AuthenticationToggle } from './AuthenticationToggle'
import { ParameterForm } from './ParameterForm'
import { ValidationFeedback } from './ValidationFeedback'
import { REFERBuilder } from './REFERBuilder'
import { RecordingMetadataForm } from './RecordingMetadataForm'
import { SDPEditor } from './SDPEditor'
import { validateSIPParams } from '../../utils/sip-validator'
import type { SIPTestParams, SIPMethod, ValidationResult, RecordingSessionParams } from '../../types/sip'

interface SIPTestBuilderProps {
  onParamsChange: (params: SIPTestParams) => void
  disabled?: boolean
  initialParams?: Partial<SIPTestParams>
}

export function SIPTestBuilder({
  onParamsChange,
  disabled = false,
  initialParams,
}: SIPTestBuilderProps) {
  const [method, setMethod] = useState<SIPMethod>(initialParams?.method || 'INVITE')
  const [authenticated, setAuthenticated] = useState(initialParams?.authenticated ?? false)
  const [validation, setValidation] = useState<ValidationResult>({ valid: false, errors: [], warnings: [] })

  // Base parameters
  const [fromUser, setFromUser] = useState(initialParams?.fromUser || '')
  const [fromDomain, setFromDomain] = useState(initialParams?.fromDomain || '')
  const [toUser, setToUser] = useState(initialParams?.toUser || '')
  const [toDomain, setToDomain] = useState(initialParams?.toDomain || '')
  const [username, setUsername] = useState(initialParams?.username || '')
  const [password, setPassword] = useState(initialParams?.password || '')

  // Method-specific parameters
  const [sdp, setSdp] = useState<string>('')
  const [referTo, setReferTo] = useState<string>('')
  const [replaces, setReplaces] = useState<string>('')
  const [recordingSession, setRecordingSession] = useState<RecordingSessionParams | undefined>()

  // Build current params object
  const buildParams = (): SIPTestParams => {
    const base = {
      method,
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      authenticated,
      ...(authenticated && { username, password }),
    }

    switch (method) {
      case 'INVITE':
        return {
          ...base,
          method: 'INVITE',
          ...(sdp && { sdp }),
          ...(recordingSession && { recordingSession }),
        }
      case 'REGISTER':
        return {
          ...base,
          method: 'REGISTER',
        }
      case 'OPTIONS':
        return {
          ...base,
          method: 'OPTIONS',
        }
      case 'REFER':
        return {
          ...base,
          method: 'REFER',
          referTo,
          transferType: replaces ? 'attended' : 'blind',
          ...(replaces && { replaces }),
        }
      default:
        return base as SIPTestParams
    }
  }

  // Validate and notify parent on parameter changes
  useEffect(() => {
    const params = buildParams()
    const result = validateSIPParams(params)
    setValidation(result)
    
    if (result.valid) {
      onParamsChange(params)
    }
  }, [method, authenticated, fromUser, fromDomain, toUser, toDomain, username, password, sdp, referTo, replaces, recordingSession])

  const handleMethodChange = (newMethod: SIPMethod) => {
    setMethod(newMethod)
    // Reset method-specific fields
    setSdp('')
    setReferTo('')
    setReplaces('')
    setRecordingSession(undefined)
  }

  return (
    <div className="space-y-6">
      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>SIP Method</CardTitle>
          <CardDescription>
            Select the SIP method to test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MethodSelector
            selectedMethod={method}
            onSelect={handleMethodChange}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Authentication Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>
            Enable to test authenticated SIP flow (Digest MD5)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthenticationToggle
            enabled={authenticated}
            onToggle={setAuthenticated}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Base Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>SIP Parameters</CardTitle>
          <CardDescription>
            Mandatory fields required by RFC 3261
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ParameterForm
            fromUser={fromUser}
            fromDomain={fromDomain}
            toUser={toUser}
            toDomain={toDomain}
            username={username}
            password={password}
            authenticated={authenticated}
            onFromUserChange={setFromUser}
            onFromDomainChange={setFromDomain}
            onToUserChange={setToUser}
            onToDomainChange={setToDomain}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Method-specific UI */}
      {method === 'INVITE' && (
        <>
          <SDPEditor
            value={sdp}
            onChange={setSdp}
            disabled={disabled}
          />
          <RecordingMetadataForm
            value={recordingSession}
            onChange={setRecordingSession}
            disabled={disabled}
          />
        </>
      )}

      {method === 'REFER' && (
        <REFERBuilder
          referTo={referTo}
          replaces={replaces}
          onReferToChange={setReferTo}
          onReplacesChange={setReplaces}
          disabled={disabled}
        />
      )}

      {/* Validation Feedback */}
      <ValidationFeedback validation={validation} />

      {/* RFC Compliance Badge */}
      {validation.valid && (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <div className="ml-2">
            <div className="font-semibold text-green-900">RFC Compliant</div>
            <div className="text-sm text-green-800">
              All mandatory parameters provided. Ready for testing.
            </div>
          </div>
        </Alert>
      )}
    </div>
  )
}
