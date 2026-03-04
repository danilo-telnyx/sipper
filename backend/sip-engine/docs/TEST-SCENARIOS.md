# SIPPER Test Scenarios

Comprehensive documentation of all test scenarios supported by SIPPER.

## 1. OPTIONS Ping

### Purpose
Test basic SIP connectivity and endpoint availability.

### Flow
```
Client                          Server
  |                               |
  |---> OPTIONS                   |
  |                               |
  |<--- 200 OK                    |
  |                               |
```

### Test Validation
- ✅ Response received within timeout
- ✅ Status code 200 OK
- ✅ RFC3261 compliance
- ✅ Response time tracking

### Expected Metrics
```json
{
  "responseTime": 150
}
```

### Use Cases
- Keepalive / heartbeat
- NAT traversal maintenance
- Endpoint availability check
- Network latency measurement

### Telnyx Recommendation
Send OPTIONS every 30 seconds to maintain NAT bindings.

---

## 2. REGISTER

### Purpose
Test SIP registration with authentication.

### Flow (Without Authentication)
```
Client                          Server
  |                               |
  |---> REGISTER                  |
  |                               |
  |<--- 200 OK                    |
  |                               |
```

### Flow (With Authentication)
```
Client                          Server
  |                               |
  |---> REGISTER                  |
  |                               |
  |<--- 401 Unauthorized          |
  |     (WWW-Authenticate)        |
  |                               |
  |---> REGISTER                  |
  |     (Authorization header)    |
  |                               |
  |<--- 200 OK                    |
  |                               |
```

### Test Validation
- ✅ Initial REGISTER sent
- ✅ Auth challenge detected (401/407)
- ✅ Digest auth header generated
- ✅ Authenticated REGISTER succeeds
- ✅ RFC3261 compliance

### Expected Metrics
```json
{
  "responseTime": 124,
  "authRequired": true,
  "authScheme": "Digest",
  "realm": "sip.telnyx.com",
  "authResponseTime": 156
}
```

### Authentication Parameters
- **Scheme**: Digest
- **Algorithm**: MD5
- **QoP**: auth
- **NC**: 00000001
- **CNonce**: Random 8-byte hex

### Use Cases
- Initial endpoint registration
- Re-registration before expiry
- Testing authentication flow
- Credential validation

### Telnyx Best Practice
- Expires: 1800 seconds (30 minutes)
- Re-register 60 seconds before expiry
- Use Contact header with public IP

---

## 3. Basic Call Flow

### Purpose
Test complete call setup, establishment, and teardown.

### Flow
```
Client                          Server
  |                               |
  |---> INVITE (with SDP)         |
  |                               |
  |<--- 100 Trying                |
  |                               |
  |<--- 180 Ringing               |
  |                               |
  |<--- 200 OK (with SDP)         |
  |                               |
  |---> ACK                       |
  |                               |
  |===== Media Session =====      |
  |                               |
  |---> BYE                       |
  |                               |
  |<--- 200 OK                    |
  |                               |
```

### Test Validation
- ✅ INVITE sent with SDP
- ✅ Provisional response (100/180)
- ✅ 200 OK received
- ✅ To tag extracted
- ✅ ACK sent
- ✅ BYE sent
- ✅ Call teardown confirmed
- ✅ RFC3261 compliance on all messages

### Expected Metrics
```json
{
  "inviteResponseTime": 1234,
  "provisionalResponse": 180,
  "byeResponseTime": 89
}
```

### SDP Example
```
v=0
o=sipper 1709567890 1709567890 IN IP4 192.168.1.100
s=SIPPER Test Call
c=IN IP4 192.168.1.100
t=0 0
m=audio 10000 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-15
a=sendrecv
```

### Use Cases
- End-to-end call testing
- SDP negotiation validation
- Call setup performance
- Media capability check

### Notes
- ACK is non-transactional (no response expected)
- Call-ID and tags must match throughout session
- Media (RTP) not actually transmitted in test

---

## 4. Authentication Challenge

### Purpose
Test Digest authentication mechanism in detail.

### Flow
```
Client                          Server
  |                               |
  |---> REGISTER (no auth)        |
  |                               |
  |<--- 401 Unauthorized          |
  |     WWW-Authenticate:         |
  |       Digest                  |
  |       realm="sip.example.com" |
  |       nonce="abc123..."       |
  |       algorithm=MD5           |
  |       qop="auth"              |
  |                               |
```

### Test Validation
- ✅ 401 or 407 response received
- ✅ WWW-Authenticate or Proxy-Authenticate present
- ✅ Digest scheme detected
- ✅ Nonce present
- ✅ Realm extracted
- ✅ Algorithm validated (MD5)

### Expected Metrics
```json
{
  "challengeType": "WWW-Authenticate",
  "authScheme": "Digest",
  "realm": "sip.telnyx.com",
  "algorithm": "MD5",
  "qop": "auth"
}
```

### Digest Calculation
```javascript
// HA1 = MD5(username:realm:password)
const ha1 = md5('alice:sip.example.com:secret123');

// HA2 = MD5(method:uri)
const ha2 = md5('REGISTER:sip:sip.example.com');

// Response = MD5(HA1:nonce:nc:cnonce:qop:HA2)
const response = md5(`${ha1}:${nonce}:00000001:${cnonce}:auth:${ha2}`);
```

### Use Cases
- Credential validation
- Authentication mechanism testing
- Security policy verification
- QoP support detection

---

## 5. Error Response Handling

### Purpose
Test proper handling of SIP error responses.

### Flow
```
Client                          Server
  |                               |
  |---> INVITE (to invalid user)  |
  |                               |
  |<--- 404 Not Found             |
  |                               |
```

### Test Validation
- ✅ Error status code (4xx/5xx/6xx)
- ✅ Reason phrase present
- ✅ RFC3261 compliance
- ✅ Proper error handling

### Common Error Codes

| Code | Reason                | Meaning                                  |
|------|-----------------------|------------------------------------------|
| 400  | Bad Request           | Malformed SIP message                    |
| 401  | Unauthorized          | Authentication required                  |
| 403  | Forbidden             | Authenticated but not authorized         |
| 404  | Not Found             | User/number not found                    |
| 407  | Proxy Auth Required   | Proxy authentication required            |
| 408  | Request Timeout       | Request took too long                    |
| 480  | Temporarily Unavail   | User temporarily unavailable             |
| 484  | Address Incomplete    | Invalid phone number format              |
| 486  | Busy Here             | User is busy                             |
| 487  | Request Terminated    | Call cancelled by originator             |
| 488  | Not Acceptable Here   | SDP/media not acceptable                 |
| 500  | Server Internal Error | Server error                             |
| 503  | Service Unavailable   | Server overload/maintenance              |
| 603  | Decline               | User explicitly declined call            |

### Expected Metrics
```json
{
  "statusCode": 404,
  "reasonPhrase": "Not Found",
  "unexpectedErrorCode": false
}
```

### Use Cases
- Error handling validation
- Service availability testing
- User existence checking
- Network troubleshooting

---

## 6. CANCEL Request

### Purpose
Cancel an in-progress INVITE request.

### Flow
```
Client                          Server
  |                               |
  |---> INVITE                    |
  |                               |
  |<--- 100 Trying                |
  |                               |
  |---> CANCEL                    |
  |                               |
  |<--- 200 OK (for CANCEL)       |
  |                               |
  |<--- 487 Request Terminated    |
  |     (for original INVITE)     |
  |                               |
  |---> ACK                       |
  |                               |
```

### Test Validation
- ✅ CANCEL sent while INVITE pending
- ✅ CANCEL uses same Call-ID, CSeq, branch
- ✅ 200 OK for CANCEL received
- ✅ 487 for INVITE received
- ✅ ACK sent for 487

### Notes
- CANCEL must match INVITE exactly (Call-ID, CSeq number, branch)
- CSeq method is "CANCEL"
- Only works on pending INVITE (before final response)

---

## Test Execution Matrix

| Test Scenario          | Duration | Auth Required | SDP Required | Expected Status |
|------------------------|----------|---------------|--------------|-----------------|
| OPTIONS Ping           | < 1s     | No            | No           | 200             |
| REGISTER (no auth)     | < 1s     | No            | No           | 200/401/407     |
| REGISTER (with auth)   | 1-2s     | Yes           | No           | 200             |
| Basic Call Flow        | 2-5s     | Optional      | Yes          | 200             |
| Auth Challenge         | < 1s     | N/A           | No           | 401/407         |
| Error Handling         | < 1s     | No            | Optional     | 4xx/5xx/6xx     |
| CANCEL                 | 1-2s     | Optional      | Yes (INVITE) | 200, 487        |

---

## Metrics Collection

### Per-Test Metrics
- **responseTime**: Time from request sent to response received (ms)
- **authRequired**: Boolean indicating if authentication was needed
- **authScheme**: Authentication scheme (Digest)
- **realm**: Authentication realm
- **statusCode**: Final SIP status code
- **provisionalResponse**: Provisional status code (100, 180, 183)

### Global Metrics
- **totalTests**: Number of tests executed
- **passedTests**: Number of tests that passed
- **failedTests**: Number of tests that failed
- **passRate**: Percentage of passed tests
- **totalViolations**: Total RFC3261 violations detected

---

## RFC3261 Violations Detected

SIPPER automatically detects the following violations:

1. **Via Branch Magic Cookie Missing**
   - Via branch must start with `z9hG4bK`

2. **CSeq Method Mismatch**
   - CSeq method must match request method

3. **Max-Forwards Out of Range**
   - Must be 0-255

4. **Content-Length Mismatch**
   - Content-Length header must match body length

5. **Missing Required Headers**
   - Via, From, To, Call-ID, CSeq required in all messages

---

## Example Test Output

```bash
$ node tests/run-all.js

🚀 SIPPER - SIP Testing Engine
Running Full Test Suite

============================================================

▶ Running test: OPTIONS Ping
✓ Test passed: OPTIONS Ping (245ms)

▶ Running test: Authentication Challenge
✓ Test passed: Authentication Challenge (312ms)

▶ Running test: REGISTER
✓ Test passed: REGISTER (1456ms)

▶ Running test: Error Response Handling
✓ Test passed: Error Response Handling (89ms)

============================================================
SIPPER TEST REPORT
============================================================
Total Tests: 4
Passed: 4
Failed: 0
Pass Rate: 100.00%
RFC3261 Violations: 0
============================================================

✓ OPTIONS Ping (245ms)
  Metrics:
    responseTime: 245

✓ Authentication Challenge (312ms)
  Metrics:
    challengeType: WWW-Authenticate
    authScheme: Digest
    realm: sip.telnyx.com
    algorithm: MD5
    qop: auth

✓ REGISTER (1456ms)
  Metrics:
    responseTime: 124
    authRequired: true
    authResponseTime: 1332

✓ Error Response Handling (89ms)
  Metrics:
    statusCode: 404
    reasonPhrase: Not Found

============================================================
```

---

## Custom Test Scenarios

### Creating Your Own Test

```javascript
async function customTest(result) {
  const { message, metadata } = this.builder.buildINVITE({
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com'
  });

  result.messages.push({ 
    direction: 'out', 
    method: 'INVITE', 
    message 
  });

  const response = await this.client.sendAndWait(
    message,
    'sip.example.com',
    5060
  );

  result.messages.push({ 
    direction: 'in', 
    statusCode: response.parsed.statusCode,
    message: response.parsed 
  });

  result.metrics.responseTime = response.responseTime;

  if (response.parsed.statusCode !== 200) {
    result.errors.push(`Test failed: ${response.parsed.statusCode}`);
  }

  // Validate RFC3261
  const compliance = SIPParser.validateRFC3261(response.parsed);
  if (!compliance.compliant) {
    result.violations.push(...compliance.violations);
  }
}

// Run it
await engine.runTest('My Custom Test', customTest);
```

---

## Next Steps

- Add TCP transport support
- Add TLS transport support
- Implement actual RTP media exchange
- Add SUBSCRIBE/NOTIFY testing
- Add MESSAGE (SIP IM) testing
- Add call transfer scenarios (REFER)
- Add codec negotiation validation
- Add NAT traversal testing (STUN/TURN)
