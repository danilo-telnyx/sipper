# DIAGNOSTIC REPORT: Sipper Registration Fix

**Date:** 2026-03-05  
**Issue:** Registration endpoint returning 500 Internal Server Error  
**Status:** ✅ FIXED AND VERIFIED

---

## Problem Found

**Registration endpoint was failing with HTTP 500 Internal Server Error** when attempting to register a new user with an organization name that already exists in the database.

### Error Details
```
sqlalchemy.exc.IntegrityError: duplicate key value violates unique constraint "ix_organizations_name"
DETAIL: Key (name)=(Test Org) already exists.
```

---

## Root Cause

The registration endpoint in `backend/app/routers/auth.py` had the following logic flaw:

1. ✅ Checked for duplicate **organization slugs** and generated unique slugs
2. ❌ **Did NOT check for duplicate organization names**
3. ❌ Database has a unique constraint on `organizations.name` column
4. ❌ When trying to create an organization with existing name → IntegrityError → 500 error

**Key Issue:** The code assumed organization names would be unique but didn't validate this before attempting database insertion.

---

## The Fix

Applied a two-part fix to `backend/app/routers/auth.py`:

### 1. Pre-flight Organization Name Check
```python
# Check if organization with same name already exists
result = await db.execute(select(Organization).where(Organization.name == register_data.organization_name))
existing_org = result.scalar_one_or_none()

if existing_org:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Organization '{register_data.organization_name}' already exists. Please choose a different name or contact your organization admin."
    )
```

### 2. Defensive IntegrityError Handling
```python
try:
    await db.flush()  # Get org ID
    
    # Create user
    user = User(
        email=register_data.email,
        password_hash=hash_password(register_data.password),
        full_name=register_data.full_name,
        organization_id=organization.id
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
except IntegrityError as e:
    await db.rollback()
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Registration failed. This organization name or email may already be in use."
    )
```

**Result:**
- Duplicate organization names now return **400 Bad Request** with clear error message
- No more 500 Internal Server Errors
- Users get actionable feedback

---

## Verification

### ✅ Test 1: Health Check
```bash
curl -s http://localhost:8000/health
# Response: {"status":"healthy"}
```

### ✅ Test 2: Frontend Access
```bash
curl -s http://localhost:8000/ | head -10
# Response: HTML with correct asset paths

curl -o /dev/null -w "%{http_code}" http://localhost:8000/assets/index-CUg0m3q_.js
# Response: 200

curl -o /dev/null -w "%{http_code}" http://localhost:8000/assets/index-DaYsWFg0.css
# Response: 200
```

### ✅ Test 3: Registration with Duplicate Organization (Proper Error)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","full_name":"Test","organization_name":"Test Org"}'

# Response: HTTP 400 Bad Request
# Body: {"detail":"Organization 'Test Org' already exists. Please choose a different name or contact your organization admin."}
```

### ✅ Test 4: Registration with New Organization (Success)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newtest@example.com","password":"Test123!","full_name":"New Test","organization_name":"New Test Organization"}'

# Response: HTTP 201 Created
# Body: {
#   "access_token": "eyJhbGci...",
#   "refresh_token": "eyJhbGci...",
#   "token_type": "bearer"
# }
```

### ✅ Test 5: Login (Success)
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newtest@example.com","password":"Test123!"}'

# Response: HTTP 200 OK
# Body: {
#   "access_token": "eyJhbGci...",
#   "refresh_token": "eyJhbGci...",
#   "token_type": "bearer"
# }
```

---

## Container Status

```bash
docker-compose ps
```

**Output:**
```
NAME         STATUS                PORTS
sipper-app   Up 5 minutes (healthy)   0.0.0.0:8000->8000/tcp, 0.0.0.0:5060->5060/udp
sipper-db    Up 50 minutes (healthy)  0.0.0.0:5432->5432/tcp
```

**Both containers healthy and running correctly.**

---

## Prevention

### 1. Code Review Checklist
When adding database operations:
- [ ] Check for unique constraints in the database schema
- [ ] Validate uniqueness **before** attempting insertion
- [ ] Wrap database operations in try-except blocks
- [ ] Return proper HTTP status codes (400/409 for conflicts, not 500)
- [ ] Provide clear, actionable error messages

### 2. Database Schema Awareness
```python
# ✅ GOOD: Check before insert
existing = await db.execute(select(Model).where(Model.unique_field == value))
if existing.scalar_one_or_none():
    raise HTTPException(status_code=400, detail="Already exists")

# ❌ BAD: Just insert and hope
db.add(new_model)
await db.commit()  # May raise IntegrityError
```

### 3. Error Handling Best Practices
```python
try:
    await db.commit()
except IntegrityError as e:
    await db.rollback()
    # Log the actual error for debugging
    logger.error(f"Database integrity error: {e}")
    # Return user-friendly message
    raise HTTPException(status_code=400, detail="Operation failed due to constraint violation")
```

### 4. Future Improvements
Consider these enhancements:
- Allow multiple users to join existing organizations (invite system)
- Make organization creation optional for registration
- Add organization slug to registration response
- Implement organization search/discovery
- Add database indexes for commonly queried fields

---

## Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Error Type** | 500 Internal Server Error | 400 Bad Request |
| **Error Message** | "Internal Server Error" | Clear, actionable message |
| **User Experience** | Confusing, no guidance | Knows exactly what went wrong |
| **Debugging** | Required log inspection | Error message is self-explanatory |
| **Registration** | Failed with duplicate org | Works with unique org names |
| **Login** | Working | Still working |
| **Frontend** | Working | Still working |

**✅ All systems operational. Registration and login endpoints fully functional.**

---

## Commit Details

**Commit:** `8e252e6`  
**Message:** "fix: Handle duplicate organization names in registration"  
**Files Changed:** 
- `backend/app/routers/auth.py` (added validation and error handling)
- `ScanNReports/DIAGNOSTIC_REPORT.md` (this file)

---

## Quick Start Commands

### Rebuild and Start
```bash
cd ~/Documents/projects/sipper
docker-compose build app
docker-compose up -d
```

### Test Registration (should work with unique org name)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","full_name":"Your Name","organization_name":"Unique Org Name"}'
```

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### Access Frontend
Open browser: `http://localhost:8000`

---

**End of Report**
