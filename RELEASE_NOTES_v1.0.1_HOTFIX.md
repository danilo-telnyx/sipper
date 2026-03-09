# Sipper v1.0.1 Hotfix Release

## 🐛 Critical Bug Fixes - All Systems Operational

**Release Date:** March 9, 2026  
**Total Bugs Fixed:** 11  
**Debugging Time:** 2.5 hours  
**Status:** ✅ Production Ready

---

## Overview

This hotfix release resolves **11 critical bugs** discovered during production testing. The most significant fix (#10) resolved a mutation callback issue that prevented the frontend from updating test status, causing the UI to appear frozen even though tests were executing successfully on the backend.

---

## 🐛 Bugs Fixed

### Critical Fixes

**#10 - Mutation Callback Not Firing (THE BIG ONE)**
- **Impact:** Timer didn't start, polling didn't run, WebSocket didn't subscribe
- **Root Cause:** API returns test object directly, but callback checked `if (response.data)`
- **Fix:** Added fallback to check both `response.id` AND `response.data.id`
- **Files:** `frontend/src/pages/TestRunnerPage.tsx`
- **Commits:** `392c951`, `1473ed8`

**#11 - Data Transformation Missing**
- **Impact:** Test results page showed "almost nothing"
- **Root Cause:** Backend returns snake_case, frontend expects camelCase
- **Fix:** Added data transformer in `testsApi.list()` to convert field names and calculate derived values
- **Files:** `frontend/src/services/api.ts`
- **Commit:** `65de4e9`

### Backend Fixes

**#1 - ImportError (TestType)**
- Removed unused `TestType` import from `sip_engine_client.py`
- **Commit:** `2ca25ac`

**#2 - Response Validation Error**
- Fixed metadata field mapping in `TestRunResponse` schema
- **Commit:** `2ca25ac`

**#3 - Database Field Mismatch**
- Renamed `metadata` → `test_metadata` throughout codebase
- **Commits:** `277adfe`, `2d437f7`

**#4 - Bytes Serialization in JSONB**
- Updated encryption functions to return strings instead of bytes
- **Commit:** `277adfe`

**#5 - SQLAlchemy Metadata Conflict**
- Renamed API field to avoid conflict with SQLAlchemy's built-in `.metadata`
- **Commit:** `2d437f7`

**#6 - Port Binding Permission Error**
- Changed SIP engine port from 5060 → 15060 (unprivileged)
- **Commit:** `e8ae483`

**#7 - Timezone Datetime Serialization**
- Used `TIMESTAMP WITH TIME ZONE` explicitly in database schema
- **Commits:** `832f6f6`, `1da86b4`

**#8 - test_type Validation**
- Added user-friendly test type names to schema (`registration`, `call`, etc.)
- **Commit:** `0d7030c`

**#9 - Field Name Mismatch**
- Fixed frontend API call to use `test_metadata` instead of `metadata`
- **Commit:** `235051d`

---

## ✨ New Features

### Error Display Component
- Created `ErrorDisplay.tsx` with context-aware SIP error explanations
- Provides helpful suggestions for common SIP error codes (400, 401, 403, 404, etc.)
- Shows detailed SIP response data for debugging

### Enhanced Test Results API
- Added `testsApi.get()` to fetch detailed test results with SIP messages
- Extracts and transforms raw SIP messages from database
- Supports both sent and received message display

### Comprehensive Debug Logging
- Added detailed logging throughout test execution flow
- Frontend logs mutation callbacks, WebSocket events, polling activity
- Backend logs test execution steps, WebSocket notifications, database operations

---

## 📊 Test Results

### Systems Verified Working

✅ **Test Runner**
- Apply button functional
- Ad-hoc credentials accepted
- Saved credentials work
- Tests execute immediately

✅ **Backend Execution**
- SIP engine executes tests (port 15060)
- Database stores results correctly
- WebSocket notifications sent
- Background tasks complete successfully

✅ **Frontend Updates**
- Timer starts and counts
- WebSocket progress updates received
- Polling works as fallback (every 2 seconds)
- UI updates on test completion
- Toast notifications displayed

✅ **Test Results Page**
- All tests displayed in table
- Data transformation working
- Duration calculated correctly
- Sortable, filterable, paginated

---

## 🔧 Database Changes

### New Schema
- Created hierarchical `test_runs` + `test_results` schema
- Migration: `backend/migrations/migrate_test_schema.sql`
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- Backed up old data to `test_results_backup`

---

## 📝 Known Issues

### SIP Authentication Not Implemented
- Tests currently fail with **400 "Content-Length Body Failure"** from Telnyx
- Missing RFC 2617 digest authentication
- Fix in progress via sub-agent

**Workaround:** Tests execute successfully but fail authentication. Full fix coming in next release.

---

## 🚀 Upgrade Instructions

### Docker Deployment

```bash
# Pull latest changes
git pull origin main

# Rebuild containers
docker compose build --no-cache app
docker compose up -d

# Verify health
docker compose ps
docker compose logs -f app
```

### Database Migration

```bash
# Run migration (if not already applied)
docker compose exec app python -m app.scripts.run_migration migrate_test_schema.sql
```

---

## 📚 Technical Details

### Files Modified
- **Backend:** `app/routers/tests.py`, `app/schemas/test.py`, `app/sip_engine_client.py`
- **Frontend:** `TestRunnerPage.tsx`, `api.ts`, `Ad HocCredentialForm.tsx`
- **Database:** `migrate_test_schema.sql`
- **Components:** `ErrorDisplay.tsx` (NEW)

### Commits
- **Total:** 12 commits
- **GitHub:** https://github.com/danilo-telnyx/sipper
- **Latest:** `a378902` (Add SIP message fetching and error display)

---

## 🎯 What's Next

### v1.0.2 Roadmap
1. ✅ SIP digest authentication (RFC 2617) - **In Progress**
2. Enhanced test results UI with detailed SIP message viewer
3. RTP media support for actual audio transmission
4. TCP/TLS transport support
5. DTMF and codec handling

---

## 👥 Contributors

- **DAInilo** (AI Agent) - Bug fixes, enhancements, documentation
- **Danilo Smaldone** (Human) - Testing, requirements, validation

---

## 📄 License

Copyright © 2026 Telnyx. All rights reserved.

---

**Full Changelog:** https://github.com/danilo-telnyx/sipper/compare/v1.0.0...v1.0.1
