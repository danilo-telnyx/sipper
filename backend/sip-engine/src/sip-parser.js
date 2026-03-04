/**
 * SIP Parser and Validator - RFC3261 Compliant
 * Parses and validates SIP messages
 */

export class SIPParser {
  /**
   * Parse a SIP message (request or response)
   */
  static parse(rawMessage) {
    if (!rawMessage || typeof rawMessage !== 'string') {
      return { valid: false, error: 'Invalid message: empty or not a string' };
    }

    const lines = rawMessage.split('\r\n');
    if (lines.length < 2) {
      return { valid: false, error: 'Invalid message: too few lines' };
    }

    const firstLine = lines[0];
    let parsed = {};

    // Determine if request or response
    if (firstLine.startsWith('SIP/2.0')) {
      // Response
      parsed = this.parseResponse(firstLine);
    } else {
      // Request
      parsed = this.parseRequest(firstLine);
    }

    if (!parsed.valid) {
      return parsed;
    }

    // Parse headers
    let bodyStartIndex = -1;
    parsed.headers = {};
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Empty line indicates start of body
      if (line === '') {
        bodyStartIndex = i + 1;
        break;
      }

      // Parse header
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) {
        continue; // Skip malformed headers
      }

      const headerName = line.substring(0, colonIndex).trim();
      const headerValue = line.substring(colonIndex + 1).trim();
      
      // Store header (handle multiple headers with same name)
      if (parsed.headers[headerName]) {
        if (Array.isArray(parsed.headers[headerName])) {
          parsed.headers[headerName].push(headerValue);
        } else {
          parsed.headers[headerName] = [parsed.headers[headerName], headerValue];
        }
      } else {
        parsed.headers[headerName] = headerValue;
      }
    }

    // Parse body if present
    if (bodyStartIndex > 0 && bodyStartIndex < lines.length) {
      parsed.body = lines.slice(bodyStartIndex).join('\r\n');
    }

    // Validate required headers
    const validation = this.validateHeaders(parsed);
    if (!validation.valid) {
      return validation;
    }

    // Extract common header values
    parsed.callId = parsed.headers['Call-ID'];
    parsed.cseq = this.parseCSeq(parsed.headers['CSeq']);
    parsed.from = this.parseAddressHeader(parsed.headers['From']);
    parsed.to = this.parseAddressHeader(parsed.headers['To']);
    parsed.via = this.parseVia(parsed.headers['Via']);
    parsed.contentLength = parseInt(parsed.headers['Content-Length'] || '0');

    return parsed;
  }

  /**
   * Parse SIP request line
   */
  static parseRequest(line) {
    const parts = line.split(' ');
    if (parts.length !== 3) {
      return { valid: false, error: 'Invalid request line format' };
    }

    const [method, requestURI, version] = parts;
    
    if (!version.startsWith('SIP/2.0')) {
      return { valid: false, error: 'Invalid SIP version' };
    }

    return {
      valid: true,
      type: 'request',
      method,
      requestURI,
      version
    };
  }

  /**
   * Parse SIP response line
   */
  static parseResponse(line) {
    const match = line.match(/^SIP\/2\.0\s+(\d{3})\s+(.*)$/);
    if (!match) {
      return { valid: false, error: 'Invalid response line format' };
    }

    return {
      valid: true,
      type: 'response',
      statusCode: parseInt(match[1]),
      reasonPhrase: match[2],
      version: 'SIP/2.0'
    };
  }

  /**
   * Validate required headers based on message type
   */
  static validateHeaders(parsed) {
    const requiredHeaders = ['Call-ID', 'CSeq', 'From', 'To', 'Via'];
    
    for (const header of requiredHeaders) {
      if (!parsed.headers[header]) {
        return { 
          valid: false, 
          error: `Missing required header: ${header}`,
          violations: [`RFC3261 violation: ${header} header is mandatory`]
        };
      }
    }

    // Additional validation for requests
    if (parsed.type === 'request') {
      if (!parsed.headers['Max-Forwards']) {
        return { 
          valid: false, 
          error: 'Missing Max-Forwards header',
          violations: ['RFC3261 violation: Max-Forwards required in requests']
        };
      }
    }

    return { valid: true };
  }

  /**
   * Parse CSeq header
   */
  static parseCSeq(cseq) {
    if (!cseq) return null;
    const parts = cseq.split(' ');
    return {
      number: parseInt(parts[0]),
      method: parts[1]
    };
  }

  /**
   * Parse address header (From/To/Contact)
   */
  static parseAddressHeader(header) {
    if (!header) return null;

    const result = {
      raw: header,
      displayName: null,
      uri: null,
      params: {}
    };

    // Extract display name if present
    const displayMatch = header.match(/^"?([^"<]*)"?\s*</);
    if (displayMatch) {
      result.displayName = displayMatch[1].trim();
    }

    // Extract URI
    const uriMatch = header.match(/<([^>]+)>/);
    if (uriMatch) {
      result.uri = uriMatch[1];
    } else {
      // No angle brackets, URI is the whole thing before params
      const semiIndex = header.indexOf(';');
      result.uri = semiIndex > 0 ? header.substring(0, semiIndex).trim() : header.trim();
    }

    // Extract parameters (like tag)
    const paramMatch = header.match(/;(.+)$/);
    if (paramMatch) {
      const params = paramMatch[1].split(';');
      params.forEach(param => {
        const [key, value] = param.split('=');
        result.params[key.trim()] = value ? value.trim() : true;
      });
    }

    return result;
  }

  /**
   * Parse Via header
   */
  static parseVia(via) {
    if (!via) return null;

    // Handle multiple Via headers
    const viaList = Array.isArray(via) ? via : [via];
    
    return viaList.map(v => {
      const result = {
        raw: v,
        protocol: null,
        version: null,
        transport: null,
        host: null,
        port: null,
        params: {}
      };

      // Parse protocol/version/transport
      const protocolMatch = v.match(/^SIP\/(\d\.\d)\/(UDP|TCP|TLS|SCTP|WS|WSS)/i);
      if (protocolMatch) {
        result.version = protocolMatch[1];
        result.transport = protocolMatch[2].toUpperCase();
      }

      // Parse host:port
      const hostMatch = v.match(/\s+([\w\.\-]+)(?::(\d+))?/);
      if (hostMatch) {
        result.host = hostMatch[1];
        result.port = hostMatch[2] ? parseInt(hostMatch[2]) : 5060;
      }

      // Parse parameters
      const paramMatch = v.match(/;(.+)$/);
      if (paramMatch) {
        const params = paramMatch[1].split(';');
        params.forEach(param => {
          const [key, value] = param.split('=');
          result.params[key.trim()] = value ? value.trim() : true;
        });
      }

      return result;
    });
  }

  /**
   * Parse WWW-Authenticate or Proxy-Authenticate header
   */
  static parseAuthHeader(header) {
    if (!header) return null;

    const result = {
      scheme: null,
      realm: null,
      nonce: null,
      algorithm: 'MD5',
      qop: null,
      opaque: null
    };

    // Extract scheme (Digest)
    const schemeMatch = header.match(/^(\w+)\s/);
    if (schemeMatch) {
      result.scheme = schemeMatch[1];
    }

    // Extract parameters
    const params = header.match(/(\w+)="?([^",]+)"?/g);
    if (params) {
      params.forEach(param => {
        const [key, value] = param.split('=');
        const cleanValue = value.replace(/"/g, '');
        result[key.toLowerCase()] = cleanValue;
      });
    }

    return result;
  }

  /**
   * Parse SDP body
   */
  static parseSDP(body) {
    if (!body) return null;

    const sdp = {
      version: null,
      origin: {},
      session: null,
      connection: {},
      time: {},
      media: []
    };

    const lines = body.split('\r\n');
    let currentMedia = null;

    lines.forEach(line => {
      if (line.length < 2) return;

      const type = line.charAt(0);
      const value = line.substring(2);

      switch (type) {
        case 'v':
          sdp.version = value;
          break;
        case 'o':
          const [username, sessionId, sessionVersion, netType, addrType, address] = value.split(' ');
          sdp.origin = { username, sessionId, sessionVersion, netType, addrType, address };
          break;
        case 's':
          sdp.session = value;
          break;
        case 'c':
          const [cNetType, cAddrType, cAddress] = value.split(' ');
          const conn = { netType: cNetType, addrType: cAddrType, address: cAddress };
          if (currentMedia) {
            currentMedia.connection = conn;
          } else {
            sdp.connection = conn;
          }
          break;
        case 't':
          const [start, stop] = value.split(' ');
          sdp.time = { start, stop };
          break;
        case 'm':
          const [media, port, proto, ...formats] = value.split(' ');
          currentMedia = { media, port: parseInt(port), proto, formats, attributes: [] };
          sdp.media.push(currentMedia);
          break;
        case 'a':
          if (currentMedia) {
            currentMedia.attributes.push(value);
          }
          break;
      }
    });

    return sdp;
  }

  /**
   * Validate RFC3261 compliance
   */
  static validateRFC3261(parsed) {
    const violations = [];

    // Check Via branch parameter has magic cookie
    if (parsed.via && parsed.via[0]) {
      const branch = parsed.via[0].params.branch;
      if (branch && !branch.startsWith('z9hG4bK')) {
        violations.push('RFC3261 violation: Via branch must start with magic cookie z9hG4bK');
      }
    }

    // Check CSeq method matches request method
    if (parsed.type === 'request' && parsed.cseq) {
      if (parsed.cseq.method !== parsed.method) {
        violations.push(`RFC3261 violation: CSeq method (${parsed.cseq.method}) must match request method (${parsed.method})`);
      }
    }

    // Check Max-Forwards is present and reasonable
    if (parsed.type === 'request') {
      const maxFwd = parseInt(parsed.headers['Max-Forwards']);
      if (isNaN(maxFwd) || maxFwd < 0 || maxFwd > 255) {
        violations.push('RFC3261 violation: Max-Forwards must be 0-255');
      }
    }

    // Check Content-Length matches body
    if (parsed.body) {
      const actualLength = Buffer.byteLength(parsed.body);
      if (actualLength !== parsed.contentLength) {
        violations.push(`RFC3261 violation: Content-Length (${parsed.contentLength}) does not match body length (${actualLength})`);
      }
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }
}
