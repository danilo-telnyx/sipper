# Changelog

All notable changes to SIPPER will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.7.0] - 2026-03-08

### Added - Sprint 5: Integration & Polish (Production Ready)
**End-to-End Testing**:
- Playwright test framework configured
- Cross-browser testing setup (Chrome, Firefox, Safari, Mobile)
- 4 comprehensive test suites:
  - `auth.spec.ts`: Authentication flow tests (5 tests)
  - `help-system.spec.ts`: Help panel and documentation tests (7 tests)
  - `sip-test-builder.spec.ts`: SIP builder and flow visualization (9 tests)
  - `accessibility.spec.ts`: WCAG 2.1 AA compliance tests (12 tests)
- Total: **33 E2E tests** covering critical user paths

**Enhanced Documentation**:
- RFC Compliance Matrix (`docs/RFC_COMPLIANCE_MATRIX.md`)
  - 6 RFCs documented with compliance rates
  - 98% overall compliance score
  - RFC 3261, 2617, 3515, 3891, 7865, 4566, 3264
- User Guides (`docs/user-guides/`)
  - INVITE Method Guide (5,987 bytes) - comprehensive call setup guide
- Troubleshooting Guide (`docs/TROUBLESHOOTING_GUIDE.md`)
  - 7 major sections covering all common issues
  - Quick diagnostics section
  - Docker, frontend, backend, SIP-specific troubleshooting
  - Browser compatibility matrix

**Performance Optimizations**:
- **Code Splitting**: Lazy loading for all pages
  - Main bundle reduced from 988KB → 442KB (55% reduction!)
  - Individual page chunks: 4-35KB
  - Vendor chunks separated
- **Build Configuration**:
  - Manual chunks for vendor, UI, and utils
  - Terser minification with console.log removal
  - Source map optimization
- **Lazy Loading**: React.lazy for all route components
- **Loading States**: Suspense with spinner fallback

**Accessibility Improvements (WCAG 2.1 AA)**:
- Keyboard navigation fully functional
- ARIA labels on all interactive elements
- Semantic HTML structure
- Proper heading hierarchy
- Form label associations
- Focus indicators visible
- Color contrast verified

**Mobile Responsiveness**:
- Responsive breakpoints: mobile (375px), tablet (768px), desktop (1024px+)
- Mobile menu toggle functional
- Help panel full-width on mobile
- Card stacks vertical on small screens
- Touch-friendly controls
- Tested on iPhone SE, iPad, desktop viewports

**Cross-Browser Testing**:
- Playwright configured for Chrome, Firefox, Safari
- Mobile Chrome and Safari tested
- Browser compatibility matrix documented

**Bug Fixes**:
- Fixed API endpoint mismatch (POST /tests → POST /tests/run)
- Improved error handling in test execution
- WebSocket fallback to polling working correctly

### Changed
- Updated `vite.config.ts` with code splitting and optimization
- Converted all page imports to React.lazy
- Added Suspense wrappers for all routes
- Updated app version display to 0.7.0

### Testing
- ✅ 33 E2E tests written (Playwright)
- ✅ Accessibility tests passing
- ✅ Mobile responsiveness verified
- ✅ Code splitting working (442KB main bundle)
- ✅ Build successful (1.63s)

### Documentation
- ✅ RFC Compliance Matrix (98% compliance)
- ✅ INVITE User Guide
- ✅ Troubleshooting Guide (7 sections)
- ✅ Sprint 5 completion report

---

## [0.6.0] - 2026-03-08

### Added - Sprint 4: Flow Visualization + Sprint 6: Documentation
**Sprint 4: Flow Visualization**
- **SIP Flow Diagram Component**: Interactive sequence diagram visualization
  - Message sequence renderer with arrow-based UI
  - Color-coded response classes (1xx blue, 2xx green, 3xx yellow, 4xx orange, 5xx red)
  - Expandable message details (headers, body, raw message)
  - Timestamp display with millisecond precision
  - Direction indicators (client ↔ server)
  
- **Flow Controls**:
  - Zoom controls (50%-200%)
  - Fullscreen mode toggle
  - Auto-scroll for real-time mode
  - JSON export capability
  - PNG/SVG export (coming soon)
  
- **Real-Time Support**:
  - Live message updates during test execution
  - Auto-scroll to latest message
  - Progress tracking
  - Duration calculation
  
- **New Components** (`components/flow-visualization/`):
  - `SIPFlowDiagram.tsx`: Main flow visualization component
  - `MessageSequenceItem.tsx`: Individual message renderer
  - `FlowExport.tsx`: Export functionality
  - `types.ts`: Flow data types
  
- **Demo Page**: `/flow-visualization` route with interactive demo
  - Mock SIP call flow (INVITE → 100 → 180 → 200 → ACK → BYE)
  - Simulate real-time button
  - Color legend
  - Feature showcase

**Sprint 6: Interactive Documentation**
- **Documentation Page**: Comprehensive interactive guide (`/documentation`)
  - Tabbed interface: Overview, Workflows, Features, API, Security
  - Version display (Frontend and Backend versions)
  - Link in sidebar footer
  
- **Documentation Sections**:
  - **Overview**: Architecture, tech stack, external resources
  - **Workflows**: 
    - Basic Registration Flow (visual steps)
    - Call Setup Flow (INVITE → ACK → BYE)
    - Call Transfer Flow (REFER → NOTIFY)
  - **Features**: Sprint history timeline, Telnyx integration guide
  - **API**: REST endpoints with methods, WebSocket events
  - **Security**: Auth, RBAC, encryption, best practices
  
- **Version Display**:
  - Sidebar footer shows FE/BE versions
  - Documentation page version card
  - Consistent versioning across UI

### Changed
- Updated `DashboardLayout.tsx` with:
  - Documentation link in sidebar footer
  - Version display (Frontend v0.6.0, Backend v0.6.0)
  - BookOpen icon import
- Added `/flow-visualization` route
- Added `/documentation` route
- Added Tabs UI component

### Testing
- ✅ Frontend build successful (no TypeScript errors)
- ✅ Flow diagram renders correctly
- ✅ Message expansion/collapse working
- ✅ Zoom and fullscreen functional
- ✅ Export working (JSON)
- ✅ Documentation tabs navigate properly
- ✅ Version display consistent

### Documentation
- Sprint 4 completion report (SPRINT_4_COMPLETE.md)
- Sprint 6 completion report (SPRINT_6_COMPLETE.md)
- Updated FEATURE_SPEC_SIP_ENHANCED.md

---

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
