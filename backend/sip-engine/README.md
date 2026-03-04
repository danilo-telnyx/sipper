# SIPPER - SIP Testing Engine

RFC3261-compliant SIP testing engine with comprehensive test scenarios and Telnyx integration support.

## Features

✅ **RFC3261 Compliant SIP Implementation**
- Full SIP message builder (INVITE, REGISTER, OPTIONS, BYE, ACK, CANCEL)
- SIP parser and validator with RFC3261 compliance checking
- Digest authentication (MD5, with qop support)
- Comprehensive header parsing and validation

✅ **Test Scenarios**
- Basic call flow (INVITE → 180 → 200 → ACK → BYE)
- Registration test (with and without authentication)
- OPTIONS ping (keepalive)
- Authentication challenge (401/407)
- Error response handling (4xx, 5xx, 6xx)

✅ **Telnyx Integration**
- Pre-configured Telnyx endpoints (US East, US West, EU, AU)
- Telnyx-specific SDP codec recommendations
- Best practices guide
- Connection validation

✅ **Comprehensive Logging**
- Message-level logging (sent/received)
- Response time tracking
- RFC3261 violation detection
- Detailed test reports (JSON + console)

✅ **Async/Non-blocking Execution**
- Event-driven architecture
- UDP socket communication
- Transaction matching
- Configurable timeouts

## Installation

```bash
cd ~/Documents/projects/sipper/backend/sip-engine
npm install
```

## Quick Start

### Basic SIP Test

```javascript
import { SIPTestEngine } from './src/test-engine.js';

const config = {
  localIP: '0.0.0.0',
  localPort: 5060,
  transport: 'UDP'
};

const endpoint = {
  host: 'sip.example.com',
  port: 5060,
  domain: 'sip.example.com',
  username: 'myuser',
  password: 'mypassword'
};

const engine = new SIPTestEngine(config);
await engine.init();

// Run tests
await engine.testOPTIONSPing(endpoint);
await engine.testREGISTER(endpoint);

// Print report
engine.printReport();

await engine.shutdown();
```

### Telnyx Integration Test

```bash
export TELNYX_SIP_USERNAME="your-sip-username"
export TELNYX_SIP_PASSWORD="your-sip-password"
export TELNYX_REGION="us-east"

node tests/telnyx-integration.js
```

## Test Scenarios

### 1. OPTIONS Ping
Tests basic connectivity to SIP endpoint.

```bash
SIP_HOST=sip.example.com SIP_USERNAME=test node tests/options-ping.js
```

**Expected Flow:**
```
→ OPTIONS sip:test@sip.example.com SIP/2.0
← SIP/2.0 200 OK
```

### 2. Registration
Tests SIP REGISTER with authentication.

```bash
SIP_HOST=sip.example.com \
SIP_USERNAME=myuser \
SIP_PASSWORD=mypassword \
node tests/registration.js
```

**Expected Flow:**
```
→ REGISTER sip:sip.example.com SIP/2.0
← SIP/2.0 401 Unauthorized (with WWW-Authenticate)
→ REGISTER sip:sip.example.com SIP/2.0 (with Authorization)
← SIP/2.0 200 OK
```

### 3. Basic Call Flow
Tests complete call setup and teardown.

```bash
SIP_HOST=sip.example.com \
SIP_USERNAME=myuser \
SIP_PASSWORD=mypassword \
SIP_TARGET_USER=echo \
node tests/basic-call-flow.js
```

**Expected Flow:**
```
→ INVITE sip:echo@sip.example.com SIP/2.0
← SIP/2.0 100 Trying
← SIP/2.0 180 Ringing
← SIP/2.0 200 OK
→ ACK sip:echo@sip.example.com SIP/2.0
[call duration]
→ BYE sip:echo@sip.example.com SIP/2.0
← SIP/2.0 200 OK
```

### 4. Authentication Challenge
Tests Digest authentication mechanism.

```bash
SIP_HOST=sip.example.com SIP_USERNAME=test node tests/auth-challenge.js
```

### 5. Error Handling
Tests 4xx/5xx error response handling.

```bash
SIP_HOST=sip.example.com SIP_USERNAME=test node tests/error-handling.js
```

## API Reference

### SIPMessageBuilder

Build RFC3261-compliant SIP messages.

```javascript
import { SIPMessageBuilder } from './src/sip-message-builder.js';

const builder = new SIPMessageBuilder({
  localIP: '192.168.1.100',
  localPort: 5060,
  userAgent: 'SIPPER/1.0'
});

// Build INVITE
const { message, metadata } = builder.buildINVITE({
  fromUser: 'alice',
  fromDomain: 'example.com',
  toUser: 'bob',
  toDomain: 'example.com',
  sdp: true
});

// Build REGISTER
const register = builder.buildREGISTER({
  username: 'alice',
  domain: 'example.com',
  expires: 3600
});

// Build ACK
const ack = builder.buildACK({
  fromUser: 'alice',
  fromDomain: 'example.com',
  toUser: 'bob',
  toDomain: 'example.com',
  callId: metadata.callId,
  cseq: metadata.cseq,
  fromTag: metadata.fromTag,
  toTag: 'tag-from-200-ok'
});
```

### SIPParser

Parse and validate SIP messages.

```javascript
import { SIPParser } from './src/sip-parser.js';

const rawMessage = `SIP/2.0 200 OK
Via: SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK776asdhds
From: <sip:alice@example.com>;tag=1928301774
To: <sip:bob@example.com>;tag=a6c85cf
Call-ID: a84b4c76e66710@pc33.example.com
CSeq: 314159 INVITE
Content-Length: 0

`;

const parsed = SIPParser.parse(rawMessage);
// {
//   valid: true,
//   type: 'response',
//   statusCode: 200,
//   reasonPhrase: 'OK',
//   headers: { ... },
//   callId: 'a84b4c76e66710@pc33.example.com',
//   cseq: { number: 314159, method: 'INVITE' },
//   ...
// }

// Validate RFC3261 compliance
const compliance = SIPParser.validateRFC3261(parsed);
// {
//   compliant: true,
//   violations: []
// }
```

### SIPClient

Async UDP socket communication.

```javascript
import { SIPClient } from './src/sip-client.js';

const client = new SIPClient({
  localIP: '0.0.0.0',
  localPort: 5060,
  timeout: 5000
});

// Listen for messages
client.on('message:received', ({ parsed, rinfo }) => {
  console.log('Received:', parsed.statusCode || parsed.method);
});

await client.listen();

// Send and wait for response
const response = await client.sendAndWait(
  sipMessage,
  'sip.example.com',
  5060
);

console.log('Response time:', response.responseTime, 'ms');

await client.close();
```

### SIPTestEngine

High-level test orchestration.

```javascript
import { SIPTestEngine } from './src/test-engine.js';

const engine = new SIPTestEngine({
  localIP: '0.0.0.0',
  localPort: 5060,
  username: 'test',
  domain: 'example.com'
});

await engine.init();

// Run individual tests
await engine.testOPTIONSPing(endpoint);
await engine.testREGISTER(endpoint);
await engine.testBasicCallFlow(endpoint);
await engine.testAuthChallenge(endpoint);
await engine.testErrorHandling(endpoint);

// Get results
const report = engine.generateReport();
// {
//   summary: {
//     totalTests: 5,
//     passedTests: 4,
//     failedTests: 1,
//     passRate: '80.00%',
//     totalViolations: 0
//   },
//   tests: [...]
// }

engine.printReport(); // Console output
await engine.shutdown();
```

### TelnyxIntegration

Telnyx-specific helpers.

```javascript
import { TelnyxIntegration } from './src/telnyx-integration.js';

// Get endpoint by region
const endpoint = TelnyxIntegration.getEndpoint('us-east');
// {
//   host: 'sip.telnyx.com',
//   port: 5060,
//   domain: 'sip.telnyx.com',
//   description: 'Telnyx US East'
// }

// Create credentials
const config = TelnyxIntegration.createCredentials(
  'my-username',
  'my-password',
  'us-east'
);

// Validate configuration
const validation = TelnyxIntegration.validateConnectionRequirements(config);

// Get best practices
const practices = TelnyxIntegration.getBestPractices();
// {
//   registration: { expiresRecommended: 1800, ... },
//   keepalive: { method: 'OPTIONS', intervalSeconds: 30 },
//   codecs: { recommended: ['PCMU', 'PCMA', 'G722'] },
//   ...
// }

// Build Telnyx-optimized SDP
const sdp = TelnyxIntegration.buildTelnyxSDP('192.168.1.100', 10000);
```

## Configuration

### Environment Variables

```bash
# SIP Endpoint
SIP_HOST=sip.example.com
SIP_PORT=5060
SIP_DOMAIN=example.com

# Credentials
SIP_USERNAME=myuser
SIP_PASSWORD=mypassword

# Telnyx
TELNYX_SIP_USERNAME=your-sip-username
TELNYX_SIP_PASSWORD=your-sip-password
TELNYX_REGION=us-east  # us-east, us-west, eu, au

# Test Target
SIP_TARGET_USER=echo
```

### Programmatic Configuration

```javascript
const config = {
  localIP: '0.0.0.0',        // Local bind IP
  localPort: 5060,            // Local bind port
  transport: 'UDP',           // UDP, TCP, TLS
  timeout: 10000,             // Transaction timeout (ms)
  username: 'myuser',         // SIP username
  domain: 'example.com',      // SIP domain
  userAgent: 'SIPPER/1.0'     // User-Agent header
};
```

## Test Report Format

### Console Output

```
============================================================
SIPPER TEST REPORT
============================================================
Total Tests: 4
Passed: 3
Failed: 1
Pass Rate: 75.00%
RFC3261 Violations: 0
============================================================

✓ OPTIONS Ping (245ms)
  Metrics:
    responseTime: 245

✓ Authentication Challenge (312ms)
  Metrics:
    challengeType: WWW-Authenticate
    authScheme: Digest
    realm: sip.example.com
    algorithm: MD5

✗ REGISTER (5124ms)
  Errors:
    - Authentication failed: 403
  Metrics:
    responseTime: 124
    authRequired: true
    authResponseTime: 5000

✓ Error Response Handling (89ms)
  Metrics:
    statusCode: 404
    reasonPhrase: Not Found
```

### JSON Output

```json
{
  "summary": {
    "totalTests": 4,
    "passedTests": 3,
    "failedTests": 1,
    "passRate": "75.00%",
    "totalViolations": 0
  },
  "tests": [
    {
      "name": "OPTIONS Ping",
      "passed": true,
      "duration": "245ms",
      "errors": [],
      "violations": [],
      "metrics": {
        "responseTime": 245
      }
    }
  ]
}
```

## RFC3261 Compliance

SIPPER validates the following RFC3261 requirements:

- ✅ Via branch parameter magic cookie (`z9hG4bK`)
- ✅ CSeq method matches request method
- ✅ Max-Forwards range (0-255)
- ✅ Content-Length matches body length
- ✅ Required headers present (Via, From, To, Call-ID, CSeq)
- ✅ Proper header formatting
- ✅ SDP structure validation

## Telnyx Best Practices

### Registration
- Expires: 1800 seconds (30 minutes)
- Re-register 60 seconds before expiry
- Use Digest authentication (MD5, qop=auth)

### Keepalive
- Send OPTIONS every 30 seconds
- Maintains NAT bindings
- Detects network issues

### Codecs
- Recommended: PCMU, PCMA, G722
- DTMF: RFC2833 (telephone-event/8000)
- Ptime: 20ms

### Transport
- Preferred: UDP port 5060
- Also supported: TCP, TLS

## Troubleshooting

### "Transaction timeout"
- Check network connectivity
- Verify SIP host/port
- Increase timeout in config

### "Authentication failed: 403"
- Verify SIP credentials
- Check IP whitelist on server
- Ensure username/password correct

### "Missing required header"
- Message not RFC3261 compliant
- Parser detected malformed SIP message

### "Invalid SIP response"
- Server sent non-SIP response
- Check you're connecting to SIP endpoint

## Architecture

```
┌─────────────────────────────────────────────┐
│         SIPTestEngine                       │
│  (Test orchestration & reporting)           │
└──────────────┬──────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐  ┌────▼────────────┐
│ SIPClient   │  │ SIPMessageBuilder│
│ (Socket I/O)│  │ (Message creation)│
└──────┬──────┘  └─────────────────┘
       │
┌──────▼──────────┐
│   SIPParser     │
│(Parse/Validate) │
└─────────────────┘
```

## License

MIT

## Author

Danilo Maldone - Solutions Engineer @ Telnyx

## Version

1.0.0
