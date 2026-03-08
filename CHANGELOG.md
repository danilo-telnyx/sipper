# Changelog

All notable changes to SIPPER will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-03-08

### Added - Sprint 3: Help System
- **Contextual Help Panel**: Collapsible right-side panel (300-450px wide)
  - Context-aware content based on current route
  - Toggle button in navigation header (HelpCircle icon)
  - Keyboard shortcuts: `?` to toggle, `ESC` to close
  - Smooth slide-in/out animations
  
- **Tabbed Help Interface**:
  - **Guide**: Step-by-step instructions for each page
  - **Examples**: Copy-paste ready code samples with syntax highlighting
  - **RFCs**: Relevant RFC references with IETF links
  - **Troubleshooting**: Common problems and solutions
  
- **Help Content Database** (`helpContent.ts`):
  - Dashboard help
  - Credentials Manager help (with Telnyx Auto-Import guide)
  - Classic Test Runner help
  - Enhanced SIP Test Builder help (comprehensive)
  - Test Results help
  - User Management help
  - Organization Settings help
  
- **Code Sample Features**:
  - Syntax highlighting for SIP, JavaScript, JSON, Shell
  - One-click copy to clipboard
  - Visual feedback on copy (checkmark icon)
  
- **RFC Reference Links**:
  - Direct links to IETF datatracker
  - Section references
  - Descriptions for each RFC
  
- **New Components** (`components/help-system/`):
  - `ContextualHelpPanel.tsx`: Main help panel with backdrop
  - `HelpTabs.tsx`: Tabbed interface with 4 sections
  - `helpContent.ts`: Content database (12KB, 7 page contexts)
  - `types.ts`: TypeScript types for help content
  
- **Quick Links Section**:
  - RFC 3261 (SIP Protocol)
  - RFC 3515 (REFER Method)
  - RFC 7865 (Session Recording)
  - GitHub Repository
  
- **Keyboard Shortcuts Display**:
  - Shows available shortcuts in help panel
  - Visual kbd elements for key combinations

### Changed
- Updated `DashboardLayout.tsx` with help panel integration
- Added HelpCircle icon to Lucide imports
- Added keyboard event listeners for global shortcuts

### Testing
- ✅ Frontend build successful (no TypeScript errors)
- ✅ Help panel opens/closes smoothly
- ✅ Context detection working for all routes
- ✅ Code copying functional
- ✅ Keyboard shortcuts responsive

### Documentation
- Comprehensive help content for all major pages
- SIP examples with full message formatting
- RFC references with accurate section numbers

---

## [0.4.0] - 2026-03-08

### Added - Sprint 2: Frontend SIP Test Builder UI
- **SIP Test Builder Component**: Comprehensive UI for enhanced SIP testing
  - Method selector: INVITE, REGISTER, OPTIONS, REFER with visual cards
  - Authentication toggle: Switch between authenticated/unauthenticated flows
  - Dynamic parameter forms: Conditional fields based on selected method
  - Real-time validation: RFC compliance feedback with error/warning badges
  
- **Method-Specific Features**:
  - **INVITE**: SDP editor with template, recording metadata form (RFC 7865)
  - **REGISTER**: Standard SIP registration parameters
  - **OPTIONS**: Capability discovery (typically unauthenticated)
  - **REFER**: Call transfer builder with blind/attended transfer support (RFC 3515)
  
- **New Components** (`components/sip-test-builder/`):
  - `SIPTestBuilder.tsx`: Main orchestration component
  - `MethodSelector.tsx`: Method selection with icons and complexity badges
  - `AuthenticationToggle.tsx`: Auth flow toggle with descriptions
  - `ParameterForm.tsx`: Base SIP parameters (From, To, credentials)
  - `ValidationFeedback.tsx`: Real-time RFC validation display
  - `REFERBuilder.tsx`: Call transfer parameters (Refer-To, Replaces)
  - `RecordingMetadataForm.tsx`: Session recording metadata (RFC 7865)
  - `SDPEditor.tsx`: SDP editing with template and field explanations
  
- **Type System Extensions** (`types/sip.ts`):
  - SIP method types and parameters
  - Recording session metadata types
  - Validation result types
  - Method metadata for UI
  
- **Frontend Validation** (`utils/sip-validator.ts`):
  - RFC 3261 mandatory parameter validation
  - Method-specific validation rules
  - SDP basic structure validation
  - REFER Replaces header validation
  - URI and domain format helpers
  
- **New UI Components**:
  - `Alert`: Alert notifications (destructive, warning variants)
  - `Textarea`: Multi-line text input for SDP editing
  
- **New Page**: `/sip-test-builder` route
  - Dedicated page for enhanced SIP testing
  - Feature highlights showcase
  - Navigation to/from classic test runner
  - RFC compliance information

### Changed
- Extended type exports in `types/index.ts`
- Added UUID package dependency for recording session IDs
- Updated routing in `App.tsx`

### Testing
- ✅ Frontend build successful (no TypeScript errors)
- ✅ Component compilation verified
- ✅ Validation logic tested

### Documentation
- Updated `FEATURE_SPEC_SIP_ENHANCED.md` (Sprint 2 complete)
- Sprint 2 deliverables documented

---

## [0.3.0] - 2026-03-08

### Added - Sprint 1: Enhanced SIP Backend Core
- **REFER Method Support (RFC 3515)**: Call transfer functionality
  - Unattended transfer (basic REFER)
  - Attended transfer (REFER with Replaces header per RFC 3891)
  - NOTIFY for transfer status updates
  - Full parameter validation for REFER flows
  
- **SIP Recording Support (RFC 7865)**: Session recording metadata
  - Recording-Session header support
  - Recording metadata XML generation
  - Recording modes: always, never, on-demand
  - Valid recording reasons: Legal, QualityAssurance, Training, CustomerApproval
  
- **Unauthenticated SIP Messages**: Test server responses
  - Unauthenticated INVITE (triggers 407/401 challenge)
  - Unauthenticated REGISTER (tests registration flow)
  - Unauthenticated OPTIONS (capability discovery)
  - Complete authentication flow examples
  
- **Parameter Validation Framework**: RFC 3261 compliance
  - Mandatory parameter validation for all SIP methods
  - Method-specific validation rules
  - Warning system for recommended parameters
  - URI and domain format validation

### Testing
- ✅ 3 comprehensive test suites (unauthenticated, REFER, recording)
- ✅ 25+ test cases covering all new methods
- ✅ Backend schema tests with pytest
- ✅ Full RFC compliance verification

### Backend
- New `SIPValidator` class for parameter validation
- Enhanced `SIPMessageBuilder` with REFER, NOTIFY, Recording INVITE
- Updated test schemas with new SIP method types
- Pydantic validation for REFER and Recording parameters

### Documentation
- Feature specification (`FEATURE_SPEC_SIP_ENHANCED.md`)
- Comprehensive test documentation with RFC references
- Updated CHANGELOG with Sprint 1 completion

## [0.2.0] - 2026-03-08

### Added
- **Telnyx Auto-Import**: One-click SIP credential import from Telnyx API
  - New `/api/telnyx/fetch-credentials` endpoint
  - Auto-population of SIP fields (username, password, domain, port, transport)
  - Real-time validation and error handling
  - Comprehensive test coverage (6 test cases)
  
### Security
- **Admin Permission Enforcement**: Implemented mandatory admin/manager checks on sensitive endpoints
  - User creation (admin/manager only)
  - User deletion (admin only)
  - Role management (admin only)
  - Organization listing (admin only)
  - Organization updates (admin/manager only)
- New `app.auth.permissions` module with `check_is_admin` and `check_is_admin_or_manager` dependencies

### Changed
- Updated CORS configuration to support Tailscale network access
- Enhanced error messages for Telnyx integration failures

### Fixed
- Removed all TODO comments for admin permission checks
- Added proper HTTP status codes for permission errors

## [0.1.0] - 2026-03-04

### Added
- Initial release
- RFC3261-compliant SIP testing
- Multi-tenant organization isolation
- Role-based access control (Admin, Manager, User)
- Encrypted SIP credential storage
- WebSocket real-time test monitoring
- Test history and result analytics
- Docker-ready deployment
