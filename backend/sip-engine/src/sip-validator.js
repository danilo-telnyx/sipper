/**
 * SIP Message Parameter Validator
 * RFC 3261 Compliance Checker
 */

export class SIPValidator {
  /**
   * Validate mandatory parameters for any SIP request
   */
  static validateMandatoryParams(params, method) {
    const errors = [];
    
    // RFC 3261 Section 8.1.1 - Mandatory headers for all requests
    const requiredFields = ['fromUser', 'fromDomain', 'toUser', 'toDomain'];
    
    for (const field of requiredFields) {
      if (!params[field] || params[field].trim() === '') {
        errors.push(`Missing required parameter: ${field}`);
      }
    }
    
    // Method-specific validation
    switch (method) {
      case 'INVITE':
        this.validateINVITE(params, errors);
        break;
      case 'REGISTER':
        this.validateREGISTER(params, errors);
        break;
      case 'REFER':
        this.validateREFER(params, errors);
        break;
      case 'OPTIONS':
        this.validateOPTIONS(params, errors);
        break;
      case 'BYE':
      case 'CANCEL':
      case 'ACK':
        this.validateDialogMethod(params, errors);
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: this.generateWarnings(params, method)
    };
  }
  
  /**
   * Validate INVITE-specific parameters (RFC 3261)
   */
  static validateINVITE(params, errors) {
    // Contact header is mandatory for INVITE
    if (!params.contact && !params.fromUser) {
      errors.push('INVITE requires Contact header or fromUser for auto-generation');
    }
    
    // If SDP is provided, validate basic structure
    if (params.sdp) {
      if (typeof params.sdp !== 'string') {
        errors.push('SDP must be a string');
      } else if (!params.sdp.includes('v=0')) {
        errors.push('Invalid SDP: missing version line (v=0)');
      }
    }
  }
  
  /**
   * Validate REGISTER-specific parameters (RFC 3261)
   */
  static validateREGISTER(params, errors) {
    // REGISTER requires username
    if (!params.username) {
      errors.push('REGISTER requires username parameter');
    }
    
    // Validate expires value
    if (params.expires !== undefined) {
      const expires = parseInt(params.expires);
      if (isNaN(expires) || expires < 0) {
        errors.push('expires must be a non-negative integer');
      }
      if (expires > 0 && expires < 60) {
        errors.push('expires should be at least 60 seconds (RFC recommendation)');
      }
    }
  }
  
  /**
   * Validate REFER-specific parameters (RFC 3515)
   */
  static validateREFER(params, errors) {
    // Refer-To is mandatory for REFER
    if (!params.referTo) {
      errors.push('REFER requires referTo parameter (target URI)');
    } else {
      // Validate URI format
      if (!params.referTo.startsWith('sip:') && !params.referTo.startsWith('sips:')) {
        errors.push('referTo must be a valid SIP URI (sip: or sips:)');
      }
    }
    
    // Validate Replaces header if provided (RFC 3891)
    if (params.replaces) {
      if (!params.replaces.includes(';to-tag=') || !params.replaces.includes(';from-tag=')) {
        errors.push('Replaces header must include to-tag and from-tag parameters');
      }
    }
  }
  
  /**
   * Validate OPTIONS-specific parameters (RFC 3261)
   */
  static validateOPTIONS(params, errors) {
    // OPTIONS has no method-specific mandatory parameters beyond base SIP
    // But validate Accept header if provided
    if (params.accept && !params.accept.includes('/')) {
      errors.push('Accept header must be a valid media type (e.g., application/sdp)');
    }
  }
  
  /**
   * Validate in-dialog methods (BYE, CANCEL, ACK)
   */
  static validateDialogMethod(params, errors) {
    // In-dialog methods require dialog identifiers
    if (!params.callId) {
      errors.push('In-dialog methods require callId from original request');
    }
    if (!params.fromTag) {
      errors.push('In-dialog methods require fromTag from original request');
    }
    if (!params.cseq) {
      errors.push('In-dialog methods require cseq from original request');
    }
  }
  
  /**
   * Validate Recording Session parameters (RFC 7865)
   */
  static validateRecordingSession(params, errors) {
    if (!params.sessionId) {
      errors.push('Recording session requires sessionId (UUID)');
    }
    
    if (!params.reason) {
      errors.push('Recording session requires reason (e.g., Legal, QualityAssurance)');
    }
    
    const validReasons = ['Legal', 'QualityAssurance', 'Training', 'CustomerApproval'];
    if (params.reason && !validReasons.includes(params.reason)) {
      errors.push(`Invalid recording reason. Must be one of: ${validReasons.join(', ')}`);
    }
  }
  
  /**
   * Generate warnings for optional but recommended parameters
   */
  static generateWarnings(params, method) {
    const warnings = [];
    
    // Warn if Max-Forwards is too low
    if (params.maxForwards !== undefined && params.maxForwards < 50) {
      warnings.push('Max-Forwards below 50 may cause routing issues');
    }
    
    // Warn if no User-Agent
    if (!params.userAgent && method !== 'ACK' && method !== 'CANCEL') {
      warnings.push('User-Agent header recommended for debugging');
    }
    
    // INVITE without SDP (late media negotiation)
    if (method === 'INVITE' && !params.sdp) {
      warnings.push('INVITE without SDP requires media negotiation in 200 OK (late offer)');
    }
    
    return warnings;
  }
  
  /**
   * Validate URI format (basic)
   */
  static validateURI(uri) {
    const sipUriPattern = /^sips?:[^@]+@[^:]+(?::\d+)?$/;
    return sipUriPattern.test(uri);
  }
  
  /**
   * Validate domain format
   */
  static validateDomain(domain) {
    const domainPattern = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$|^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return domainPattern.test(domain);
  }
}
