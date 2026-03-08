/**
 * SIP Message Builder - RFC3261 Compliant
 * Constructs various SIP request and response messages
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class SIPMessageBuilder {
  constructor(config = {}) {
    this.localIP = config.localIP || '127.0.0.1';
    this.localPort = config.localPort || 5060;
    this.userAgent = config.userAgent || 'SIPPER/1.0';
    this.transport = config.transport || 'UDP';
  }

  /**
   * Generate a random Call-ID
   */
  generateCallId() {
    return `${uuidv4()}@${this.localIP}`;
  }

  /**
   * Generate a random tag for From/To headers
   */
  generateTag() {
    return crypto.randomBytes(8).toString('hex');
  }

  /**
   * Generate a random branch parameter for Via header (RFC3261 magic cookie)
   */
  generateBranch() {
    return `z9hG4bK-${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Generate CSeq number
   */
  generateCSeq() {
    return Math.floor(Math.random() * 1000000);
  }

  /**
   * Build INVITE request
   */
  buildINVITE(params) {
    const {
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      callId = this.generateCallId(),
      cseq = this.generateCSeq(),
      fromTag = this.generateTag(),
      branch = this.generateBranch(),
      contact = `sip:${fromUser}@${this.localIP}:${this.localPort}`,
      sdp = null,
      extraHeaders = {}
    } = params;

    const requestURI = `sip:${toUser}@${toDomain}`;
    const from = `<sip:${fromUser}@${fromDomain}>;tag=${fromTag}`;
    const to = `<sip:${toUser}@${toDomain}>`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `INVITE ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Contact: <${contact}>`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} INVITE`,
      `User-Agent: ${this.userAgent}`,
      `Allow: INVITE, ACK, CANCEL, BYE, OPTIONS, INFO, UPDATE`,
      `Supported: replaces, timer`
    ];

    // Add extra headers
    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    // Add Content-Type and body if SDP provided
    if (sdp) {
      const sdpBody = typeof sdp === 'string' ? sdp : this.buildDefaultSDP(fromUser);
      headers.push(`Content-Type: application/sdp`);
      headers.push(`Content-Length: ${Buffer.byteLength(sdpBody)}`);
      headers.push('');
      headers.push(sdpBody);
    } else {
      headers.push('Content-Length: 0');
      headers.push('');
    }

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, branch, method: 'INVITE' }
    };
  }

  /**
   * Build REGISTER request
   */
  buildREGISTER(params) {
    const {
      username,
      domain,
      callId = this.generateCallId(),
      cseq = this.generateCSeq(),
      fromTag = this.generateTag(),
      branch = this.generateBranch(),
      contact = `sip:${username}@${this.localIP}:${this.localPort}`,
      expires = 3600,
      extraHeaders = {}
    } = params;

    const requestURI = `sip:${domain}`;
    const from = `<sip:${username}@${domain}>;tag=${fromTag}`;
    const to = `<sip:${username}@${domain}>`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `REGISTER ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Contact: <${contact}>;expires=${expires}`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} REGISTER`,
      `User-Agent: ${this.userAgent}`,
      `Expires: ${expires}`
    ];

    // Add extra headers (like Authorization)
    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    headers.push('Content-Length: 0');
    headers.push('');

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, branch, method: 'REGISTER' }
    };
  }

  /**
   * Build OPTIONS request (ping)
   */
  buildOPTIONS(params) {
    const {
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      callId = this.generateCallId(),
      cseq = this.generateCSeq(),
      fromTag = this.generateTag(),
      branch = this.generateBranch(),
      extraHeaders = {}
    } = params;

    const requestURI = `sip:${toUser}@${toDomain}`;
    const from = `<sip:${fromUser}@${fromDomain}>;tag=${fromTag}`;
    const to = `<sip:${toUser}@${toDomain}>`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `OPTIONS ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} OPTIONS`,
      `User-Agent: ${this.userAgent}`,
      `Accept: application/sdp`
    ];

    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    headers.push('Content-Length: 0');
    headers.push('');

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, branch, method: 'OPTIONS' }
    };
  }

  /**
   * Build ACK request
   */
  buildACK(params) {
    const {
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      callId,
      cseq,
      fromTag,
      toTag,
      branch = this.generateBranch(),
      extraHeaders = {}
    } = params;

    const requestURI = `sip:${toUser}@${toDomain}`;
    const from = `<sip:${fromUser}@${fromDomain}>;tag=${fromTag}`;
    const to = `<sip:${toUser}@${toDomain}>;tag=${toTag}`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `ACK ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} ACK`,
      `User-Agent: ${this.userAgent}`
    ];

    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    headers.push('Content-Length: 0');
    headers.push('');

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, toTag, branch, method: 'ACK' }
    };
  }

  /**
   * Build BYE request
   */
  buildBYE(params) {
    const {
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      callId,
      cseq = this.generateCSeq(),
      fromTag,
      toTag,
      branch = this.generateBranch(),
      extraHeaders = {}
    } = params;

    const requestURI = `sip:${toUser}@${toDomain}`;
    const from = `<sip:${fromUser}@${fromDomain}>;tag=${fromTag}`;
    const to = `<sip:${toUser}@${toDomain}>;tag=${toTag}`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `BYE ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} BYE`,
      `User-Agent: ${this.userAgent}`
    ];

    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    headers.push('Content-Length: 0');
    headers.push('');

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, toTag, branch, method: 'BYE' }
    };
  }

  /**
   * Build CANCEL request
   */
  buildCANCEL(params) {
    const {
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      callId,
      cseq,
      fromTag,
      branch,
      extraHeaders = {}
    } = params;

    const requestURI = `sip:${toUser}@${toDomain}`;
    const from = `<sip:${fromUser}@${fromDomain}>;tag=${fromTag}`;
    const to = `<sip:${toUser}@${toDomain}>`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `CANCEL ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} CANCEL`,
      `User-Agent: ${this.userAgent}`
    ];

    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    headers.push('Content-Length: 0');
    headers.push('');

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, branch, method: 'CANCEL' }
    };
  }

  /**
   * Build Authorization header for digest authentication
   */
  buildAuthorizationHeader(params) {
    const {
      username,
      password,
      realm,
      nonce,
      uri,
      method,
      qop = 'auth',
      nc = '00000001',
      cnonce = crypto.randomBytes(8).toString('hex'),
      algorithm = 'MD5'
    } = params;

    const ha1 = crypto.createHash('md5').update(`${username}:${realm}:${password}`).digest('hex');
    const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');
    
    let response;
    if (qop) {
      const data = `${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`;
      response = crypto.createHash('md5').update(data).digest('hex');
    } else {
      const data = `${ha1}:${nonce}:${ha2}`;
      response = crypto.createHash('md5').update(data).digest('hex');
    }

    let authHeader = `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", response="${response}", algorithm=${algorithm}`;
    
    if (qop) {
      authHeader += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
    }

    return authHeader;
  }

  /**
   * Build REFER request (RFC 3515 - Call Transfer)
   */
  buildREFER(params) {
    const {
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      referTo,
      referredBy = null,
      replaces = null,
      callId,
      cseq = this.generateCSeq(),
      fromTag,
      toTag = null,
      branch = this.generateBranch(),
      contact = `sip:${fromUser}@${this.localIP}:${this.localPort}`,
      extraHeaders = {}
    } = params;

    if (!referTo) {
      throw new Error('REFER requires referTo parameter (target URI)');
    }

    const requestURI = `sip:${toUser}@${toDomain}`;
    const from = `<sip:${fromUser}@${fromDomain}>;tag=${fromTag}`;
    const to = toTag ? `<sip:${toUser}@${toDomain}>;tag=${toTag}` : `<sip:${toUser}@${toDomain}>`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `REFER ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Contact: <${contact}>`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} REFER`,
      `Refer-To: <${referTo}>`,
      `User-Agent: ${this.userAgent}`
    ];

    // Add Referred-By if provided (RFC 3892)
    if (referredBy) {
      headers.push(`Referred-By: <${referredBy}>`);
    }

    // Add Replaces for attended transfer (RFC 3891)
    if (replaces) {
      headers.push(`Replaces: ${replaces}`);
    }

    // Add extra headers
    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    headers.push('Content-Length: 0');
    headers.push('');

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, toTag, branch, method: 'REFER', referTo }
    };
  }

  /**
   * Build NOTIFY request (for REFER status updates, RFC 3515)
   */
  buildNOTIFY(params) {
    const {
      fromUser,
      fromDomain,
      toUser,
      toDomain,
      callId,
      cseq = this.generateCSeq(),
      fromTag,
      toTag,
      branch = this.generateBranch(),
      event = 'refer',
      subscriptionState = 'active',
      contentType = 'message/sipfrag',
      body = '',
      extraHeaders = {}
    } = params;

    const requestURI = `sip:${toUser}@${toDomain}`;
    const from = `<sip:${fromUser}@${fromDomain}>;tag=${fromTag}`;
    const to = `<sip:${toUser}@${toDomain}>;tag=${toTag}`;
    const via = `SIP/2.0/${this.transport} ${this.localIP}:${this.localPort};branch=${branch}`;

    let headers = [
      `NOTIFY ${requestURI} SIP/2.0`,
      `Via: ${via}`,
      `Max-Forwards: 70`,
      `From: ${from}`,
      `To: ${to}`,
      `Call-ID: ${callId}`,
      `CSeq: ${cseq} NOTIFY`,
      `Event: ${event}`,
      `Subscription-State: ${subscriptionState}`,
      `User-Agent: ${this.userAgent}`
    ];

    // Add extra headers
    Object.entries(extraHeaders).forEach(([key, value]) => {
      headers.push(`${key}: ${value}`);
    });

    // Add body if provided
    if (body) {
      headers.push(`Content-Type: ${contentType}`);
      headers.push(`Content-Length: ${Buffer.byteLength(body)}`);
      headers.push('');
      headers.push(body);
    } else {
      headers.push('Content-Length: 0');
      headers.push('');
    }

    return {
      message: headers.join('\r\n'),
      metadata: { callId, cseq, fromTag, toTag, branch, method: 'NOTIFY', event }
    };
  }

  /**
   * Build INVITE with Recording Session (RFC 7865)
   */
  buildRecordingINVITE(params) {
    const {
      recordingSession,
      ...inviteParams
    } = params;

    if (!recordingSession) {
      throw new Error('Recording INVITE requires recordingSession parameter');
    }

    const {
      sessionId,
      reason = 'QualityAssurance',
      recordingUri,
      mode = 'always'
    } = recordingSession;

    if (!sessionId) {
      throw new Error('Recording session requires sessionId (UUID)');
    }

    // Build Recording-Session header (RFC 7865 Section 4.1)
    const recordingSessionHeader = recordingUri 
      ? `<${recordingUri}>;reason=${reason};mode=${mode};session-id=${sessionId}`
      : `<urn:uuid:${sessionId}>;reason=${reason};mode=${mode}`;

    // Add Recording-Session to extraHeaders
    const extraHeaders = {
      ...inviteParams.extraHeaders,
      'Recording-Session': recordingSessionHeader
    };

    // Build standard INVITE with Recording-Session header
    return this.buildINVITE({ ...inviteParams, extraHeaders });
  }

  /**
   * Build Recording Metadata XML (RFC 7865)
   */
  buildRecordingMetadataXML(params) {
    const {
      sessionId,
      participants = [],
      reason = 'QualityAssurance',
      startTime = new Date().toISOString()
    } = params;

    const participantXML = participants.map(p => `
    <participant participant_id="${p.id || ''}">
      <nameID aor="${p.uri}">${p.name || ''}</nameID>
      ${p.role ? `<associate-time>${startTime}</associate-time>` : ''}
    </participant>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<recording xmlns="urn:ietf:params:xml:ns:recording:1">
  <datamode>complete</datamode>
  <session session_id="${sessionId}">
    <start-time>${startTime}</start-time>
    <reason>${reason}</reason>
    ${participantXML}
  </session>
</recording>`;

    return xml.trim();
  }

  /**
   * Build a default SDP (Session Description Protocol) body
   */
  buildDefaultSDP(username) {
    const sessionId = Date.now();
    const sdp = [
      'v=0',
      `o=${username} ${sessionId} ${sessionId} IN IP4 ${this.localIP}`,
      's=SIPPER Test Call',
      `c=IN IP4 ${this.localIP}`,
      't=0 0',
      'm=audio 10000 RTP/AVP 0 8 101',
      'a=rtpmap:0 PCMU/8000',
      'a=rtpmap:8 PCMA/8000',
      'a=rtpmap:101 telephone-event/8000',
      'a=fmtp:101 0-15',
      'a=sendrecv'
    ].join('\r\n');

    return sdp;
  }
}
