/**
 * Extended SIP Types for Enhanced Test Builder
 * Sprint 2: Frontend UI (v0.4.0)
 */

// SIP Methods
export type SIPMethod = 'INVITE' | 'REGISTER' | 'OPTIONS' | 'REFER' | 'BYE' | 'CANCEL' | 'ACK'

// Recording modes (RFC 7865)
export type RecordingMode = 'always' | 'never' | 'on-demand'

// Recording reasons (RFC 7865)
export type RecordingReason = 
  | 'Legal'
  | 'QualityAssurance'
  | 'Training'
  | 'Compliance'
  | 'Analytics'
  | 'Other'

// Transfer types
export type TransferType = 'blind' | 'attended'

// Base SIP parameters (RFC 3261 mandatory)
export interface SIPBaseParams {
  method: SIPMethod
  fromUser: string
  fromDomain: string
  toUser: string
  toDomain: string
  callId?: string
  cseq?: number
  authenticated: boolean
  username?: string
  password?: string
}

// INVITE-specific parameters
export interface INVITEParams extends SIPBaseParams {
  method: 'INVITE'
  sdp?: string
  recordingSession?: RecordingSessionParams
}

// REGISTER-specific parameters
export interface REGISTERParams extends SIPBaseParams {
  method: 'REGISTER'
  expires?: number
  contact?: string
}

// OPTIONS-specific parameters
export interface OPTIONSParams extends SIPBaseParams {
  method: 'OPTIONS'
}

// REFER-specific parameters (RFC 3515)
export interface REFERParams extends SIPBaseParams {
  method: 'REFER'
  referTo: string
  transferType: TransferType
  replaces?: string // For attended transfer (RFC 3891)
  referredBy?: string
}

// Recording session metadata (RFC 7865)
export interface RecordingSessionParams {
  sessionId: string
  reason: RecordingReason
  mode: RecordingMode
  customReason?: string
}

// Union type for all SIP parameters
export type SIPTestParams = 
  | INVITEParams
  | REGISTERParams
  | OPTIONSParams
  | REFERParams

// Validation result
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  rfc?: string
}

export interface ValidationWarning {
  field: string
  message: string
  rfc?: string
}

// SIP Test configuration (extends base TestConfiguration)
export interface SIPTestConfiguration {
  credentialId: string
  sipParams: SIPTestParams
  endpoint?: string
  timeout?: number
}

// Method metadata for UI
export interface MethodMetadata {
  value: SIPMethod
  label: string
  description: string
  icon: string
  complexity: 'basic' | 'intermediate' | 'advanced'
  rfcs: string[]
  requiresAuth: boolean
  supportsRecording: boolean
}
