# Credentials Schema Fix

**Date:** 2026-03-06  
**Issue:** Frontend sends SIP credential fields that backend doesn't support, causing 422 validation errors

## Problem

Frontend form was sending fields:
- `name`, `domain`, `username`, `password`, `port`, `transport`, `proxy`

Backend was only accepting:
- `name`, `sip_domain`, `username`, `password`

This caused credential creation to fail with 422 Unprocessable Entity errors.

## Root Cause

1. Backend database model (`sip_credential.py`) was missing columns: `port`, `transport`, `outbound_proxy`
2. Backend schema (`credential.py`) was missing the same fields in Pydantic models
3. Backend router (`credentials.py`) was not handling these fields when creating credentials
4. Frontend API service (`api.ts`) was sending frontend field names (`domain`, `proxy`) without transforming them to backend names (`sip_domain`, `outbound_proxy`)

## Fields Added to Backend

### Database Model (`backend/app/models/sip_credential.py`)
```python
port = Column(Integer, default=5060, nullable=False)
transport = Column(String(10), default="UDP", nullable=False)  # UDP, TCP, TLS
outbound_proxy = Column(String(255), nullable=True)
```

### Schema (`backend/app/schemas/credential.py`)
Updated `SIPCredentialBase`:
```python
class SIPCredentialBase(BaseModel):
    name: str
    sip_domain: str
    username: str
    port: int = 5060
    transport: str = "UDP"  # UDP, TCP, TLS
    outbound_proxy: str | None = None
```

Also updated `SIPCredentialUpdate` with the same optional fields.

### Router (`backend/app/routers/credentials.py`)
Updated `create_credential` to include new fields:
```python
credential = SIPCredential(
    name=credential_data.name,
    organization_id=current_user.organization_id,
    sip_domain=credential_data.sip_domain,
    username=credential_data.username,
    password_encrypted=encrypted_password,
    port=credential_data.port,
    transport=credential_data.transport,
    outbound_proxy=credential_data.outbound_proxy,
    created_by=current_user.id
)
```

## Frontend Field Mapping Fix

### API Service (`frontend/src/services/api.ts`)

Added field transformation in `credentialsApi.create()` and `credentialsApi.update()`:

**Request transformation** (frontend → backend):
```typescript
const backendPayload = {
  name: data.name,
  sip_domain: data.domain,  // domain → sip_domain
  username: data.username,
  password: data.password,
  port: data.port,
  transport: data.transport,
  outbound_proxy: data.proxy || null,  // proxy → outbound_proxy
}
```

**Response transformation** (backend → frontend):
```typescript
const transformCredential = (backendCred: any): SipCredential => ({
  id: backendCred.id,
  name: backendCred.name,
  username: backendCred.username,
  password: backendCred.password || '',
  domain: backendCred.sip_domain,  // sip_domain → domain
  proxy: backendCred.outbound_proxy || undefined,  // outbound_proxy → proxy
  port: backendCred.port,
  transport: backendCred.transport,
  organizationId: backendCred.organization_id,
  createdBy: backendCred.created_by,
  createdAt: backendCred.created_at,
  updatedAt: backendCred.updated_at,
  lastTestedAt: backendCred.last_tested_at,
  isActive: backendCred.is_active ?? true,
})
```

## Database Migration

Created migration script: `backend/migrations/add_sip_fields.sql`

For existing databases:
```sql
ALTER TABLE sip_credentials 
  ADD COLUMN IF NOT EXISTS port INTEGER DEFAULT 5060 NOT NULL,
  ADD COLUMN IF NOT EXISTS transport VARCHAR(10) DEFAULT 'UDP' NOT NULL,
  ADD COLUMN IF NOT EXISTS outbound_proxy VARCHAR(255);
```

For fresh deployments, tables are created automatically with all fields via `Base.metadata.create_all()`.

## Testing

### Test 1: Full Credential Creation
```bash
curl -X POST http://localhost:8000/api/credentials \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test SIP Credential",
    "sip_domain": "sip.telnyx.com",
    "username": "testuser123",
    "password": "testpass",
    "port": 5060,
    "transport": "UDP",
    "outbound_proxy": "proxy.telnyx.com"
  }'
```

**Result:** ✅ Success - All fields saved correctly

### Test 2: Minimal Credential (Defaults)
```bash
curl -X POST http://localhost:8000/api/credentials \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minimal Credential",
    "sip_domain": "sip.example.com",
    "username": "minimal",
    "password": "pass123"
  }'
```

**Result:** ✅ Success - Defaults applied:
- `port` = 5060
- `transport` = "UDP"
- `outbound_proxy` = null

### Database Verification
```sql
SELECT name, sip_domain, username, port, transport, outbound_proxy 
FROM sip_credentials;
```

**Result:** ✅ All fields stored correctly

## Changes Summary

| File | Change |
|------|--------|
| `backend/app/models/sip_credential.py` | Added `Integer` import, added 3 columns |
| `backend/app/schemas/credential.py` | Added 3 fields to `SIPCredentialBase` and `SIPCredentialUpdate` |
| `backend/app/routers/credentials.py` | Updated `create_credential()` to include new fields |
| `frontend/src/services/api.ts` | Added `transformCredential()` helper and field mapping in create/update/list/get |
| `backend/migrations/add_sip_fields.sql` | Created migration script for existing databases |

## Verification Checklist

- ✅ Database model has port, transport, outbound_proxy columns
- ✅ Schema accepts all frontend fields
- ✅ Router saves all fields to database
- ✅ Frontend field mapping fixed (domain→sip_domain, proxy→outbound_proxy)
- ✅ Test credential creation successful
- ✅ No 422 errors
- ✅ Containers rebuilt and running
- ✅ Default values work correctly
- ✅ Optional fields (outbound_proxy) work correctly

## Deployment Notes

1. Rebuild Docker images: `docker-compose build --no-cache app`
2. Stop containers: `docker-compose down`
3. Start containers: `docker-compose up -d`
4. Verify logs: `docker-compose logs -f app`

For production with existing data, run the migration script:
```bash
docker exec sipper-db psql -U sipper -d sipper -f /path/to/add_sip_fields.sql
```

## Status

**RESOLVED** ✅

Credential creation now works end-to-end with all SIP configuration fields.
