# INVITE Method User Guide

**SIP Method**: INVITE  
**RFC**: 3261 §13  
**Purpose**: Initiate a SIP session (call setup)

---

## Overview

The INVITE method is used to establish a SIP session between two parties. It initiates the three-way handshake (INVITE → 200 OK → ACK) and negotiates session parameters using SDP.

---

## When to Use

- ✅ Testing call setup functionality
- ✅ Verifying SDP offer/answer negotiation
- ✅ Testing provisional responses (100 Trying, 180 Ringing)
- ✅ Validating media codec support
- ✅ Testing session recording metadata (RFC 7865)

---

## Message Flow

```
Client                    Server
  |                         |
  |--- INVITE (with SDP) -->|
  |                         |
  |<--- 100 Trying ---------|
  |                         |
  |<--- 180 Ringing --------|
  |                         |
  |<--- 200 OK (with SDP) --|
  |                         |
  |--- ACK ---------------->|
  |                         |
  |   [ RTP Media Session ] |
  |                         |
  |--- BYE ---------------->|
  |                         |
  |<--- 200 OK -------------|
```

---

## Using SIPPER's SIP Test Builder

### Step 1: Navigate to Test Builder
Go to **Test Runner** > **Enhanced SIP Testing** or directly to `/sip-test-builder`

### Step 2: Select INVITE Method
Click the **INVITE** card in the Method Selector.

### Step 3: Configure Parameters

**Mandatory Fields**:
- **From User**: Your SIP username (e.g., `alice`)
- **From Domain**: Your SIP domain (e.g., `example.com`)
- **To User**: Destination username (e.g., `bob`)
- **To Domain**: Destination domain (e.g., `example.com`)

**Optional Fields**:
- **Authentication**: Toggle ON if server requires authentication
  - Username (required if auth enabled)
  - Password (required if auth enabled)
- **SDP Body**: Click "Use Template" for default or write custom SDP
- **Recording Metadata**: Toggle ON to add RFC 7865 recording headers

### Step 4: Add SDP (Recommended)

Click **"Use Template"** in the SDP Editor to get:
```sdp
v=0
o=- 3883943947 3883943947 IN IP4 127.0.0.1
s=Session
c=IN IP4 127.0.0.1
t=0 0
m=audio 5004 RTP/AVP 0 8 101
a=rtpmap:0 PCMU/8000
a=rtpmap:8 PCMA/8000
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-16
a=sendrecv
```

**Key SDP Fields**:
- `v=0`: SDP version
- `o=`: Origin (session owner)
- `s=`: Session name
- `c=`: Connection information (IP address)
- `t=`: Timing (0 0 = permanent session)
- `m=`: Media description (audio, port, codecs)
- `a=`: Attributes (codec mappings, send/receive mode)

### Step 5: (Optional) Enable Recording

Toggle **"Session Recording"** ON to add metadata:
- **Session ID**: Auto-generated UUID
- **Reason**: Legal, QualityAssurance, Training, etc.
- **Mode**: always, never, on-demand

### Step 6: Validate and Run

Check for the **✅ RFC Compliant** badge at the bottom. If you see validation errors, fix them before proceeding.

Click **"Run SIP Test"** to execute.

---

## Expected Server Responses

### Provisional Responses (1xx)
- **100 Trying**: Server received request and is processing
- **180 Ringing**: Destination is ringing
- **183 Session Progress**: Early media available

### Success Response (2xx)
- **200 OK**: Call accepted, session established
  - **Must contain**: SDP answer
  - **Must contain**: To tag
  - **Must contain**: Contact header

### Redirection (3xx)
- **301 Moved Permanently**: Contact URI changed permanently
- **302 Moved Temporarily**: Try alternate URI

### Client Errors (4xx)
- **400 Bad Request**: Malformed INVITE
- **401 Unauthorized**: Authentication required
- **404 Not Found**: User not found
- **486 Busy Here**: User is busy

### Server Errors (5xx)
- **500 Server Internal Error**: Server malfunction
- **503 Service Unavailable**: Server overloaded

---

## Common Issues & Troubleshooting

### Issue: 400 Bad Request
**Cause**: Missing mandatory SDP fields  
**Solution**: Use the SDP template or ensure all required fields are present (v, o, s, c, t, m)

### Issue: 401 Unauthorized
**Cause**: Server requires authentication  
**Solution**: Toggle "Authentication" ON and provide username/password

### Issue: 415 Unsupported Media Type
**Cause**: Missing Content-Type header or incorrect SDP  
**Solution**: Ensure Content-Type: application/sdp is set (automatic in SIPPER)

### Issue: 488 Not Acceptable Here
**Cause**: Codec negotiation failed  
**Solution**: Check SDP codec list matches server capabilities

---

## Best Practices

1. **Always include SDP**: Most servers expect SDP in INVITE
2. **Use multiple codecs**: Offer PCMU (0), PCMA (8), and telephone-event (101)
3. **Set sendrecv mode**: Explicitly state media direction with `a=sendrecv`
4. **Include Contact header**: Required for future requests in the dialog
5. **Send ACK promptly**: Always send ACK within 500ms of receiving 200 OK

---

## Example Test Scenarios

### Scenario 1: Basic Call
**Goal**: Test basic call setup  
**Config**:
- Method: INVITE
- Auth: OFF
- SDP: Use template
- Recording: OFF

**Expected**: 100 → 180 → 200 OK

---

### Scenario 2: Authenticated Call with Recording
**Goal**: Test authentication and recording metadata  
**Config**:
- Method: INVITE
- Auth: ON (username/password)
- SDP: Use template
- Recording: ON (Legal, always)

**Expected**: 401 → INVITE (with auth) → 200 OK with Recording-Session header

---

### Scenario 3: Codec Negotiation Test
**Goal**: Verify codec support  
**Config**:
- Method: INVITE
- SDP: Custom (modify codec list to test specific codecs)

**Expected**: 200 OK with SDP answer listing supported codecs

---

## RFC References

- **RFC 3261 §13**: INVITE method specification
- **RFC 3264**: Offer/Answer Model with SDP
- **RFC 4566**: SDP format
- **RFC 7865**: Session Recording metadata

---

## See Also

- [REGISTER Guide](REGISTER_GUIDE.md) - Authentication flow
- [BYE Guide](BYE_GUIDE.md) - Session termination
- [ACK Guide](ACK_GUIDE.md) - Three-way handshake
- [RFC Compliance Matrix](../RFC_COMPLIANCE_MATRIX.md)
