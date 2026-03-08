# Changelog

All notable changes to SIPPER will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
