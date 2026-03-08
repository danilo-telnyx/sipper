# SIP Engine Integration Fix

**Issue:** Frontend "Waiting for test to start..." — tests never complete

**Root Cause:** Backend test execution was completely mocked. The Node.js SIP engine existed but was never called from the Python backend.

## Problem Details

### Before (Broken)
```python
# backend/app/routers/tests.py
async def execute_sip_test(test_run_id: UUID):
    # Simulate test execution
    # TODO: Implement actual SIP testing logic
    steps = [
        {"step": "connect", "status": "success", "message": "Connected..."},
        {"step": "register", "status": "success", "message": "Registration..."},
    ]
```

The backend just returned fake success results immediately. No actual SIP protocol testing occurred.

### Architecture Gap

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend   │────→│   Backend    │  ❌  │ SIP Engine │
│  (React)    │     │  (FastAPI)   │     │  (Node.js) │
└─────────────┘     └──────────────┘     └────────────┘
                            │
                            ↓
                    (Mocked results only)
```

The SIP engine existed in `backend/sip-engine/` with full RFC3261 implementation, but Python backend couldn't call it.

## Solution

### Architecture (Fixed)

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Frontend   │────→│   Backend    │────→│ SIP Engine │
│  (React)    │     │  (FastAPI)   │ HTTP │  (Node.js) │
└─────────────┘     └──────────────┘     └────────────┘
                                               │
                                               ↓
                                      (Real SIP protocol tests)
```

### Components Added

#### 1. SIP Engine HTTP API Server
**File:** `backend/sip-engine/src/api-server.js`

Express server that wraps the SIP test engine:
- `GET /health` — Health check
- `POST /test/run` — Execute SIP test

Supports test types:
- `options` — OPTIONS ping
- `register` — REGISTER flow
- `call` — Full call flow (INVITE → ACK → BYE)
- `auth` — Authentication challenge
- `error` — Error handling

**Runs on:** `http://127.0.0.1:5001`

#### 2. Python SIP Engine Client
**File:** `backend/app/sip_engine_client.py`

Python async client using `httpx`:
- Health check to verify engine is running
- Calls `/test/run` endpoint
- Returns structured test results

#### 3. Updated Test Execution
**File:** `backend/app/routers/tests.py`

Replaced mock implementation with real SIP engine calls:
- Fetches SIP credentials from database
- Calls SIP engine via HTTP client
- Stores detailed results (messages, errors, violations)
- Records RFC compliance violations

#### 4. Startup Script
**File:** `backend/start-all.sh`

Orchestrates both services:
1. Starts Node.js SIP Engine on port 5001
2. Waits for health check
3. Starts Python FastAPI backend on port 8000
4. Handles graceful shutdown (Ctrl+C)

### Dependencies Added

**Node.js:**
```json
{
  "express": "^4.18.2"
}
```

**Python:**
```python
httpx==0.26.0  # Already in requirements.txt
```

## Usage

### Start Services

**Recommended (single command):**
```bash
cd backend
./start-all.sh
```

**Or separately:**
```bash
# Terminal 1: SIP Engine
cd backend/sip-engine
npm start

# Terminal 2: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Test Types Supported

| Frontend Test Type | SIP Engine Test | SIP Methods |
|-------------------|-----------------|-------------|
| `registration` | `register` | REGISTER, 401/407 challenge, authenticated REGISTER |
| `call` | `call` | INVITE, 180/183 provisional, 200 OK, ACK, BYE |
| `message` | `options` | OPTIONS (used as message placeholder) |

### What Gets Tested

Real SIP protocol tests now include:
- ✅ RFC3261 compliance validation
- ✅ SIP message parsing and validation
- ✅ Digest authentication (RFC2617)
- ✅ Call flows (INVITE/ACK/BYE)
- ✅ Registration flows
- ✅ Error response handling
- ✅ Response time metrics
- ✅ Header validation

### Test Results

Frontend now receives:
```json
{
  "success": true,
  "testName": "REGISTER",
  "duration": 1234,
  "messages": [
    {
      "direction": "out",
      "method": "REGISTER",
      "message": "REGISTER sip:domain SIP/2.0..."
    },
    {
      "direction": "in",
      "statusCode": 401,
      "message": { ... parsed response ... }
    }
  ],
  "errors": [],
  "violations": [],
  "metrics": {
    "responseTime": 123,
    "authRequired": true,
    "realm": "sip.telnyx.com"
  }
}
```

## Verification

### 1. Check SIP Engine is running:
```bash
curl http://127.0.0.1:5001/health
# Should return: {"status":"ok","service":"sipper-sip-engine","version":"1.0.0"}
```

### 2. Test via API:
```bash
curl -X POST http://127.0.0.1:5001/test/run \
  -H "Content-Type: application/json" \
  -d '{
    "testType": "options",
    "credentials": {
      "username": "test",
      "host": "sip.example.com"
    }
  }'
```

### 3. Check backend integration:
```bash
# Start backend (it will check SIP engine on startup)
cd backend
./start-all.sh

# Look for: "✅ SIP Engine is ready!"
```

## Next Steps

1. ✅ **Done:** Basic integration working
2. 🔄 **Next:** Test with real Telnyx credentials
3. 📝 **Future:** WebSocket streaming for real-time test updates
4. 📝 **Future:** PCAP capture support
5. 📝 **Future:** Advanced SIP scenarios (REFER, UPDATE, etc.)

## Troubleshooting

### "Waiting for test to start..." persists

**Check:**
1. Is SIP Engine running? `curl http://127.0.0.1:5001/health`
2. Check backend logs for connection errors
3. Verify port 5001 is not blocked

### "SIP Engine is not running" error

**Fix:**
```bash
cd backend/sip-engine
npm start
```

Or use `start-all.sh` which handles this automatically.

### Tests fail with connection errors

**Possible causes:**
- Invalid SIP credentials
- Firewall blocking UDP port 5060
- SIP server unreachable
- Network connectivity issues

Check test results in frontend for detailed error messages.

---

**Status:** ✅ **FIXED** — Real SIP protocol testing now integrated
**Date:** 2026-03-08
**Impact:** Frontend → Backend → SIP Engine flow complete
