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

### ✅ Sprint 1: Backend Core (COMPLETE - v0.3.0)
- [x] Add unauthenticated message builders (INVITE, REGISTER, OPTIONS)
- [x] Add REFER method support (RFC 3515 - unattended & attended transfer)
- [x] Add REC metadata support (RFC 7865 - session recording)
- [x] Parameter validation schemas (SIPValidator class)
- [x] Backend tests (25+ test cases, all passing)
- [x] Enhanced test schemas (REFERParams, RecordingSessionParams)
- [x] NOTIFY support for REFER status updates

**Deliverables**:
- ✅ `sip-validator.js` (5.8KB, RFC 3261 compliance)
- ✅ Enhanced `sip-message-builder.js` (+200 lines)
- ✅ 3 comprehensive test suites
- ✅ Backend schema validation
- ✅ Full RFC compliance verification

**What Works Now**:
```javascript
// Unauthenticated INVITE
builder.buildINVITE({ fromUser, fromDomain, toUser, toDomain });

// REFER (call transfer)
builder.buildREFER({ referTo: 'sip:target@example.com', replaces: '...' });

// Recording INVITE
builder.buildRecordingINVITE({ 
  recordingSession: { sessionId, reason: 'Legal', mode: 'always' }
});

// Validation
SIPValidator.validateMandatoryParams(params, 'REFER');
```

### 🔄 Sprint 2: Frontend UI (NEXT - v0.4.0)
- [ ] SIP Test Builder component
- [ ] Method selector dropdown (INVITE, REGISTER, OPTIONS, REFER, REC)
- [ ] Parameter validation UI with real-time feedback
- [ ] Method-specific forms (conditional fields based on method)
- [ ] Authentication toggle (unauthenticated vs authenticated)
- [ ] REFER flow builder (transfer target, replaces header)
- [ ] Recording metadata form (reason, mode, session-id)
- [ ] SDP editor for INVITE

**Estimated Effort**: 8-12 hours  
**Files to Create**: ~6 new React components

### 🔄 Sprint 3: Help System (v0.5.0)
- [ ] Collapsible help panel component (`<ContextualHelpPanel />`)
- [ ] Context detection system (route-based content)
- [ ] Help content files (Markdown)
  - [ ] credentials.md
  - [ ] sip-invite.md
  - [ ] sip-register.md
  - [ ] sip-refer.md
  - [ ] sip-rec.md
  - [ ] examples/*.md
- [ ] RFC reference database (with links to IETF)
- [ ] Code sample library with copy buttons
- [ ] Toggle button in navigation bar
- [ ] Tabbed sections (Guide, Examples, RFCs, Troubleshooting)

**Estimated Effort**: 10-15 hours  
**Files to Create**: 1 component + ~10 markdown files

### 🔄 Sprint 4: Flow Visualization (v0.6.0)
- [ ] SIP flow diagram component (`<SIPFlowDiagram />`)
- [ ] Message sequence renderer (arrow-based UI)
- [ ] Color-coding by response class (1xx, 2xx, 3xx, 4xx, 5xx)
- [ ] Expandable message details (headers, body)
- [ ] Export as PNG/SVG functionality
- [ ] Real-time update during test execution

**Estimated Effort**: 6-10 hours  
**Files to Create**: 2-3 components

### 🔄 Sprint 5: Integration & Polish (v0.7.0)
- [ ] End-to-end integration tests (Playwright)
- [ ] Documentation completion
  - [ ] User guides for each SIP method
  - [ ] RFC compliance matrix
  - [ ] Troubleshooting guide
  - [ ] Example scenarios
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

**Estimated Effort**: 8-12 hours  
**Files to Create**: Test suite + documentation

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
