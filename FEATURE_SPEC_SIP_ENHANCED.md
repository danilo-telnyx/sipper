# Feature Specification: Enhanced SIP Testing Suite

**Version**: 0.3.0  
**Status**: IN PROGRESS  
**Tracking**: This is a multi-phase enhancement

## Overview

Comprehensive SIP protocol testing with RFC compliance, including:
- Unauthenticated SIP messages (INVITE, REGISTER, OPTIONS)
- SIP REC (RFC 7865 - Session Recording Protocol)
- SIP REFER (RFC 3515 - Call Transfer Method)
- Mandatory parameter validation
- Context-sensitive help system

## RFC Standards Referenced

### Core SIP
- **RFC 3261**: SIP: Session Initiation Protocol
- **RFC 3515**: The Session Initiation Protocol (SIP) Refer Method
- **RFC 3891**: The "Replaces" Header Field
- **RFC 4028**: Session Timers

### SIP Recording
- **RFC 7865**: Session Initiation Protocol (SIP) Recording Metadata
- **RFC 7866**: Session Recording Protocol
- **RFC 8068**: Session Initiation Protocol (SIP) Recording Call Flows

### Authentication
- **RFC 2617**: HTTP Authentication (Digest)
- **RFC 3310**: SIP Authentication Schemes

## Phase 1: Backend SIP Engine Enhancements

### 1.1 Unauthenticated Message Support

**New Methods**:
- `buildUnauthenticatedINVITE()` - No credentials required
- `buildUnauthenticatedREGISTER()` - Test server response
- `buildOPTIONS()` - Already exists, ensure unauthenticated mode

**Mandatory Parameters** (RFC 3261):
- Request-URI
- Via (with branch parameter starting with "z9hG4bK")
- From (with tag parameter)
- To
- Call-ID
- CSeq
- Max-Forwards (default: 70)
- Contact (for INVITE, REGISTER)

**Optional Parameters**:
- Authorization header (for authenticated flow)
- Route/Record-Route
- Content-Type + body (for INVITE with SDP)

### 1.2 SIP REFER Support (RFC 3515)

**Method**: REFER  
**Purpose**: Call transfer, attended/unattended transfer

**Mandatory Headers**:
- All standard SIP headers (Via, From, To, Call-ID, CSeq)
- **Refer-To**: Target URI for the referee
- Contact

**Optional Headers**:
- Referred-By: Identity of referrer
- Replaces: For attended transfer (RFC 3891)

**Example Flow**:
```
1. REFER (A → B): Transfer B to C
2. 202 Accepted (B → A)
3. NOTIFY (B → A): sipfrag with INVITE status
4. 200 OK (A → B)
```

### 1.3 SIP REC Support (RFC 7865)

**Session Recording Metadata**:
- Recording-Session header
- Content-Type: application/rs-metadata+xml

**Recording Modes**:
- **Always**: Record from call start
- **Never**: No recording
- **On-demand**: Start/stop during call

**Mandatory Parameters**:
- Recording-Session: URI + parameters
- session-id: UUID
- reason: Legal, QualityAssurance, etc.

**Example Flow**:
```
INVITE with Recording-Session header →
200 OK with rec-session-id →
Media streams duplicated to SRS (Session Recording Server)
```

### 1.4 Parameter Validation Schema

```typescript
interface SIPMessageParams {
  // Mandatory for all
  method: 'INVITE' | 'REGISTER' | 'OPTIONS' | 'REFER' | 'BYE' | 'CANCEL';
  fromUser: string;  // Required
  fromDomain: string;  // Required
  toUser: string;  // Required
  toDomain: string;  // Required
  
  // Optional
  authenticated?: boolean;  // Default: false
  username?: string;  // Required if authenticated=true
  password?: string;  // Required if authenticated=true
  callId?: string;  // Auto-generated if not provided
  cseq?: number;  // Auto-generated if not provided
  
  // Method-specific
  sdp?: string;  // For INVITE
  referTo?: string;  // Required for REFER
  replaces?: string;  // Optional for REFER (attended transfer)
  recordingSession?: RecordingSessionParams;  // For REC
}
```

## Phase 2: Frontend Enhancements

### 2.1 SIP Test Builder UI

**Component**: `<SIPTestBuilder />`

**Features**:
- Method selector (INVITE, REGISTER, OPTIONS, REFER)
- Authentication toggle
- Auto-validation of mandatory fields
- Real-time RFC compliance checker
- SDP editor (for INVITE)
- REFER flow builder (for transfers)
- Recording metadata builder (for REC)

### 2.2 Collapsible Help Guide System

**Component**: `<ContextualHelpPanel />`

**Requirements**:
- Collapsible lateral panel (right side, 300-400px wide)
- Context-aware content based on current page/action
- Markdown rendering for documentation
- Code samples with copy button
- RFC references with links
- Always accessible (toggle button in nav bar)

**Content Structure**:
```
/help/
  credentials.md      - Credentials page help
  test-builder.md     - Test builder help
  sip-invite.md       - INVITE method guide
  sip-register.md     - REGISTER method guide
  sip-refer.md        - REFER method guide
  sip-rec.md          - Recording guide
  examples/
    basic-call.md
    attended-transfer.md
    recording-session.md
```

**UI States**:
- Collapsed: Icon button only (right edge)
- Expanded: Full panel with tabbed sections
  - **Guide**: Step-by-step instructions
  - **Examples**: Copy-paste ready samples
  - **RFCs**: Relevant standards with links
  - **Troubleshooting**: Common issues

### 2.3 Test Flow Visualizer

**Component**: `<SIPFlowDiagram />`

**Features**:
- Visual sequence diagram of SIP messages
- Color-coded by response class (1xx, 2xx, 3xx, 4xx, 5xx)
- Expandable message details
- Export as PNG/SVG

## Phase 3: Testing & Documentation

### 3.1 Backend Tests

- `test_unauthenticated_invite.py`
- `test_unauthenticated_register.py`
- `test_sip_refer_flow.py`
- `test_sip_rec_metadata.py`
- Parameter validation tests

### 3.2 Integration Tests

- Full INVITE → 200 OK → ACK flow
- REGISTER → 401 → REGISTER (with auth) → 200 OK
- REFER → 202 → NOTIFY flow
- Recording session lifecycle

### 3.3 Documentation

- User guide for each SIP method
- RFC compliance matrix
- Troubleshooting guide
- Example scenarios

## Implementation Plan

### Sprint 1: Backend Core (Current)
- [ ] Add unauthenticated message builders
- [ ] Add REFER method support
- [ ] Add REC metadata support
- [ ] Parameter validation schemas
- [ ] Backend tests

### Sprint 2: Frontend UI
- [ ] SIP Test Builder component
- [ ] Parameter validation UI
- [ ] Method-specific forms
- [ ] Real-time validation feedback

### Sprint 3: Help System
- [ ] Collapsible help panel component
- [ ] Context detection system
- [ ] Help content (Markdown files)
- [ ] RFC reference database
- [ ] Code sample library

### Sprint 4: Flow Visualization
- [ ] SIP flow diagram component
- [ ] Message sequence renderer
- [ ] Export functionality

### Sprint 5: Integration & Polish
- [ ] End-to-end testing
- [ ] Documentation completion
- [ ] Performance optimization
- [ ] Accessibility audit

## Version Planning

- **v0.2.0** (Current): Telnyx Auto-Import + Security Hardening
- **v0.3.0** (Next): SIP Enhanced Testing (This Feature)
- **v0.4.0** (Future): Advanced Recording & Analytics

## Success Criteria

- [ ] All RFC-mandated parameters enforced
- [ ] Unauthenticated INVITE/REGISTER work correctly
- [ ] REFER flow completes successfully
- [ ] REC metadata properly formatted per RFC 7865
- [ ] Help guide accessible on all pages
- [ ] 95%+ test coverage for new code
- [ ] Zero regressions on existing features

---

**Note**: This is a comprehensive feature. Given RALPH LOOP constraints (complete production delivery), I'm implementing this in a single cohesive commit but documenting the logical phases for clarity.
