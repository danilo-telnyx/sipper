/**
 * SIP Parameter Validation Utility
 * Frontend validation based on RFC 3261 requirements
 */

import type { 
  SIPTestParams, 
  ValidationResult, 
  ValidationError, 
  ValidationWarning,
  SIPMethod,
} from '../types/sip'

export function validateSIPParams(params: SIPTestParams): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Validate mandatory base fields (RFC 3261)
  if (!params.fromUser || params.fromUser.trim() === '') {
    errors.push({
      field: 'fromUser',
      message: 'From User is required',
      rfc: 'RFC 3261 §8.1.1.3',
    })
  }

  if (!params.fromDomain || params.fromDomain.trim() === '') {
    errors.push({
      field: 'fromDomain',
      message: 'From Domain is required',
      rfc: 'RFC 3261 §8.1.1.3',
    })
  }

  if (!params.toUser || params.toUser.trim() === '') {
    errors.push({
      field: 'toUser',
      message: 'To User is required',
      rfc: 'RFC 3261 §8.1.1.2',
    })
  }

  if (!params.toDomain || params.toDomain.trim() === '') {
    errors.push({
      field: 'toDomain',
      message: 'To Domain is required',
      rfc: 'RFC 3261 §8.1.1.2',
    })
  }

  // Validate authentication credentials if enabled
  if (params.authenticated) {
    if (!params.username || params.username.trim() === '') {
      errors.push({
        field: 'username',
        message: 'Username is required for authenticated flow',
        rfc: 'RFC 2617 §3.2.2',
      })
    }

    if (!params.password || params.password.trim() === '') {
      errors.push({
        field: 'password',
        message: 'Password is required for authenticated flow',
        rfc: 'RFC 2617 §3.2.2',
      })
    }
  }

  // Method-specific validation
  switch (params.method) {
    case 'INVITE':
      validateINVITE(params, errors, warnings)
      break
    case 'REGISTER':
      validateREGISTER(params, errors, warnings)
      break
    case 'OPTIONS':
      validateOPTIONS(params, errors, warnings)
      break
    case 'REFER':
      validateREFER(params, errors, warnings)
      break
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateINVITE(
  params: SIPTestParams & { method: 'INVITE' },
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  // SDP is optional but recommended
  if (!params.sdp || params.sdp.trim() === '') {
    warnings.push({
      field: 'sdp',
      message: 'SDP body is recommended for INVITE to negotiate media',
      rfc: 'RFC 3261 §13',
    })
  } else {
    // Basic SDP validation
    if (!params.sdp.includes('v=')) {
      errors.push({
        field: 'sdp',
        message: 'SDP must include version field (v=)',
        rfc: 'RFC 4566 §5',
      })
    }
    if (!params.sdp.includes('m=')) {
      errors.push({
        field: 'sdp',
        message: 'SDP must include media description (m=)',
        rfc: 'RFC 4566 §5.14',
      })
    }
  }

  // Recording metadata validation
  if (params.recordingSession) {
    if (!params.recordingSession.sessionId) {
      errors.push({
        field: 'recordingSession.sessionId',
        message: 'Session ID is required for recording',
        rfc: 'RFC 7865 §5.1',
      })
    }
    if (!params.recordingSession.reason) {
      errors.push({
        field: 'recordingSession.reason',
        message: 'Recording reason is required',
        rfc: 'RFC 7865 §5.2',
      })
    }
    if (params.recordingSession.reason === 'Other' && !params.recordingSession.customReason) {
      warnings.push({
        field: 'recordingSession.customReason',
        message: 'Custom reason recommended when reason is "Other"',
        rfc: 'RFC 7865 §5.2',
      })
    }
  }
}

function validateREGISTER(
  params: SIPTestParams & { method: 'REGISTER' },
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  // REGISTER specific validation
  // Contact header is mandatory for REGISTER
  if (!params.authenticated) {
    warnings.push({
      field: 'authenticated',
      message: 'REGISTER typically requires authentication',
      rfc: 'RFC 3261 §10',
    })
  }
}

function validateOPTIONS(
  params: SIPTestParams & { method: 'OPTIONS' },
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  // OPTIONS is typically unauthenticated
  if (params.authenticated) {
    warnings.push({
      field: 'authenticated',
      message: 'OPTIONS is typically sent without authentication',
      rfc: 'RFC 3261 §11',
    })
  }
}

function validateREFER(
  params: SIPTestParams & { method: 'REFER' },
  errors: ValidationError[],
  warnings: ValidationWarning[]
) {
  // Refer-To is mandatory for REFER
  if (!params.referTo || params.referTo.trim() === '') {
    errors.push({
      field: 'referTo',
      message: 'Refer-To header is mandatory for REFER method',
      rfc: 'RFC 3515 §2.4.1',
    })
  } else {
    // Basic SIP URI validation
    if (!params.referTo.startsWith('sip:') && !params.referTo.startsWith('sips:')) {
      errors.push({
        field: 'referTo',
        message: 'Refer-To must be a valid SIP URI (sip: or sips:)',
        rfc: 'RFC 3515 §2.4.1',
      })
    }
  }

  // Replaces validation for attended transfer
  if (params.replaces) {
    if (!params.replaces.includes('from-tag=') || !params.replaces.includes('to-tag=')) {
      errors.push({
        field: 'replaces',
        message: 'Replaces header must include from-tag and to-tag parameters',
        rfc: 'RFC 3891 §3',
      })
    }
  }

  // REFER typically requires authentication
  if (!params.authenticated) {
    warnings.push({
      field: 'authenticated',
      message: 'REFER typically requires authentication',
      rfc: 'RFC 3515 §2.4.7',
    })
  }
}

// Domain validation helper
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$|^localhost$/i
  return domainRegex.test(domain)
}

// SIP URI validation helper
export function isValidSIPURI(uri: string): boolean {
  const sipUriRegex = /^sips?:[a-z0-9._-]+@[a-z0-9.-]+(?::[0-9]{1,5})?$/i
  return sipUriRegex.test(uri)
}
