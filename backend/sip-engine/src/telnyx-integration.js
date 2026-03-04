/**
 * Telnyx SIP Integration
 * Provides Telnyx-specific configurations and helper methods
 */

export class TelnyxIntegration {
  /**
   * Get Telnyx SIP endpoints by region
   */
  static getEndpoint(region = 'us-east') {
    const endpoints = {
      'us-east': {
        host: 'sip.telnyx.com',
        port: 5060,
        domain: 'sip.telnyx.com',
        description: 'Telnyx US East'
      },
      'us-west': {
        host: 'sip-us-west.telnyx.com',
        port: 5060,
        domain: 'sip.telnyx.com',
        description: 'Telnyx US West'
      },
      'eu': {
        host: 'sip-eu.telnyx.com',
        port: 5060,
        domain: 'sip.telnyx.com',
        description: 'Telnyx Europe'
      },
      'au': {
        host: 'sip-au.telnyx.com',
        port: 5060,
        domain: 'sip.telnyx.com',
        description: 'Telnyx Australia'
      }
    };

    return endpoints[region] || endpoints['us-east'];
  }

  /**
   * Create Telnyx SIP credentials configuration
   */
  static createCredentials(username, password, region = 'us-east') {
    const endpoint = this.getEndpoint(region);
    
    return {
      ...endpoint,
      username,
      password,
      transport: 'UDP'
    };
  }

  /**
   * Validate Telnyx SIP URI format
   */
  static validateSIPURI(uri) {
    // Telnyx format: sip:username@sip.telnyx.com or sip:+15551234567@sip.telnyx.com
    const telnyxPattern = /^sip:([a-zA-Z0-9_\-+.]+)@sip.*\.telnyx\.com$/;
    return telnyxPattern.test(uri);
  }

  /**
   * Parse Telnyx SIP username (can be alphanumeric or E.164)
   */
  static parseUsername(username) {
    const result = {
      raw: username,
      isE164: false,
      isAlphanumeric: false
    };

    // Check if E.164 format (+1234567890)
    if (/^\+\d{10,15}$/.test(username)) {
      result.isE164 = true;
      result.countryCode = username.substring(1, username.length - 10);
      result.number = username.substring(username.length - 10);
    } else if (/^[a-zA-Z0-9_\-]+$/.test(username)) {
      result.isAlphanumeric = true;
    }

    return result;
  }

  /**
   * Get recommended test scenarios for Telnyx
   */
  static getTestScenarios() {
    return [
      {
        name: 'Telnyx Registration Test',
        description: 'Test SIP registration with Telnyx credentials',
        requiredFields: ['username', 'password', 'region']
      },
      {
        name: 'Telnyx Outbound Call',
        description: 'Test outbound call through Telnyx SIP trunk',
        requiredFields: ['username', 'password', 'targetNumber', 'region']
      },
      {
        name: 'Telnyx OPTIONS Ping',
        description: 'Test SIP OPTIONS keepalive to Telnyx endpoint',
        requiredFields: ['region']
      },
      {
        name: 'Telnyx Authentication Flow',
        description: 'Test Digest authentication with Telnyx',
        requiredFields: ['username', 'password', 'region']
      },
      {
        name: 'Telnyx Error Handling',
        description: 'Test error responses from Telnyx (invalid number, etc.)',
        requiredFields: ['username', 'password', 'region']
      }
    ];
  }

  /**
   * Build Telnyx-specific SDP with recommended codecs
   */
  static buildTelnyxSDP(localIP, localPort = 10000) {
    const sessionId = Date.now();
    
    // Telnyx supports: PCMU (0), PCMA (8), G722 (9), Opus (custom)
    const sdp = [
      'v=0',
      `o=sipper ${sessionId} ${sessionId} IN IP4 ${localIP}`,
      's=Telnyx Test Call',
      `c=IN IP4 ${localIP}`,
      't=0 0',
      'm=audio ' + localPort + ' RTP/AVP 0 8 9 101',
      'a=rtpmap:0 PCMU/8000',
      'a=rtpmap:8 PCMA/8000',
      'a=rtpmap:9 G722/8000',
      'a=rtpmap:101 telephone-event/8000',
      'a=fmtp:101 0-15',
      'a=ptime:20',
      'a=maxptime:150',
      'a=sendrecv'
    ].join('\r\n');

    return sdp;
  }

  /**
   * Parse Telnyx-specific error responses
   */
  static parseTelnyxError(statusCode, reasonPhrase) {
    const errorMap = {
      403: 'Forbidden - Check SIP credentials or IP whitelist',
      404: 'Not Found - Number not provisioned or invalid',
      480: 'Temporarily Unavailable - Number unreachable',
      484: 'Address Incomplete - Invalid phone number format',
      486: 'Busy Here - Number is busy',
      487: 'Request Terminated - Call cancelled',
      503: 'Service Unavailable - Telnyx service issue',
      603: 'Decline - Call rejected by recipient'
    };

    return {
      statusCode,
      reasonPhrase,
      interpretation: errorMap[statusCode] || 'Unknown error',
      isTelnyxSpecific: statusCode === 403 || statusCode === 484
    };
  }

  /**
   * Get Telnyx SIP best practices
   */
  static getBestPractices() {
    return {
      registration: {
        expiresMin: 600,
        expiresMax: 3600,
        expiresRecommended: 1800,
        reregisterBefore: 60 // seconds before expiry
      },
      keepalive: {
        method: 'OPTIONS',
        intervalSeconds: 30,
        description: 'Send OPTIONS every 30s to maintain NAT bindings'
      },
      codecs: {
        recommended: ['PCMU', 'PCMA', 'G722'],
        supported: ['PCMU', 'PCMA', 'G722', 'Opus'],
        dtmf: 'RFC2833 (telephone-event/8000)'
      },
      transport: {
        recommended: 'UDP',
        supported: ['UDP', 'TCP', 'TLS'],
        port: 5060
      },
      authentication: {
        scheme: 'Digest',
        algorithm: 'MD5',
        qop: 'auth'
      }
    };
  }

  /**
   * Validate Telnyx connection requirements
   */
  static validateConnectionRequirements(config) {
    const issues = [];

    if (!config.username) {
      issues.push('Missing username (SIP Connection username from Telnyx Portal)');
    }

    if (!config.password) {
      issues.push('Missing password (SIP Connection password from Telnyx Portal)');
    }

    if (config.transport && !['UDP', 'TCP', 'TLS'].includes(config.transport)) {
      issues.push(`Invalid transport: ${config.transport}. Use UDP, TCP, or TLS`);
    }

    if (config.port && (config.port < 1024 || config.port > 65535)) {
      issues.push(`Invalid port: ${config.port}. Use 1024-65535`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Generate Telnyx test configuration template
   */
  static generateConfigTemplate() {
    return {
      telnyx: {
        username: 'YOUR_SIP_USERNAME',
        password: 'YOUR_SIP_PASSWORD',
        region: 'us-east', // us-east, us-west, eu, au
        transport: 'UDP',
        localIP: '0.0.0.0',
        localPort: 5060
      },
      test: {
        targetNumber: '+15551234567', // E.164 format
        timeout: 10000,
        scenarios: [
          'registration',
          'options-ping',
          'auth-challenge',
          'outbound-call',
          'error-handling'
        ]
      }
    };
  }
}
