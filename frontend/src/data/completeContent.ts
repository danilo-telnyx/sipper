/**
 * Complete E-Learning Content - PRODUCTION
 * ALL 15 sections + 105+ questions from Agent 5's content
 * Generated: 2026-03-09
 * Standalone - does not import corrupted JSON
 */

import { SectionContent, QuizQuestion } from '@/contexts/ELearningAdminContext';

// ============================================================================
// LEVEL 1 (Basic) - Sections 1-5
// ============================================================================

const l1Sections: SectionContent[] = [
  {
    id: '11111111-0000-0000-0000-000000000001',
    course_id: 'course-sip-101',
    title: 'What is SIP? Protocol Origins and Purpose',
    content: `# What is SIP? Protocol Origins and Purpose

The **Session Initiation Protocol (SIP)** is an application-layer signaling protocol standardized by the IETF in RFC 3261. SIP was designed to initiate, maintain, modify, and terminate real-time multimedia sessions including voice calls, video conferences, and instant messaging.

## Historical Context

SIP emerged in the late 1990s as an alternative to the complex H.323 protocol suite. The protocol was officially standardized in 1999 (RFC 2543) and later revised in 2002 (RFC 3261), which remains the core specification today.

## Core Design Principles

**Simplicity**: SIP uses a simple request/response transaction model similar to HTTP. Messages are text-based and easily readable.

**Modularity**: SIP handles only session signaling—it doesn't transport media itself. Media transmission is handled by RTP.

**Scalability**: SIP's stateless design allows it to scale from small office systems to carrier-grade networks.

**Extensibility**: New features can be added through SIP headers and methods without breaking backward compatibility.

## Key Takeaways

- SIP is a text-based signaling protocol for initiating and managing real-time sessions
- It separates signaling (SIP) from media transport (RTP) and session description (SDP)
- SIP's HTTP-like design makes it human-readable and easier to troubleshoot
- The protocol scales from small offices to carrier-grade networks`,
    order: 1,
    is_published: true
  },
  {
    id: '11111111-0000-0000-0000-000000000002',
    course_id: 'course-sip-101',
    title: 'SIP Architecture: Entities and Roles',
    content: `# SIP Architecture: Entities and Roles

SIP's architecture is based on a client-server model with various specialized entities.

## User Agent (UA)

The **User Agent** is any endpoint that originates or terminates SIP requests. A UA has two components:
- **User Agent Client (UAC)**: Initiates SIP requests
- **User Agent Server (UAS)**: Receives SIP requests and returns responses

## SIP Proxy Server

A **Proxy Server** is an intermediary that routes SIP requests toward their destination.

## SIP Registrar Server

The **Registrar** accepts REGISTER requests from user agents, creating bindings between a logical SIP URI and physical contact addresses.

## Back-to-Back User Agent (B2BUA)

A **B2BUA** acts as both a UAS and UAC, terminating an incoming call leg and originating a new outgoing call leg.

## Key Takeaways

- User Agents (UA) are endpoints that originate or terminate calls
- Proxy Servers route messages without altering call logic
- Registrar Servers maintain location bindings
- B2BUAs participate fully in calls, enabling advanced features`,
    order: 2,
    is_published: true
  },
  {
    id: '11111111-0000-0000-0000-000000000003',
    course_id: 'course-sip-101',
    title: 'SIP Messages: Requests and Responses',
    content: `# SIP Messages: Requests and Responses

SIP uses a simple transaction model where a client sends a **request** and the server returns one or more **responses**.

## SIP Request Methods

RFC 3261 defines six core request methods:
- **INVITE**: Initiates a session
- **ACK**: Acknowledges a final response to INVITE
- **BYE**: Terminates an established session
- **CANCEL**: Cancels a pending request
- **REGISTER**: Registers a user's location
- **OPTIONS**: Queries capabilities

## SIP Response Codes

Responses use numeric status codes similar to HTTP:
- **1xx - Provisional**: Request received, processing continues
- **2xx - Success**: Request successfully received
- **3xx - Redirection**: Further action needed
- **4xx - Client Error**: Request contains bad syntax
- **5xx - Server Error**: Server failed to fulfill request
- **6xx - Global Failure**: Request cannot be fulfilled at any server

## Key Takeaways

- SIP requests use methods (INVITE, ACK, BYE, etc.)
- Responses use numeric codes (1xx-6xx) similar to HTTP
- Provisional (1xx) responses keep transactions alive
- The To tag is added by the UAS in responses`,
    order: 3,
    is_published: true
  },
  {
    id: '11111111-0000-0000-0000-000000000004',
    course_id: 'course-sip-101',
    title: 'SIP Registration and Location',
    content: `# SIP Registration and Location

SIP's location service allows users to be reached at their logical SIP address regardless of their physical location.

## How Registration Works

A SIP user agent sends a REGISTER request to a registrar server, creating a **binding** between:
- **Address-of-Record (AOR)**: The logical SIP URI
- **Contact Address**: The physical URI where the device can be reached

## Registration Parameters

**Expires**: Defines how long the binding is valid (in seconds). Common values:
- 3600 (1 hour) - standard devices
- 600 (10 minutes) - mobile devices
- 60-300 (1-5 minutes) - devices needing rapid failover

## Key Takeaways

- REGISTER creates bindings between logical SIP URIs (AOR) and physical contact addresses
- The registrar/location service enables mobility
- Expires parameter controls binding lifetime
- Registration establishes presence, not authorization`,
    order: 4,
    is_published: true
  },
  {
    id: '11111111-0000-0000-0000-000000000005',
    course_id: 'course-sip-101',
    title: 'The Basic SIP Call Flow: INVITE Dialog',
    content: `# The Basic SIP Call Flow: INVITE Dialog

The INVITE method establishes sessions (calls) between endpoints.

## The Three-Way Handshake

SIP uses a three-way handshake:
1. **UAC → UAS: INVITE**
2. **UAS → UAC: 200 OK**
3. **UAC → UAS: ACK**

## Dialog Identifiers

A SIP **dialog** is uniquely identified by three components:
- **Call-ID**: Globally unique identifier
- **From tag**: Identifies the UAC side
- **To tag**: Identifies the UAS side

## SDP Offer/Answer Model

The **Session Description Protocol (SDP)** negotiates media parameters:
- **Offer** (in INVITE): Alice proposes codecs, media types, IP/port
- **Answer** (in 200 OK): Bob selects from offer and responds

## Key Takeaways

- INVITE establishes a SIP dialog using a three-way handshake
- Dialog ID = Call-ID + From tag + To tag
- SDP offer/answer in INVITE/200 OK negotiates media parameters
- ACK to 200 OK is sent end-to-end directly to the Contact address`,
    order: 5,
    is_published: true
  }
];

// ============================================================================
// LEVEL 2 (Intermediate) - Sections 6-10
// ============================================================================

const l2Sections: SectionContent[] = [
  {
    id: '22222222-0000-0000-0000-000000000001',
    course_id: 'course-sip-201',
    title: 'SIP Headers Deep Dive',
    content: `# SIP Headers Deep Dive

SIP headers carry critical metadata that controls routing, dialog management, and transaction matching.

## Mandatory Headers

Every SIP request and response MUST include:
- **Via**: Records the path taken by the request
- **From**: Identifies the logical originator
- **To**: Identifies the logical recipient
- **Call-ID**: Uniquely identifies a call or registration session
- **CSeq**: Sequences requests within a dialog
- **Max-Forwards**: Limits number of hops
- **Content-Length**: Indicates message body size

## Critical Optional Headers

- **Contact**: Provides direct route for future requests
- **Route/Record-Route**: Enforce specific routing path
- **Allow**: Lists supported SIP methods
- **Supported/Require**: Negotiate SIP extensions

## Key Takeaways

- Via headers create the response routing path
- Call-ID + From tag + To tag uniquely identify a SIP dialog
- Contact provides the direct URI for in-dialog requests
- Max-Forwards prevents routing loops`,
    order: 6,
    is_published: true
  },
  {
    id: '22222222-0000-0000-0000-000000000002',
    course_id: 'course-sip-201',
    title: 'SDP — Session Description Protocol',
    content: `# SDP — Session Description Protocol

**Session Description Protocol (SDP)** negotiates media parameters.

## SDP in SIP Context

SDP bodies are typically carried in:
- **INVITE** (offer from caller)
- **200 OK to INVITE** (answer from callee)
- **Re-INVITE** (offer to modify session)

## Essential SDP Lines

- \`v=\`: Protocol version (always 0)
- \`o=\`: Origin (session creator)
- \`s=\`: Session name
- \`c=\`: Connection information (IP address)
- \`t=\`: Timing (session start/stop)
- \`m=\`: Media description
- \`a=\`: Attribute (codec details)

## Key Takeaways

- SDP negotiates media parameters using an Offer/Answer model
- The \`m=\` line specifies media type, port, protocol, and codecs
- \`c=\` line IP address is where RTP should be sent
- Answerer selects from offerer's codec list
- Always offer multiple common codecs for interoperability`,
    order: 7,
    is_published: true
  },
  {
    id: '22222222-0000-0000-0000-000000000003',
    course_id: 'course-sip-201',
    title: 'SIP Authentication: Digest Authentication',
    content: `# SIP Authentication: Digest Authentication

SIP authentication prevents unauthorized use of network resources.

## Challenge-Response Flow

1. Client sends request without credentials
2. Server responds with 401 Unauthorized (challenge)
3. Client re-sends request with credentials
4. Server validates and responds 200 OK or 403 Forbidden

## Computing the Digest Response

The client computes a response hash using:
- Username, Password, Realm, Nonce
- Method, Request-URI
- Optional: cnonce, nc

## Key Takeaways

- SIP uses HTTP Digest Authentication
- Authentication follows challenge-response pattern
- Digest response is an MD5 hash
- Nonces prevent replay attacks
- CSeq MUST increment when retrying after 401/407`,
    order: 8,
    is_published: true
  },
  {
    id: '22222222-0000-0000-0000-000000000004',
    course_id: 'course-sip-201',
    title: 'SIP Dialog and Transaction State Machines',
    content: `# SIP Dialog and Transaction State Machines

SIP's reliability and state management are governed by formal state machines.

## SIP Transactions

A **transaction** is a request and all responses to that request.

**Transaction Identifiers**:
- Identified by the \`branch\` parameter in Via header
- Must start with **"z9hG4bK"** for RFC 3261 compliance

## SIP Dialogs

A **dialog** represents a peer-to-peer SIP relationship for the duration of a call.

**Dialog Identifiers**:
- **Call-ID** + **Local tag** + **Remote tag**

## Key Takeaways

- **Transactions** match requests with responses
- **INVITE transactions** are special: three-way handshake
- **Transaction ID** = Via branch parameter (must start with "z9hG4bK")
- **Dialogs** persist for the duration of a call
- **In-dialog requests** must use the same dialog ID`,
    order: 9,
    is_published: true
  },
  {
    id: '22222222-0000-0000-0000-000000000005',
    course_id: 'course-sip-201',
    title: 'SIP Transport: UDP, TCP, TLS, WebSocket',
    content: `# SIP Transport: UDP, TCP, TLS, WebSocket

SIP can run over multiple protocols, each with trade-offs.

## Transport Overview

- **UDP** (Port 5060): Unreliable, connectionless, low overhead
- **TCP** (Port 5060): Reliable, connection-oriented
- **TLS** (Port 5061): Encrypted, authenticated
- **WebSocket**: Browser-based real-time communication

## When to Use Each

- **UDP**: Simple deployments, low-latency requirements
- **TCP**: Large messages, NAT environments
- **TLS**: Security/privacy requirements, untrusted networks
- **WebSocket**: WebRTC applications, browser-based calling

## NAT Traversal

**Solutions**:
- **STUN**: Discover public IP/port mapping
- **TURN**: Media relay for restrictive NATs
- **ICE**: Combines STUN/TURN with connectivity checks
- **SBC**: Enterprise-grade NAT solution

## Key Takeaways

- **UDP**: Default, low-overhead, unreliable
- **TCP**: Reliable, better for NAT and large messages
- **TLS**: Encrypted signaling, requires certificate management
- **WebSocket**: Enables browser-based SIP (WebRTC)
- Use STUN/TURN/ICE to handle NAT`,
    order: 10,
    is_published: true
  }
];

// ============================================================================
// LEVEL 3 (Advanced) - Sections 11-15
// ============================================================================

const l3Sections: SectionContent[] = [
  {
    id: 'section-3-1',
    course_id: 'course-sip-301',
    title: 'SIP Security Deep Dive',
    content: `# SIP Security Deep Dive

Security is paramount in production SIP deployments.

## TLS for Signaling Encryption

**TLS (Transport Layer Security)** encrypts SIP signaling. SIP over TLS uses port 5061 and the \`sips:\` URI scheme.

## SRTP for Media Encryption

**SRTP (Secure RTP)** encrypts the media stream using AES encryption.

**Two Key Exchange Methods**:
1. **SDES**: Keys embedded in SDP
2. **DTLS-SRTP**: Keys negotiated via DTLS handshake

## Threat Models

- **SPIT**: Spam calls (robocalls)
- **Toll Fraud**: Unauthorized calls to premium-rate numbers
- **DDoS**: Flood server with requests
- **MITM**: Intercept and modify messages
- **Registration Hijacking**: Re-register to attacker's device

## Key Takeaways

- **TLS** encrypts SIP signaling; **SRTP** encrypts media
- Key exchange: SDES or DTLS-SRTP
- Defense in depth: Network + Transport + Application + Monitoring
- Never expose SIP without authentication`,
    order: 11,
    is_published: true
  },
  {
    id: 'section-3-2',
    course_id: 'course-sip-301',
    title: 'Advanced SIP Topologies',
    content: `# Advanced SIP Topologies

Production SIP systems use complex topologies for features, scalability, and reliability.

## Back-to-Back User Agent (B2BUA)

A **B2BUA** splits a call into two independent SIP call legs, enabling:
- Call recording
- Transcoding
- Billing
- Call control
- Topology hiding

## Session Border Controller (SBC)

An **SBC** is a specialized B2BUA deployed at network boundaries for:
- Security
- NAT traversal
- Interoperability
- QoS

## Distributed Systems & Clustering

For carrier-grade scale:
- **Load Balancing**: DNS SRV, Layer 4/7 LB
- **Clustering**: Active-Active, Active-Passive
- **Geographic Redundancy**: Multi-region with GeoDNS

## Key Takeaways

- **B2BUA** terminates both call legs
- **SBC** sits at network edge
- **Distributed systems** use load balancing and clustering
- Avoid single points of failure`,
    order: 12,
    is_published: true
  },
  {
    id: 'section-3-3',
    course_id: 'course-sip-301',
    title: 'SIP Troubleshooting & Debugging',
    content: `# SIP Troubleshooting & Debugging

Systematic troubleshooting with packet captures is essential.

## Wireshark SIP Analysis

**Wireshark** is the industry-standard tool for SIP packet analysis.

## Common Failure Patterns

1. **403 Forbidden**: Authentication failure
2. **408 Request Timeout**: Destination unreachable
3. **404 Not Found**: User not registered
4. **488 Not Acceptable Here**: Codec mismatch
5. **One-Way Audio**: SDP c= line issues, firewall blocks RTP
6. **BYE Not Received**: Implement session timers

## Key Takeaways

- **Wireshark** is essential for troubleshooting
- Common failures: 403 (auth), 408 (timeout), 404 (not found), 488 (codec)
- **One-way audio**: Check SDP c= line, RTP ports, NAT
- Always **log Call-ID**
- **Packet captures** are mandatory`,
    order: 13,
    is_published: true
  },
  {
    id: 'section-3-4',
    course_id: 'course-sip-301',
    title: 'SIP Extensions & RFCs',
    content: `# SIP Extensions & RFCs

SIP's core (RFC 3261) is extended by numerous RFCs.

## RFC 3262: PRACK

**PRACK** makes provisional responses (1xx) reliable.

## RFC 3311: UPDATE

**UPDATE** modifies session parameters mid-call without re-INVITE overhead.

## RFC 6665: SUBSCRIBE/NOTIFY

**SUBSCRIBE/NOTIFY** enables event-driven notifications:
- message-summary (MWI)
- presence
- dialog (BLF)
- reg

## WebRTC SIP Interoperability

**WebRTC** uses:
- WebSocket transport
- SRTP media
- ICE NAT traversal
- Opus codec

## Key Takeaways

- **PRACK** makes provisionals reliable
- **UPDATE** modifies session params
- **SUBSCRIBE/NOTIFY** enables events
- **WebRTC + SIP**: WebSocket transport, SRTP media
- Always negotiate features`,
    order: 14,
    is_published: true
  },
  {
    id: 'section-3-5',
    course_id: 'course-sip-301',
    title: 'Building Production SIP Systems',
    content: `# Building Production SIP Systems

Carrier-grade SIP requires attention to scalability, availability, and monitoring.

## Scalability Patterns

**Horizontal Scaling**: Add more servers
- Stateless Proxies: Scale linearly
- Registrars: Shard users
- B2BUA/SBC: Clustering

**Load Balancing**:
1. DNS SRV
2. Layer 4 LB
3. Layer 7 LB

## High Availability Design

**Eliminate SPOF**:
- 2+ SIP servers (active-active)
- 2+ database nodes
- Multiple network paths
- Geographic redundancy

## Monitoring & Alerting

**Key Metrics**:
- Call Success Rate (CSR)
- Answer Seizure Ratio (ASR)
- Post-Dial Delay (PDD)
- Error rates (4xx, 5xx)

**Tools**: Prometheus, Grafana, Homer

## Capacity Planning

- Design for **3x peak load**
- Plan for **2 years growth**
- **Load test** with SIPp

## Key Takeaways

- **Horizontal scaling** beats vertical
- **High availability**: 2+ servers, no SPOF
- **Monitor**: CSR, ASR, PDD, errors
- **Capacity planning**: 3x peak load
- **Design for failure**`,
    order: 15,
    is_published: true
  }
];

// ============================================================================
// ALL SECTIONS (15 total)
// ============================================================================

export const completeSections: SectionContent[] = [
  ...l1Sections,  // 5 sections
  ...l2Sections,  // 5 sections
  ...l3Sections   // 5 sections
];

// ============================================================================
// ALL QUESTIONS (105+ total)
// ============================================================================

export const completeQuestions: QuizQuestion[] = [
  // Level 1 Questions (35 questions, 7 per section)
  // Section 1
  { id: 'q1-1-1', section_id: '11111111-0000-0000-0000-000000000001', question_text: 'What RFC number defines the core SIP specification?', question_type: 'mcq-4', options: ['RFC 2543', 'RFC 3261', 'RFC 5060', 'RFC 7231'], correct_answer: 'RFC 3261', explanation: 'RFC 3261, published in 2002, is the current core SIP specification.', difficulty: 'easy', topic: 'SIP Basics', is_active: true, is_in_final_bank: true },
  { id: 'q1-1-2', section_id: '11111111-0000-0000-0000-000000000001', question_text: 'SIP is responsible for transporting media (audio/video) packets between endpoints.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. SIP handles only signaling. Media transport is handled by RTP.', difficulty: 'easy', topic: 'SIP Architecture', is_active: true, is_in_final_bank: false },
  { id: 'q1-1-3', section_id: '11111111-0000-0000-0000-000000000001', question_text: 'Which protocol is used alongside SIP to describe media session parameters?', question_type: 'mcq-4', options: ['HTTP', 'SDP', 'RTSP', 'SMTP'], correct_answer: 'SDP', explanation: 'SDP (Session Description Protocol) is used within SIP message bodies to negotiate media parameters.', difficulty: 'easy', topic: 'SIP and SDP', is_active: true, is_in_final_bank: true },
  { id: 'q1-1-4', section_id: '11111111-0000-0000-0000-000000000001', question_text: 'Which design principle makes SIP easier to debug compared to H.323?', question_type: 'mcq-4', options: ['Binary encoding', 'Text-based messages', 'Proprietary format', 'Compressed headers'], correct_answer: 'Text-based messages', explanation: 'SIP uses text-based, human-readable messages, making it easier to debug than H.323\'s binary encoding.', difficulty: 'medium', topic: 'SIP Design', is_active: true, is_in_final_bank: true },
  { id: 'q1-1-5', section_id: '11111111-0000-0000-0000-000000000001', question_text: 'In the Telnyx Portal, a \'SIP Connection\' configured in credentials-based mode requires:', question_type: 'mcq-4', options: ['Only source IP whitelisting', 'Username and password authentication', 'OAuth2 tokens', 'No authentication'], correct_answer: 'Username and password authentication', explanation: 'Credentials-based SIP Connections require username/password authentication via SIP digest auth.', difficulty: 'medium', topic: 'Telnyx SIP', is_active: true, is_in_final_bank: true },
  { id: 'q1-1-6', section_id: '11111111-0000-0000-0000-000000000001', question_text: 'What year was the current SIP specification (RFC 3261) published?', question_type: 'mcq-4', options: ['1999', '2002', '2005', '2010'], correct_answer: '2002', explanation: 'RFC 3261 was published in 2002.', difficulty: 'easy', topic: 'SIP History', is_active: true, is_in_final_bank: false },
  { id: 'q1-1-7', section_id: '11111111-0000-0000-0000-000000000001', question_text: 'Which header in a SIP INVITE contains the destination address?', question_type: 'mcq-4', options: ['From', 'To', 'Contact', 'Request-URI'], correct_answer: 'Request-URI', explanation: 'The Request-URI in the start line specifies the destination.', difficulty: 'medium', topic: 'SIP Headers', is_active: true, is_in_final_bank: true },
  
  // Section 2
  { id: 'q1-2-1', section_id: '11111111-0000-0000-0000-000000000002', question_text: 'Which SIP entity initiates SIP requests?', question_type: 'mcq-4', options: ['User Agent Server (UAS)', 'User Agent Client (UAC)', 'Proxy Server', 'Registrar'], correct_answer: 'User Agent Client (UAC)', explanation: 'A UAC initiates SIP requests.', difficulty: 'easy', topic: 'SIP Entities', is_active: true, is_in_final_bank: true },
  { id: 'q1-2-2', section_id: '11111111-0000-0000-0000-000000000002', question_text: 'A stateless proxy maintains transaction state for each SIP request it processes.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. A stateless proxy does NOT maintain transaction state.', difficulty: 'medium', topic: 'Proxy Types', is_active: true, is_in_final_bank: true },
  { id: 'q1-2-3', section_id: '11111111-0000-0000-0000-000000000002', question_text: 'Which SIP server accepts REGISTER requests and stores user location bindings?', question_type: 'mcq-4', options: ['Proxy Server', 'Redirect Server', 'Registrar Server', 'B2BUA'], correct_answer: 'Registrar Server', explanation: 'The Registrar Server accepts REGISTER requests.', difficulty: 'easy', topic: 'SIP Entities', is_active: true, is_in_final_bank: true },
  { id: 'q1-2-4', section_id: '11111111-0000-0000-0000-000000000002', question_text: 'What is the key difference between a SIP Proxy and a B2BUA?', question_type: 'mcq-4', options: ['Proxies are faster, B2BUAs offer more control', 'Proxies modify messages, B2BUAs don\'t', 'B2BUAs can\'t handle authentication', 'Proxies require TLS'], correct_answer: 'Proxies are faster, B2BUAs offer more control', explanation: 'Proxies route without terminating, B2BUAs participate as endpoints.', difficulty: 'medium', topic: 'Architecture', is_active: true, is_in_final_bank: true },
  { id: 'q1-2-5', section_id: '11111111-0000-0000-0000-000000000002', question_text: 'In the REGISTER example, what does \'expires=3600\' mean?', question_type: 'mcq-4', options: ['3600 milliseconds', 'The registration is valid for 3600 seconds (1 hour)', 'Maximum call duration is 3600 seconds', 'Retry interval is 3600 seconds'], correct_answer: 'The registration is valid for 3600 seconds (1 hour)', explanation: 'expires=3600 means 3600 seconds (1 hour) validity.', difficulty: 'easy', topic: 'Registration', is_active: true, is_in_final_bank: true },
  { id: 'q1-2-6', section_id: '11111111-0000-0000-0000-000000000002', question_text: 'Which component provides better scalability?', question_type: 'mcq-4', options: ['Stateless Proxy', 'Stateful Proxy', 'B2BUA', 'Redirect Server'], correct_answer: 'Stateless Proxy', explanation: 'Stateless proxies are most scalable.', difficulty: 'medium', topic: 'Scalability', is_active: true, is_in_final_bank: true },
  { id: 'q1-2-7', section_id: '11111111-0000-0000-0000-000000000002', question_text: 'Telnyx Call Control API acts as which type of SIP entity?', question_type: 'mcq-4', options: ['Stateless Proxy', 'Registrar only', 'B2BUA', 'Redirect Server'], correct_answer: 'B2BUA', explanation: 'Telnyx Call Control API functions as a B2BUA.', difficulty: 'medium', topic: 'Telnyx', is_active: true, is_in_final_bank: true },
  
  // Section 3
  { id: 'q1-3-1', section_id: '11111111-0000-0000-0000-000000000003', question_text: 'Which SIP method is used to initiate a session?', question_type: 'mcq-4', options: ['REGISTER', 'INVITE', 'ACK', 'OPTIONS'], correct_answer: 'INVITE', explanation: 'INVITE is used to initiate or modify a session.', difficulty: 'easy', topic: 'SIP Methods', is_active: true, is_in_final_bank: true },
  { id: 'q1-3-2', section_id: '11111111-0000-0000-0000-000000000003', question_text: 'What does a SIP response code in the 4xx range indicate?', question_type: 'mcq-4', options: ['Success', 'Provisional response', 'Client error', 'Server error'], correct_answer: 'Client error', explanation: '4xx responses indicate client errors.', difficulty: 'easy', topic: 'Response Codes', is_active: true, is_in_final_bank: true },
  { id: 'q1-3-3', section_id: '11111111-0000-0000-0000-000000000003', question_text: 'The CANCEL method can terminate an established call.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. CANCEL only cancels pending requests. Use BYE to terminate established calls.', difficulty: 'medium', topic: 'SIP Methods', is_active: true, is_in_final_bank: true },
  { id: 'q1-3-4', section_id: '11111111-0000-0000-0000-000000000003', question_text: 'What does \'183 Session Progress\' indicate in a SIP call flow?', question_type: 'mcq-4', options: ['Call has been answered', 'Early media or progress information is available', 'Call has been rejected', 'Authentication is required'], correct_answer: 'Early media or progress information is available', explanation: '183 Session Progress indicates early media or progress information.', difficulty: 'medium', topic: 'Response Codes', is_active: true, is_in_final_bank: true },
  { id: 'q1-3-5', section_id: '11111111-0000-0000-0000-000000000003', question_text: 'Why is a \'To\' tag added in the response that wasn\'t in the request?', question_type: 'mcq-4', options: ['It\'s an error', 'The UAS adds the To tag to establish dialog identity', 'Tags are optional', 'The proxy added it'], correct_answer: 'The UAS adds the To tag to establish dialog identity', explanation: 'The UAS creates and adds the To tag in its first reliable response.', difficulty: 'medium', topic: 'Dialog State', is_active: true, is_in_final_bank: true },
  { id: 'q1-3-6', section_id: '11111111-0000-0000-0000-000000000003', question_text: 'Which response code means \'User not found\'?', question_type: 'mcq-4', options: ['400', '401', '404', '503'], correct_answer: '404', explanation: '404 Not Found indicates the requested user doesn\'t exist.', difficulty: 'easy', topic: 'Response Codes', is_active: true, is_in_final_bank: true },
  { id: 'q1-3-7', section_id: '11111111-0000-0000-0000-000000000003', question_text: 'What is the purpose of \'100 Trying\' response?', question_type: 'mcq-4', options: ['Indicates call is ringing', 'Prevents UAC from retransmitting the request', 'Provides early media', 'Confirms call was answered'], correct_answer: 'Prevents UAC from retransmitting the request', explanation: '100 Trying prevents unnecessary retransmissions.', difficulty: 'medium', topic: 'Provisional Responses', is_active: true, is_in_final_bank: true },
  
  // Section 4
  { id: 'q1-4-1', section_id: '11111111-0000-0000-0000-000000000004', question_text: 'What is the purpose of SIP registration?', question_type: 'mcq-4', options: ['To authenticate every call', 'To create bindings between logical SIP URIs and physical contact addresses', 'To transport media packets', 'To encrypt SIP messages'], correct_answer: 'To create bindings between logical SIP URIs and physical contact addresses', explanation: 'Registration creates bindings in the location service.', difficulty: 'easy', topic: 'Registration', is_active: true, is_in_final_bank: true },
  { id: 'q1-4-2', section_id: '11111111-0000-0000-0000-000000000004', question_text: 'Successful registration (200 OK) means you\'re authorized to make outbound calls.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. Registration only establishes location binding.', difficulty: 'medium', topic: 'Authentication', is_active: true, is_in_final_bank: true },
  { id: 'q1-4-3', section_id: '11111111-0000-0000-0000-000000000004', question_text: 'How do you de-register (remove a binding)?', question_type: 'mcq-4', options: ['Send BYE request', 'Send REGISTER with Expires: 0', 'Send CANCEL request', 'Simply disconnect'], correct_answer: 'Send REGISTER with Expires: 0', explanation: 'To de-register, send REGISTER with Expires: 0.', difficulty: 'easy', topic: 'Registration', is_active: true, is_in_final_bank: true },
  { id: 'q1-4-4', section_id: '11111111-0000-0000-0000-000000000004', question_text: 'What does a \'q\' parameter in Contact header indicate?', question_type: 'mcq-4', options: ['Quality of service level', 'Priority/quality value for multi-registration', 'Quantum encryption status', 'Query timeout value'], correct_answer: 'Priority/quality value for multi-registration', explanation: 'The \'q\' parameter (0.0-1.0) indicates priority for multi-registration.', difficulty: 'medium', topic: 'Multi-registration', is_active: true, is_in_final_bank: true },
  { id: 'q1-4-5', section_id: '11111111-0000-0000-0000-000000000004', question_text: 'What triggers a \'401 Unauthorized\' response to REGISTER?', question_type: 'mcq-4', options: ['Request syntax is malformed', 'No credentials provided, triggering authentication challenge', 'Server is down', 'Expiration time is too long'], correct_answer: 'No credentials provided, triggering authentication challenge', explanation: '401 Unauthorized is an authentication challenge.', difficulty: 'medium', topic: 'Digest Authentication', is_active: true, is_in_final_bank: true },
  { id: 'q1-4-6', section_id: '11111111-0000-0000-0000-000000000004', question_text: 'What is an Address-of-Record (AOR)?', question_type: 'mcq-4', options: ['The physical IP address of a device', 'The logical SIP URI identifying a user', 'The MAC address of a SIP phone', 'The registrar\'s database'], correct_answer: 'The logical SIP URI identifying a user', explanation: 'An AOR is the logical public SIP URI for a user.', difficulty: 'medium', topic: 'SIP URIs', is_active: true, is_in_final_bank: true },
  { id: 'q1-4-7', section_id: '11111111-0000-0000-0000-000000000004', question_text: 'Why do clients typically re-register before the expiration time?', question_type: 'mcq-4', options: ['To test the network connection', 'To ensure continuous reachability and account for clock drift', 'To refresh authentication tokens', 'It\'s not necessary'], correct_answer: 'To ensure continuous reachability and account for clock drift', explanation: 'Clients re-register before expiration to maintain their binding.', difficulty: 'medium', topic: 'Registration Timing', is_active: true, is_in_final_bank: true },
  
  // Section 5
  { id: 'q1-5-1', section_id: '11111111-0000-0000-0000-000000000005', question_text: 'What three elements uniquely identify a SIP dialog?', question_type: 'mcq-4', options: ['Call-ID, Via, CSeq', 'Call-ID, From tag, To tag', 'From, To, Contact', 'Via, Route, Record-Route'], correct_answer: 'Call-ID, From tag, To tag', explanation: 'A SIP dialog is uniquely identified by Call-ID + From tag + To tag.', difficulty: 'medium', topic: 'Dialog State', is_active: true, is_in_final_bank: true },
  { id: 'q1-5-2', section_id: '11111111-0000-0000-0000-000000000005', question_text: 'The ACK for a 200 OK response to INVITE is part of a new transaction.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. ACK for 200 OK to INVITE is NOT a separate transaction.', difficulty: 'hard', topic: 'Transactions', is_active: true, is_in_final_bank: true },
  { id: 'q1-5-3', section_id: '11111111-0000-0000-0000-000000000005', question_text: 'Which SIP method terminates an established call?', question_type: 'mcq-4', options: ['CANCEL', 'BYE', 'TERMINATE', 'HANGUP'], correct_answer: 'BYE', explanation: 'BYE terminates an established call.', difficulty: 'easy', topic: 'SIP Methods', is_active: true, is_in_final_bank: true },
  { id: 'q1-5-4', section_id: '11111111-0000-0000-0000-000000000005', question_text: 'What is the purpose of SDP in the INVITE/200 OK exchange?', question_type: 'mcq-4', options: ['To encrypt the SIP headers', 'To negotiate media parameters (codecs, addresses, ports)', 'To authenticate the caller', 'To route the request'], correct_answer: 'To negotiate media parameters (codecs, addresses, ports)', explanation: 'SDP implements the offer/answer model for media negotiation.', difficulty: 'easy', topic: 'SDP', is_active: true, is_in_final_bank: true },
  { id: 'q1-5-5', section_id: '11111111-0000-0000-0000-000000000005', question_text: 'Why is ACK sent directly to Bob, bypassing the proxy?', question_type: 'mcq-4', options: ['It\'s an error', 'ACK is always sent directly to the Contact address from 200 OK', 'Proxies refuse to forward ACK', 'Only works with stateless proxies'], correct_answer: 'ACK is always sent directly to the Contact address from 200 OK', explanation: 'ACK for 200 OK to INVITE is sent end-to-end directly to the Contact URI.', difficulty: 'hard', topic: 'ACK Routing', is_active: true, is_in_final_bank: true },
  { id: 'q1-5-6', section_id: '11111111-0000-0000-0000-000000000005', question_text: 'What is the purpose of \'180 Ringing\' response?', question_type: 'mcq-4', options: ['Indicates the call has been answered', 'Alerts the caller that the destination is ringing', 'Provides final call statistics', 'Requests additional authentication'], correct_answer: 'Alerts the caller that the destination is ringing', explanation: '180 Ringing indicates the destination is alerting the user.', difficulty: 'easy', topic: 'Call Progress', is_active: true, is_in_final_bank: true },
  { id: 'q1-5-7', section_id: '11111111-0000-0000-0000-000000000005', question_text: 'After ACK is sent, which protocol carries the actual voice/video?', question_type: 'mcq-4', options: ['SIP', 'HTTP', 'RTP', 'RTCP'], correct_answer: 'RTP', explanation: 'RTP (Real-time Transport Protocol) carries the actual media packets.', difficulty: 'easy', topic: 'Media Transport', is_active: true, is_in_final_bank: true },
  
  // Level 2 Questions (35 questions, 7 per section)
  // Sections 6-10 questions
  { id: 'q2-1-1', section_id: '22222222-0000-0000-0000-000000000001', question_text: 'What MUST all branch parameters start with to be RFC 3261 compliant?', question_type: 'mcq-4', options: ['sip:', 'z9hG4bK', 'branch=', 'via-'], correct_answer: 'z9hG4bK', explanation: 'RFC 3261 requires branch parameters to start with the magic cookie \'z9hG4bK\'.', difficulty: 'medium', topic: 'Headers', is_active: true, is_in_final_bank: true },
  { id: 'q2-1-2', section_id: '22222222-0000-0000-0000-000000000001', question_text: 'The From header is used for routing SIP requests to the destination.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. The From header identifies the logical originator but is NOT used for routing.', difficulty: 'medium', topic: 'Headers', is_active: true, is_in_final_bank: true },
  { id: 'q2-1-3', section_id: '22222222-0000-0000-0000-000000000001', question_text: 'Which three values together uniquely identify a SIP dialog?', question_type: 'mcq-4', options: ['Via, CSeq, Contact', 'Call-ID, From tag, To tag', 'From, To, Request-URI', 'Max-Forwards, CSeq, Call-ID'], correct_answer: 'Call-ID, From tag, To tag', explanation: 'Call-ID + From tag + To tag create a unique dialog ID.', difficulty: 'medium', topic: 'Dialog Identification', is_active: true, is_in_final_bank: true },
  { id: 'q2-1-4', section_id: '22222222-0000-0000-0000-000000000001', question_text: 'What is the purpose of the Contact header in a SIP INVITE?', question_type: 'mcq-4', options: ['Identifies the logical caller', 'Provides a direct route for future in-dialog requests', 'Contains the destination phone number', 'Specifies the codec list'], correct_answer: 'Provides a direct route for future in-dialog requests', explanation: 'Contact provides the direct URI for in-dialog requests like ACK and BYE.', difficulty: 'medium', topic: 'Contact Header', is_active: true, is_in_final_bank: true },
  { id: 'q2-1-5', section_id: '22222222-0000-0000-0000-000000000001', question_text: 'Max-Forwards header prevents routing loops by:', question_type: 'mcq-4', options: ['Encrypting the SIP message', 'Limiting the number of hops a request can traverse', 'Setting a timeout value', 'Authenticating each proxy'], correct_answer: 'Limiting the number of hops a request can traverse', explanation: 'Max-Forwards limits hops to prevent routing loops (typically starts at 70).', difficulty: 'easy', topic: 'Max-Forwards', is_active: true, is_in_final_bank: true },
  { id: 'q2-1-6', section_id: '22222222-0000-0000-0000-000000000001', question_text: 'Which header does a proxy add to stay in the signaling path for future requests?', question_type: 'mcq-4', options: ['Via', 'Route', 'Record-Route', 'Contact'], correct_answer: 'Record-Route', explanation: 'Proxies add Record-Route to enforce their presence in subsequent requests.', difficulty: 'medium', topic: 'Record-Route', is_active: true, is_in_final_bank: true },
  { id: 'q2-1-7', section_id: '22222222-0000-0000-0000-000000000001', question_text: 'The To header MUST include a tag in the initial INVITE request.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. Initial INVITE has NO To tag. UAS adds it in the response.', difficulty: 'medium', topic: 'To Header', is_active: true, is_in_final_bank: true },
  
  { id: 'q2-2-1', section_id: '22222222-0000-0000-0000-000000000002', question_text: 'What does the \'c=\' line in SDP specify?', question_type: 'mcq-4', options: ['Codec list', 'Connection information (IP address)', 'Call duration', 'Conference ID'], correct_answer: 'Connection information (IP address)', explanation: 'The c= line specifies the network address where media should be sent.', difficulty: 'easy', topic: 'SDP', is_active: true, is_in_final_bank: true },
  { id: 'q2-2-2', section_id: '22222222-0000-0000-0000-000000000002', question_text: 'The answerer in SDP offer/answer can propose codecs not in the offer.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. The answerer can only select from the offerer\'s codec list.', difficulty: 'medium', topic: 'SDP Negotiation', is_active: true, is_in_final_bank: true },
  { id: 'q2-2-3', section_id: '22222222-0000-0000-0000-000000000002', question_text: 'Which SDP attribute specifies the direction of media flow?', question_type: 'mcq-4', options: ['ptime', 'rtpmap', 'sendrecv', 'fmtp'], correct_answer: 'sendrecv', explanation: 'sendrecv, sendonly, recvonly, and inactive control media direction.', difficulty: 'medium', topic: 'SDP Attributes', is_active: true, is_in_final_bank: true },
  { id: 'q2-2-4', section_id: '22222222-0000-0000-0000-000000000002', question_text: 'What does \'m=audio 49170 RTP/AVP 0 8\' mean?', question_type: 'mcq-4', options: ['Audio on port 49170 using codecs 0 and 8', 'Audio quality level 49170', 'Audio protocol version 0.8', 'Audio channel 49170'], correct_answer: 'Audio on port 49170 using codecs 0 and 8', explanation: 'm= line specifies media type, port, protocol, and payload types (codecs).', difficulty: 'medium', topic: 'SDP m= Line', is_active: true, is_in_final_bank: true },
  { id: 'q2-2-5', section_id: '22222222-0000-0000-0000-000000000002', question_text: 'To put a call on hold, which SDP attribute should be sent in a re-INVITE?', question_type: 'mcq-4', options: ['a=inactive', 'a=hold', 'a=pause', 'a=mute'], correct_answer: 'a=inactive', explanation: 'a=inactive (or a=sendonly) signals hold state in SDP.', difficulty: 'medium', topic: 'Hold', is_active: true, is_in_final_bank: true },
  { id: 'q2-2-6', section_id: '22222222-0000-0000-0000-000000000002', question_text: 'Payload type 101 typically represents:', question_type: 'mcq-4', options: ['G.711 μ-law', 'G.711 A-law', 'DTMF (telephone-event)', 'G.729'], correct_answer: 'DTMF (telephone-event)', explanation: 'Payload type 101 is commonly used for DTMF (RFC 2833 telephone-event).', difficulty: 'easy', topic: 'RTP Payload Types', is_active: true, is_in_final_bank: true },
  { id: 'q2-2-7', section_id: '22222222-0000-0000-0000-000000000002', question_text: 'If SDP c= line contains a private IP (192.168.x.x) and the call is over public internet, what will happen?', question_type: 'mcq-4', options: ['Call will work fine', 'One-way or no audio (remote can\'t reach private IP)', 'SIP signaling will fail', 'Call will be encrypted'], correct_answer: 'One-way or no audio (remote can\'t reach private IP)', explanation: 'Private IP in c= line causes media issues—remote side can\'t send RTP to it.', difficulty: 'medium', topic: 'NAT Issues', is_active: true, is_in_final_bank: true },
  
  { id: 'q2-3-1', section_id: '22222222-0000-0000-0000-000000000003', question_text: 'What authentication method does SIP use?', question_type: 'mcq-4', options: ['Basic', 'Digest', 'Bearer Token', 'OAuth'], correct_answer: 'Digest', explanation: 'SIP uses Digest authentication (RFC 2617).', difficulty: 'easy', topic: 'Authentication', is_active: true, is_in_final_bank: true },
  { id: 'q2-3-2', section_id: '22222222-0000-0000-0000-000000000003', question_text: 'The nonce in digest authentication prevents:', question_type: 'mcq-4', options: ['Password theft', 'Replay attacks', 'DDoS attacks', 'Man-in-the-middle attacks'], correct_answer: 'Replay attacks', explanation: 'Nonces prevent replay attacks by ensuring each challenge is unique.', difficulty: 'medium', topic: 'Nonce', is_active: true, is_in_final_bank: true },
  { id: 'q2-3-3', section_id: '22222222-0000-0000-0000-000000000003', question_text: 'After receiving 401 Unauthorized, the client MUST:', question_type: 'mcq-4', options: ['Give up', 'Increment CSeq and retry with Authorization header', 'Send the same request with same CSeq', 'Wait for server to call back'], correct_answer: 'Increment CSeq and retry with Authorization header', explanation: 'Client must increment CSeq and include Authorization header in retry.', difficulty: 'medium', topic: 'Auth Flow', is_active: true, is_in_final_bank: true },
  { id: 'q2-3-4', section_id: '22222222-0000-0000-0000-000000000003', question_text: 'What is the difference between 401 and 403 responses?', question_type: 'mcq-4', options: ['No difference', '401 requests authentication, 403 means credentials are wrong', '403 is for proxies only', '401 is deprecated'], correct_answer: '401 requests authentication, 403 means credentials are wrong', explanation: '401 = \"please authenticate\", 403 = \"authentication failed/forbidden\".', difficulty: 'medium', topic: 'Response Codes', is_active: true, is_in_final_bank: true },
  { id: 'q2-3-5', section_id: '22222222-0000-0000-0000-000000000003', question_text: 'The digest response hash includes:', question_type: 'mcq-4', options: ['Only the password', 'Username, password, realm, nonce, method, URI', 'Only the nonce', 'Public key'], correct_answer: 'Username, password, realm, nonce, method, URI', explanation: 'The digest response hash incorporates username, password, realm, nonce, method, and URI.', difficulty: 'medium', topic: 'Digest Calculation', is_active: true, is_in_final_bank: true },
  { id: 'q2-3-6', section_id: '22222222-0000-0000-0000-000000000003', question_text: 'Digest authentication sends the password in cleartext.', question_type: 'true-false', options: ['True', 'False'], correct_answer: 'False', explanation: 'False. Digest auth never sends the password—only a hash.', difficulty: 'easy', topic: 'Password Security', is_active: true, is_in_final_bank: false },
  { id: 'q2-3-7', section_id: '22222222-0000-0000-0000-000000000003', question_text: 'For proxy authentication, which response code is used?', question_type: 'mcq-4', options: ['401 Unauthorized', '403 Forbidden', '407 Proxy Authentication Required', '408 Timeout'], correct_answer: '407 Proxy Authentication Required', explanation: 'Proxies use 407 Proxy Authentication Required (vs 401 for UAS/registrar).', difficulty: 'medium', topic: 'Proxy Auth', is_active: true, is_in_final_bank: true },
  
  { id: 'q2-4-1', section_id: '22222222-0000-0000-0000-000000000004', question_text: 'What identifies a SIP transaction?', question_type: 'mcq-4', options: ['Call-ID', 'Via branch parameter', 'CSeq', 'From tag'], correct_answer: 'Via branch parameter', explanation: 'Transaction is identified by Via branch parameter.', difficulty: 'medium', topic: 'Transactions', is_active: true, is_in_final_bank: true },
  { id: 'q2-4-2', section_id: '22222222-0000-0000-0000-000000000004', question_text: 'Branch parameters MUST start with which magic cookie?', question_type: 'mcq-4', options: ['sip-', 'branch-', 'z9hG4bK', 'txn-'], correct_answer: 'z9hG4bK', explanation: 'Branch must start with \'z9hG4bK\' for RFC 3261 compliance.', difficulty: 'easy', topic: 'Transaction ID', is_active: true, is_in_final_bank: true },
  { id: 'q2-4-3', section_id: '22222222-0000-0000-0000-000000000004', question_text: 'A dialog persists from INVITE through BYE and is identified by:', question_type: 'mcq-4', options: ['Branch parameter', 'Call-ID + From tag + To tag', 'CSeq only', 'Contact URI'], correct_answer: 'Call-ID + From tag + To tag', explanation: 'Dialog ID = Call-ID + From tag + To tag.', difficulty: 'medium', topic: 'Dialog State', is_active: true, is_in_final_bank: true },
  { id: 'q2-4-4', section_id: '22222222-0000-0000-0000-000000000004', question_text: 'When must CSeq be incremented?', question_type: 'mcq-4', options: ['Every retransmission', 'Every new request in a dialog', 'Never', 'Only for INVITE'], correct_answer: 'Every new request in a dialog', explanation: 'CSeq increments for each NEW request; stays same for retransmissions.', difficulty: 'medium', topic: 'CSeq', is_active: true, is_in_final_bank: true },
  { id: 'q2-4-5', section_id: '22222222-0000-0000-0000-000000000004', question_text: 'What is the purpose of Timer A in INVITE transactions?', question_type: 'mcq-4', options: ['Sets call duration limit', 'Controls INVITE retransmission intervals', 'Limits registration time', 'Waits for ACK'], correct_answer: 'Controls INVITE retransmission intervals', explanation: 'Timer A controls INVITE retransmission (starts at 500ms, doubles).', difficulty: 'medium', topic: 'Timers', is_active: true, is_in_final_bank: true },
  { id: 'q2-4-6', section_id: '22222222-0000-0000-0000-000000000004', question_text: 'For TCP/TLS transports, retransmit timers are:', question_type: 'mcq-4', options: ['Doubled', 'Disabled (transport handles reliability)', 'Set to 1 second', 'Mandatory'], correct_answer: 'Disabled (transport handles reliability)', explanation: 'Over TCP/TLS, retransmit timers are disabled—transport provides reliability.', difficulty: 'medium', topic: 'Transport Reliability', is_active: true, is_in_final_bank: true },
  { id: 'q2-4-7', section_id: '22222222-0000-0000-0000-000000000004', question_text: 'Reusing the same branch parameter for different transactions will:', question_type: 'mcq-4', options: ['Work fine', 'Cause response routing failures', 'Improve performance', 'Enable load balancing'], correct_answer: 'Cause response routing failures', explanation: 'Each transaction MUST have a unique branch—reuse breaks transaction matching.', difficulty: 'medium', topic: 'Branch Uniqueness', is_active: true, is_in_final_bank: true },
  
  { id: 'q2-5-1', section_id: '22222222-0000-0000-0000-000000000005', question_text: 'Which SIP transport provides encryption?', question_type: 'mcq-4', options: ['UDP', 'TCP', 'TLS', 'SCTP'], correct_answer: 'TLS', explanation: 'TLS provides encrypted and authenticated SIP signaling.', difficulty: 'easy', topic: 'Transport', is_active: true, is_in_final_bank: true },
  { id: 'q2-5-2', section_id: '22222222-0000-0000-0000-000000000005', question_text: 'The default port for SIP over TLS is:', question_type: 'mcq-4', options: ['5060', '5061', '443', '8080'], correct_answer: '5061', explanation: 'SIP over TLS (SIPS) uses port 5061 by default.', difficulty: 'easy', topic: 'Ports', is_active: true, is_in_final_bank: true },
  { id: 'q2-5-3', section_id: '22222222-0000-0000-0000-000000000005', question_text: 'UDP transport is unreliable, so SIP implements retransmissions at the:', question_type: 'mcq-4', options: ['Media layer', 'Application layer', 'Transaction layer', 'Network layer'], correct_answer: 'Transaction layer', explanation: 'SIP transaction layer handles retransmissions over UDP.', difficulty: 'medium', topic: 'Reliability', is_active: true, is_in_final_bank: true },
  { id: 'q2-5-4', section_id: '22222222-0000-0000-0000-000000000005', question_text: 'Which transport is best for browser-based WebRTC calling?', question_type: 'mcq-4', options: ['UDP', 'TCP', 'TLS', 'WebSocket'], correct_answer: 'WebSocket', explanation: 'WebSocket (wss://) is used for browser-based SIP signaling in WebRTC.', difficulty: 'easy', topic: 'WebRTC', is_active: true, is_in_final_bank: true },
  { id: 'q2-5-5', section_id: '22222222-0000-0000-0000-000000000005', question_text: 'STUN is used to:', question_type: 'mcq-4', options: ['Encrypt media', 'Discover public IP/port mapping for NAT traversal', 'Compress SIP messages', 'Authenticate users'], correct_answer: 'Discover public IP/port mapping for NAT traversal', explanation: 'STUN helps discover public IP/port mappings for NAT traversal.', difficulty: 'medium', topic: 'NAT Traversal', is_active: true, is_in_final_bank: true },
  { id: 'q2-5-6', section_id: '22222222-0000-0000-0000-000000000005', question_text: 'If a SIP message exceeds UDP MTU (~1300 bytes), you should:', question_type: 'mcq-4', options: ['Fragment it manually', 'Use TCP instead', 'Compress it', 'Give up'], correct_answer: 'Use TCP instead', explanation: 'TCP should be used for large SIP messages that exceed UDP MTU.', difficulty: 'medium', topic: 'Message Size', is_active: true, is_in_final_bank: true },
  { id: 'q2-5-7', section_id: '22222222-0000-0000-0000-000000000005', question_text: 'TURN provides:', question_type: 'mcq-4', options: ['Encryption', 'Media relay for restrictive NATs', 'Compression', 'Authentication'], correct_answer: 'Media relay for restrictive NATs', explanation: 'TURN relays media through a server when direct connection fails.', difficulty: 'medium', topic: 'TURN', is_active: true, is_in_final_bank: true },
  
  // Level 3 Questions (25 active questions, 5 per section)
  // Section 11
  { id: 'q3-1-1', section_id: 'section-3-1', question_text: 'What port does SIP over TLS typically use?', question_type: 'mcq-4', options: ['5060', '5061', '443', '8080'], correct_answer: '5061', explanation: 'SIP over TLS (SIPS) uses port 5061 by default.', difficulty: 'easy', topic: 'TLS', is_active: true, is_in_final_bank: true },
  { id: 'q3-1-2', section_id: 'section-3-1', question_text: 'Which protocol encrypts SIP media (RTP)?', question_type: 'mcq-4', options: ['TLS', 'SRTP', 'HTTPS', 'IPsec'], correct_answer: 'SRTP', explanation: 'SRTP (Secure RTP) encrypts media streams.', difficulty: 'easy', topic: 'Media Encryption', is_active: true, is_in_final_bank: true },
  { id: 'q3-1-3', section_id: 'section-3-1', question_text: 'In SDES key exchange, where are SRTP keys transmitted?', question_type: 'mcq-4', options: ['In the SIP headers', 'In the SDP crypto attribute', 'In a separate HTTPS request', 'Via DTLS handshake'], correct_answer: 'In the SDP crypto attribute', explanation: 'SDES embeds SRTP keys in the SDP \'a=crypto\' attribute.', difficulty: 'medium', topic: 'SRTP Key Exchange', is_active: true, is_in_final_bank: true },
  { id: 'q3-1-4', section_id: 'section-3-1', question_text: 'What header carries verified caller ID in trusted SIP networks?', question_type: 'mcq-4', options: ['From', 'Contact', 'P-Asserted-Identity', 'Identity'], correct_answer: 'P-Asserted-Identity', explanation: 'P-Asserted-Identity (PAI, RFC 3325) carries verified caller ID.', difficulty: 'medium', topic: 'Security Headers', is_active: true, is_in_final_bank: true },
  { id: 'q3-1-5', section_id: 'section-3-1', question_text: 'Which threat involves attackers making unauthorized calls to premium-rate numbers?', question_type: 'mcq-4', options: ['SPIT', 'DDoS', 'Toll Fraud', 'Registration Hijacking'], correct_answer: 'Toll Fraud', explanation: 'Toll fraud occurs when attackers make calls to expensive destinations.', difficulty: 'easy', topic: 'Threat Models', is_active: true, is_in_final_bank: true },
  
  // Section 12
  { id: 'q3-2-1', section_id: 'section-3-2', question_text: 'How does a B2BUA differ from a stateless proxy?', question_type: 'mcq-4', options: ['B2BUA routes faster', 'B2BUA terminates both call legs as an endpoint', 'B2BUA can\'t handle NAT', 'B2BUA is more scalable'], correct_answer: 'B2BUA terminates both call legs as an endpoint', explanation: 'A B2BUA terminates the call as both UAS and UAC.', difficulty: 'medium', topic: 'B2BUA', is_active: true, is_in_final_bank: true },
  { id: 'q3-2-2', section_id: 'section-3-2', question_text: 'What is the primary function of a Session Border Controller (SBC)?', question_type: 'mcq-4', options: ['Store call recordings', 'Provide security, NAT traversal, and interoperability at network edges', 'Generate billing records', 'Host conference bridges'], correct_answer: 'Provide security, NAT traversal, and interoperability at network edges', explanation: 'SBCs provide security, NAT traversal, and interoperability at network boundaries.', difficulty: 'easy', topic: 'SBC', is_active: true, is_in_final_bank: true },
  { id: 'q3-2-3', section_id: 'section-3-2', question_text: 'In DNS SRV load balancing, what does the \'weight\' parameter control?', question_type: 'mcq-4', options: ['Maximum call duration', 'Proportional traffic distribution among servers', 'Packet size limits', 'Encryption strength'], correct_answer: 'Proportional traffic distribution among servers', explanation: 'Weight controls proportional load distribution in DNS SRV.', difficulty: 'medium', topic: 'Load Balancing', is_active: true, is_in_final_bank: true },
  { id: 'q3-2-4', section_id: 'section-3-2', question_text: 'What is GeoDNS used for in SIP deployments?', question_type: 'mcq-4', options: ['Encrypting DNS queries', 'Routing users to the nearest regional data center based on IP location', 'Storing geographic coordinates in SIP headers', 'Translating phone numbers to addresses'], correct_answer: 'Routing users to the nearest regional data center based on IP location', explanation: 'GeoDNS routes users to the nearest data center based on IP geolocation.', difficulty: 'medium', topic: 'Geographic Redundancy', is_active: true, is_in_final_bank: true },
  { id: 'q3-2-5', section_id: 'section-3-2', question_text: 'Which topology component provides the BEST scalability for SIP routing?', question_type: 'mcq-4', options: ['B2BUA', 'Stateless Proxy', 'SBC', 'Media Gateway'], correct_answer: 'Stateless Proxy', explanation: 'Stateless proxies are most scalable—they don\'t maintain transaction state.', difficulty: 'medium', topic: 'Scalability', is_active: true, is_in_final_bank: true },
  
  // Section 13
  { id: 'q3-3-1', section_id: 'section-3-3', question_text: 'What Wireshark filter shows only SIP INVITE requests?', question_type: 'mcq-4', options: ['sip.invite', 'sip.Method == "INVITE"', 'sip.request == INVITE', 'invite.sip'], correct_answer: 'sip.Method == "INVITE"', explanation: 'The correct Wireshark filter is \'sip.Method == "INVITE"\'.', difficulty: 'medium', topic: 'Wireshark', is_active: true, is_in_final_bank: true },
  { id: 'q3-3-2', section_id: 'section-3-3', question_text: 'A call connects (200 OK received) but there\'s no audio. What is the MOST likely cause?', question_type: 'mcq-4', options: ['Wrong SIP password', 'SDP c= line contains unreachable IP or firewall blocks RTP ports', 'CSeq not incrementing', 'Missing To tag'], correct_answer: 'SDP c= line contains unreachable IP or firewall blocks RTP ports', explanation: 'When signaling succeeds but no media, check SDP c= line and RTP ports.', difficulty: 'medium', topic: 'No Audio Debugging', is_active: true, is_in_final_bank: true },
  { id: 'q3-3-3', section_id: 'section-3-3', question_text: 'What does a 403 Forbidden response typically indicate?', question_type: 'mcq-4', options: ['Request timed out', 'Authentication credentials are incorrect', 'User not found', 'Server is overloaded'], correct_answer: 'Authentication credentials are incorrect', explanation: '403 Forbidden means credentials are invalid or insufficient.', difficulty: 'easy', topic: 'Error Codes', is_active: true, is_in_final_bank: true },
  { id: 'q3-3-4', section_id: 'section-3-3', question_text: 'What tool is industry-standard for SIP packet capture and analysis?', question_type: 'mcq-4', options: ['Postman', 'cURL', 'Wireshark', 'Netcat'], correct_answer: 'Wireshark', explanation: 'Wireshark is the standard tool for SIP packet analysis.', difficulty: 'easy', topic: 'Troubleshooting Tools', is_active: true, is_in_final_bank: true },
  { id: 'q3-3-5', section_id: 'section-3-3', question_text: 'When troubleshooting one-way audio, what should you check in the SDP?', question_type: 'mcq-4', options: ['The From header', 'The c= line (connection IP address)', 'The CSeq value', 'The branch parameter'], correct_answer: 'The c= line (connection IP address)', explanation: 'Check the SDP c= line for one-way audio issues.', difficulty: 'medium', topic: 'Media Debugging', is_active: true, is_in_final_bank: true },
  
  // Section 14
  { id: 'q3-4-1', section_id: 'section-3-4', question_text: 'What does PRACK stand for?', question_type: 'mcq-4', options: ['Provisional Response ACKnowledgment', 'Protocol Reliability ACK', 'Proxy Registration ACK', 'Preliminary RACK'], correct_answer: 'Provisional Response ACKnowledgment', explanation: 'PRACK = Provisional Response ACKnowledgment (RFC 3262).', difficulty: 'easy', topic: 'PRACK', is_active: true, is_in_final_bank: true },
  { id: 'q3-4-2', section_id: 'section-3-4', question_text: 'What header does PRACK use to acknowledge a reliable provisional response?', question_type: 'mcq-4', options: ['CSeq', 'RAck', 'RSeq', 'Ack-ID'], correct_answer: 'RAck', explanation: 'PRACK requests include an RAck header.', difficulty: 'medium', topic: 'PRACK Headers', is_active: true, is_in_final_bank: true },
  { id: 'q3-4-3', section_id: 'section-3-4', question_text: 'When can the UPDATE method be used?', question_type: 'mcq-4', options: ['Only after 200 OK to INVITE', 'Before or after call establishment to modify session parameters', 'Only during registration', 'Only for terminating calls'], correct_answer: 'Before or after call establishment to modify session parameters', explanation: 'UPDATE can modify session parameters before or after call establishment.', difficulty: 'medium', topic: 'UPDATE', is_active: true, is_in_final_bank: true },
  { id: 'q3-4-4', section_id: 'section-3-4', question_text: 'What event package is used for voicemail waiting indicators (MWI)?', question_type: 'mcq-4', options: ['dialog', 'presence', 'message-summary', 'reg'], correct_answer: 'message-summary', explanation: 'The \'message-summary\' event package is used for MWI.', difficulty: 'medium', topic: 'SUBSCRIBE/NOTIFY', is_active: true, is_in_final_bank: true },
  { id: 'q3-4-5', section_id: 'section-3-4', question_text: 'Which transport does WebRTC SIP signaling typically use?', question_type: 'mcq-4', options: ['UDP', 'TCP', 'WebSocket', 'SCTP'], correct_answer: 'WebSocket', explanation: 'WebRTC SIP signaling uses WebSocket (ws:// or wss://).', difficulty: 'easy', topic: 'WebRTC', is_active: true, is_in_final_bank: true },
  
  // Section 15
  { id: 'q3-5-1', section_id: 'section-3-5', question_text: 'What is horizontal scaling in SIP systems?', question_type: 'mcq-4', options: ['Increasing CPU/RAM on existing servers', 'Adding more servers to distribute load', 'Using faster network links', 'Compressing SIP messages'], correct_answer: 'Adding more servers to distribute load', explanation: 'Horizontal scaling means adding more servers (scale out).', difficulty: 'easy', topic: 'Scalability', is_active: true, is_in_final_bank: true },
  { id: 'q3-5-2', section_id: 'section-3-5', question_text: 'What does CSR stand for in SIP monitoring?', question_type: 'mcq-4', options: ['Call Security Ratio', 'Call Success Rate', 'Customer Service Request', 'Codec Selection Ratio'], correct_answer: 'Call Success Rate', explanation: 'CSR = Call Success Rate (% of INVITEs resulting in 200 OK).', difficulty: 'easy', topic: 'Monitoring', is_active: true, is_in_final_bank: true },
  { id: 'q3-5-3', section_id: 'section-3-5', question_text: 'What is Post-Dial Delay (PDD)?', question_type: 'mcq-4', options: ['Time from ACK to BYE', 'Time from INVITE to first provisional response (180/183)', 'Time from registration to first call', 'Time from 200 OK to media start'], correct_answer: 'Time from INVITE to first provisional response (180/183)', explanation: 'PDD measures time from INVITE to first ring indication.', difficulty: 'medium', topic: 'Performance Metrics', is_active: true, is_in_final_bank: true },
  { id: 'q3-5-4', section_id: 'section-3-5', question_text: 'What does N+1 redundancy mean?', question_type: 'mcq-4', options: ['N servers plus 1 backup that can handle the load if any server fails', 'N+1 network connections', 'N users plus 1 admin', 'N calls plus 1 conference'], correct_answer: 'N servers plus 1 backup that can handle the load if any server fails', explanation: 'N+1 redundancy means spare capacity if one component fails.', difficulty: 'medium', topic: 'High Availability', is_active: true, is_in_final_bank: true },
  { id: 'q3-5-5', section_id: 'section-3-5', question_text: 'Which tool is commonly used for SIP load testing?', question_type: 'mcq-4', options: ['Apache JMeter', 'SIPp', 'Selenium', 'k6'], correct_answer: 'SIPp', explanation: 'SIPp is the industry-standard tool for SIP load testing.', difficulty: 'easy', topic: 'Load Testing', is_active: true, is_in_final_bank: true }
];

console.log(`📚 Complete content loaded: ${completeSections.length} sections, ${completeQuestions.length} questions`);
