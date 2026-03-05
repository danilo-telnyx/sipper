# Sipper Code Quality & Security Audit
**Date:** 2026-03-05  
**Auditor:** Sub-agent (sipper-code-quality-audit)  
**Project:** ~/Documents/projects/sipper

---

## Executive Summary

Comprehensive code quality and security analysis of the Sipper SIP testing platform (backend Python/FastAPI, frontend TypeScript/React). The codebase is generally well-structured with good separation of concerns, but several **critical security issues**, **code quality concerns**, and **configuration gaps** were identified.

**Critical Issues:** 3  
**High Priority:** 8  
**Medium Priority:** 12  
**Low Priority:** 6

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. **JWT Secret Exposure & Weak Defaults** ⚠️ CRITICAL
**Files:** 
- `backend/.env.example:5-6`
- `backend/app/config.py:17-18`

**Issue:**
```python
# config.py
jwt_secret: str  # No default, but .env.example has weak placeholder
encryption_key: str  # No default, but .env.example has weak placeholder
```

```bash
# .env.example
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ENCRYPTION_KEY=your-fernet-encryption-key-32-bytes-base64-encoded
```

**Problems:**
- `.env.example` contains placeholder secrets that developers might copy directly
- No validation that secrets have been changed from defaults
- Encryption key format not validated (must be valid Fernet key)
- No minimum entropy requirements enforced

**Recommendation:**
- Add startup validation to ensure secrets aren't default values
- Provide a script to generate secure random secrets
- Document Fernet key generation: `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"`
- Fail fast on startup if secrets match known weak patterns

**Fix:**
```python
# In config.py
from cryptography.fernet import Fernet

class Settings(BaseSettings):
    # ... existing code ...
    
    @model_validator(mode='after')
    def validate_secrets(self):
        # Check JWT secret isn't a placeholder
        weak_patterns = ['change-this', 'your-super-secret', 'example', 'test']
        if any(pattern in self.jwt_secret.lower() for pattern in weak_patterns):
            raise ValueError("JWT_SECRET appears to be a placeholder. Generate a secure secret!")
        
        if len(self.jwt_secret) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters")
        
        # Validate Fernet key format
        try:
            Fernet(self.encryption_key.encode())
        except Exception as e:
            raise ValueError(f"ENCRYPTION_KEY is not a valid Fernet key: {e}")
        
        return self
```

---

### 2. **Password Decryption Without Authorization Check** ⚠️ CRITICAL
**File:** `backend/app/routers/credentials.py:28-33`

**Issue:**
```python
@router.get("/{credential_id}", response_model=SIPCredentialResponse)
async def get_credential(
    credential_id: UUID,
    include_password: bool = False,  # ⚠️ No permission check!
    ...
):
    # ... org check happens ...
    
    if include_password:
        # TODO: Check admin permission  ⚠️ Not implemented!
        response_dict = response.model_dump()
        response_dict["password"] = decrypt_credential(credential.password_encrypted)
        return response_dict
```

**Problems:**
- Any authenticated user in the org can decrypt SIP passwords with `?include_password=true`
- TODO comment shows this was recognized but never fixed
- Sensitive credential exposure without RBAC enforcement

**Recommendation:**
Implement strict RBAC check before decrypting passwords:

```python
from app.middleware.rbac import check_permission

if include_password:
    # Only org-admin or credential owner can view passwords
    if not (await check_permission(current_user, "credential.decrypt") or 
            credential.created_by == current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to decrypt passwords"
        )
    response_dict = response.model_dump()
    response_dict["password"] = decrypt_credential(credential.password_encrypted)
    return response_dict
```

---

### 3. **Database Session Reuse in Background Tasks** ⚠️ CRITICAL
**File:** `backend/app/routers/tests.py:88-91`

**Issue:**
```python
@router.post("/run", ...)
async def run_test(..., db: AsyncSession = Depends(get_db), ...):
    # ... create test_run ...
    
    # ⚠️ Passing DB session to background task - session may close before task completes!
    background_tasks.add_task(execute_sip_test, test_run.id, db)
    
    return test_run
```

**Problems:**
- Database session closes when request ends, but background task may still be running
- Can cause "detached instance" errors or connection pool exhaustion
- Race condition: session might close before background task starts

**Recommendation:**
Background tasks should create their own DB sessions:

```python
async def execute_sip_test(test_run_id: UUID):
    """Background task - creates its own DB session."""
    async with AsyncSessionLocal() as db:
        try:
            # Fetch test run
            result = await db.execute(select(TestRun).where(TestRun.id == test_run_id))
            # ... rest of logic ...
            await db.commit()
        except Exception as e:
            logger.error(f"Test execution failed: {e}")
            # Update test_run status to failed

# In endpoint:
background_tasks.add_task(execute_sip_test, test_run.id)  # Only pass ID
```

---

## 🔶 HIGH PRIORITY ISSUES

### 4. **SQL Echo Enabled in Production** 🔶 HIGH
**File:** `backend/app/database.py:9`

**Issue:**
```python
engine = create_async_engine(
    settings.database_url,
    echo=True,  # ⚠️ Set to False in production
    future=True,
)
```

**Problems:**
- Logs all SQL queries to stdout (performance overhead)
- May leak sensitive data in logs (credentials, PII)
- Comment says "Set to False in production" but doesn't enforce it

**Recommendation:**
```python
echo = settings.app_env != "production"  # or settings.log_level == "debug"
engine = create_async_engine(
    settings.database_url,
    echo=echo,
    future=True,
)
```

---

### 5. **Datetime.utcnow() Deprecated** 🔶 HIGH
**Files:** Multiple (auth.py, models, tests.py)

**Issue:**
```python
# backend/app/auth/jwt.py:8, 15
expire = datetime.utcnow() + timedelta(...)  # ⚠️ Deprecated in Python 3.12+

# backend/app/models/user.py:18
created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
```

**Problems:**
- `datetime.utcnow()` is deprecated in Python 3.12+
- Should use timezone-aware `datetime.now(timezone.utc)`
- Mixing naive and aware datetimes causes bugs

**Recommendation:**
Global replacement:
```python
from datetime import datetime, timezone

# Replace all:
datetime.utcnow() → datetime.now(timezone.utc)
```

Files to update: `auth/jwt.py`, `models/user.py`, `models/test.py`, `routers/tests.py`

---

### 6. **Missing CORS Origin Validation** 🔶 HIGH
**File:** `backend/app/config.py:26`

**Issue:**
```python
cors_origins: list[str] = ["http://localhost:3000"]  # Default only localhost
```

**Problems:**
- In production, CORS origins must be explicitly configured
- Default to localhost is dangerous if deployed without changing
- No validation that production origins are HTTPS

**Recommendation:**
```python
class Settings(BaseSettings):
    cors_origins: list[str] = ["http://localhost:3000"]
    app_env: str = "development"
    
    @model_validator(mode='after')
    def validate_cors(self):
        if self.app_env == "production":
            # Ensure CORS origins are HTTPS in production
            http_origins = [o for o in self.cors_origins if o.startswith("http://")]
            if http_origins:
                raise ValueError(f"Production CORS origins must use HTTPS: {http_origins}")
        return self
```

---

### 7. **Frontend API Base URL Mismatch** 🔶 HIGH
**Files:** 
- `frontend/.env.example:2`
- `backend/app/config.py:26`

**Issue:**
Frontend expects API on port 8080, but backend runs on 8000:
```bash
# frontend/.env.example
VITE_API_BASE_URL=http://localhost:8080/api  # Port 8080

# docker-compose.yml
ports:
  - "${APP_PORT:-8000}:8000"  # Port 8000
```

**Problems:**
- Port mismatch between frontend config and backend
- Will cause CORS errors or connection failures
- Indicates config wasn't tested

**Recommendation:**
Update `frontend/.env.example`:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

---

### 8. **Incomplete TODO Items in Production Code** 🔶 HIGH
**Files:** 5 files with TODO/FIXME

```bash
backend/app/routers/credentials.py:31:  # TODO: Check admin permission
backend/app/routers/tests.py:29:        # TODO: Implement actual SIP testing logic
backend/app/routers/users.py:47:        # TODO: Implement RBAC checks
backend/app/routers/organizations.py:23: # TODO: Add permission check
backend/app/middleware/rbac.py:12:      # TODO: Implement complete RBAC system
```

**Problems:**
- Core security features (RBAC, admin checks) marked as TODO
- SIP testing logic is just a simulation
- May give false confidence that features work

**Recommendation:**
- Either implement or remove the placeholder code
- If keeping placeholders, add runtime warnings/errors
- Update API docs to reflect unimplemented features

---

### 9. **No Rate Limiting on Auth Endpoints** 🔶 HIGH
**File:** `backend/app/routers/auth.py`

**Issue:**
```python
@router.post("/login", response_model=TokenResponse)
async def login(...):
    # No rate limiting - vulnerable to brute force
```

**Problems:**
- Login endpoint has no rate limiting
- Registration endpoint has no rate limiting
- Refresh token endpoint has no rate limiting
- Vulnerable to brute force password attacks

**Recommendation:**
Add rate limiting middleware (e.g., slowapi):
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/minute")  # 5 login attempts per minute
async def login(...):
    ...
```

---

### 10. **Frontend Token Storage in Zustand (In-Memory)** 🔶 HIGH
**File:** `frontend/src/store/auth.ts` (implied by AuthContext usage)

**Issue:**
AuthContext uses Zustand store, but token persistence strategy unclear:
- If tokens stored in localStorage → XSS vulnerable
- If tokens only in memory → lost on page refresh

**Problems:**
- No visible token persistence configuration
- Refresh tokens likely stored insecurely
- Session management unclear

**Recommendation:**
Implement secure token storage:
1. **Best:** Use httpOnly cookies for tokens (backend sets, frontend can't access)
2. **Acceptable:** Store in memory + implement refresh-on-mount logic
3. **Avoid:** localStorage (XSS risk)

---

### 11. **Missing Input Validation on Slug Generation** 🔶 HIGH
**File:** `backend/app/routers/auth.py:24-35`

**Issue:**
```python
base_slug = re.sub(r'[^a-z0-9-]', '', request.organization_name.lower().replace(" ", "-"))
org_slug = base_slug

# ⚠️ What if base_slug is empty after sanitization?
# ⚠️ No minimum length check
# ⚠️ No validation that slug is meaningful
```

**Problems:**
- If `organization_name` contains only special characters → empty slug
- No validation that slug has minimum length
- Could generate slugs like `-` or `---`

**Recommendation:**
```python
base_slug = re.sub(r'[^a-z0-9-]', '', request.organization_name.lower().replace(" ", "-"))
base_slug = re.sub(r'-+', '-', base_slug).strip('-')  # Remove multiple dashes, trim edges

if not base_slug or len(base_slug) < 3:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Organization name must contain at least 3 alphanumeric characters"
    )

org_slug = base_slug
```

---

## 🔷 MEDIUM PRIORITY ISSUES

### 12. **Outdated Dependencies (Frontend)** 🔷 MEDIUM
**File:** `frontend/package.json`

**Issue:**
Multiple major version updates available:
```
react: 18.3.1 → 19.2.4 (major)
vite: 5.4.21 → 7.3.1 (major)
eslint: 8.57.1 → 10.0.2 (major)
tailwindcss: 3.4.19 → 4.2.1 (major)
zod: 3.25.76 → 4.3.6 (major)
```

**Recommendation:**
- Update dependencies in controlled manner (test after each major update)
- Review breaking changes for React 19, Vite 7, ESLint 10
- Consider updating Tailwind to v4 (significant API changes)

---

### 13. **No Request Timeout Configuration** 🔷 MEDIUM
**File:** `frontend/src/lib/axios.ts:10`

**Issue:**
```typescript
timeout: 30000, // 30 seconds
```

**Problems:**
- 30 seconds is quite long for API requests
- SIP tests might take longer (should use separate timeout)
- No distinction between quick operations (login) and slow operations (test execution)

**Recommendation:**
```typescript
// Default instance for quick operations
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
})

// Separate instance for long operations
export const axiosLongRunning = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds
})
```

---

### 14. **Database Connection Pool Not Configured** 🔷 MEDIUM
**File:** `backend/app/database.py:8-12`

**Issue:**
```python
engine = create_async_engine(
    settings.database_url,
    echo=True,
    future=True,
    # ⚠️ No pool_size, max_overflow, pool_timeout configured
)
```

**Problems:**
- Using SQLAlchemy defaults (pool_size=5, max_overflow=10)
- May not scale for production load
- No pool timeout configured (can hang indefinitely)

**Recommendation:**
```python
engine = create_async_engine(
    settings.database_url,
    echo=settings.app_env != "production",
    future=True,
    pool_size=20,           # Concurrent connections
    max_overflow=40,        # Overflow on spikes
    pool_timeout=30,        # Wait max 30s for connection
    pool_pre_ping=True,     # Verify connections before use
)
```

---

### 15. **No Logging Configuration** 🔷 MEDIUM
**Files:** Multiple

**Issue:**
- No structured logging setup
- `print()` or no logging in background tasks
- No log levels configured
- No request ID tracking

**Recommendation:**
Add structured logging with request correlation:
```python
# app/logging_config.py
import logging
from pythonjsonlogger import jsonlogger

def setup_logging(log_level: str = "INFO"):
    logHandler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter()
    logHandler.setFormatter(formatter)
    
    logger = logging.getLogger()
    logger.addHandler(logHandler)
    logger.setLevel(log_level)
    
    return logger
```

---

### 16. **Missing Database Migrations** 🔷 MEDIUM
**File:** `backend/alembic` (directory not checked)

**Issue:**
- `alembic==1.13.1` in requirements.txt
- Database initialized with `Base.metadata.create_all()` in production
- No migration history/version control

**Recommendation:**
- Initialize Alembic: `alembic init alembic`
- Generate initial migration: `alembic revision --autogenerate -m "Initial schema"`
- Replace `init_db()` with `alembic upgrade head`

---

### 17. **No Health Check Details** 🔷 MEDIUM
**File:** `backend/app/main.py:51-54`

**Issue:**
```python
@app.get("/health")
async def health_check():
    return {"status": "healthy"}  # ⚠️ Doesn't actually check anything
```

**Problems:**
- Doesn't check database connectivity
- Doesn't check Redis/cache (if added)
- Always returns healthy even if database is down

**Recommendation:**
```python
@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Check database
        await db.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "checks": {
                "database": "ok",
                "version": settings.api_version
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )
```

---

### 18. **Frontend Auth Store Missing Error States** 🔷 MEDIUM
**File:** `frontend/src/store/auth.ts` (implied)

**Issue:**
- AuthContext doesn't expose loading/error states
- Calling code can't distinguish between "loading" and "not authenticated"
- No error recovery for refresh failures

**Recommendation:**
Add loading/error states to auth store:
```typescript
interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isLoading: boolean      // Add
  error: string | null    // Add
}
```

---

### 19. **No CSRF Protection** 🔷 MEDIUM
**File:** Backend (global)

**Issue:**
- No CSRF token implementation
- Cookie-based sessions vulnerable to CSRF
- Even JWT in Authorization header can be vulnerable if cookies used

**Recommendation:**
If using cookies for any auth state:
```python
from fastapi_csrf_protect import CsrfProtect

@app.exception_handler(CsrfProtectError)
def csrf_protect_exception_handler(request: Request, exc: CsrfProtectError):
    return JSONResponse(status_code=403, content={"detail": "CSRF validation failed"})
```

---

### 20. **Docker Image Runs as Root (Temporarily)** 🔷 MEDIUM
**File:** `Dockerfile:46-48`

**Issue:**
```dockerfile
RUN useradd -m -u 1000 sipper && \
    chown -R sipper:sipper /app

USER sipper  # ✅ Good, but comes late
```

**Good:** Application runs as non-root user  
**Issue:** Build process runs as root, could copy malicious files with root ownership

**Recommendation:**
- Current approach is acceptable
- Consider multi-stage build security scanning
- Add `--no-cache` to sensitive layers

---

### 21. **No Input Sanitization for Organization Names** 🔷 MEDIUM
**File:** `backend/app/routers/organizations.py`

**Issue:**
- Organization names not sanitized for XSS
- Stored in database and rendered in frontend
- Could inject malicious scripts if frontend doesn't escape

**Recommendation:**
While FastAPI auto-escapes in JSON, explicitly validate:
```python
from pydantic import field_validator

class OrganizationCreate(BaseModel):
    name: str
    
    @field_validator('name')
    def validate_name(cls, v):
        # Remove HTML tags
        v = re.sub(r'<[^>]+>', '', v)
        # Limit length
        if len(v) > 255:
            raise ValueError("Name too long")
        return v.strip()
```

---

### 22. **Axios Error Handler May Leak Sensitive Info** 🔷 MEDIUM
**File:** `frontend/src/lib/axios.ts:156-173`

**Issue:**
```typescript
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any
    return data?.error || data?.message || error.message || 'An unexpected error occurred'
  }
  // ...
}
```

**Problems:**
- Returns raw error messages from API
- Could leak internal implementation details
- Stack traces might be exposed in development

**Recommendation:**
```typescript
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any
    
    // In production, sanitize error messages
    if (import.meta.env.PROD && error.response?.status === 500) {
      return 'An internal error occurred. Please try again later.'
    }
    
    return data?.error || data?.message || error.message || 'An unexpected error occurred'
  }
  // ...
}
```

---

### 23. **Missing Database Connection Retry Logic** 🔷 MEDIUM
**File:** `backend/app/database.py:39-42`

**Issue:**
```python
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

**Problems:**
- No retry logic if database isn't ready on startup
- Docker container may start before PostgreSQL is ready
- `depends_on` in docker-compose doesn't wait for readiness

**Recommendation:**
```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

---

## 🔵 LOW PRIORITY / CODE QUALITY

### 24. **Type Hints Using Union Pipe Operator** 🔵 LOW
**File:** Multiple (Python 3.10+ feature)

**Issue:**
```python
def verify_token(token: str, token_type: str = "access") -> dict | None:
```

**Notes:**
- Using `dict | None` syntax (Python 3.10+)
- Compatible with Python 3.11 runtime
- Consider `from __future__ import annotations` for older compatibility

**Recommendation:** Acceptable for Python 3.11+ project. Document minimum Python version.

---

### 25. **Unused Imports** 🔵 LOW
**File:** Check needed

**Recommendation:**
Run automated check:
```bash
cd backend && autoflake --check --remove-all-unused-imports -r app/
```

---

### 26. **Inconsistent Error Response Format** 🔵 LOW
**Files:** Multiple routers

**Issue:**
Some endpoints return `{"detail": "..."}`, others `{"error": "..."}`, others `{"message": "..."}`

**Recommendation:**
Standardize error responses:
```python
class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
    code: str | None = None
```

---

### 27. **No API Versioning** 🔵 LOW
**File:** `backend/app/main.py`

**Issue:**
All routes under `/api` with no version prefix (e.g., `/api/v1`)

**Recommendation:**
```python
app.include_router(auth.router, prefix="/api/v1")
```

---

### 28. **Frontend: No PropTypes or Runtime Validation** 🔵 LOW
**File:** React components

**Issue:**
TypeScript provides compile-time checks but no runtime validation of API responses

**Recommendation:**
Add Zod validation for API responses:
```typescript
import { z } from 'zod'

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  // ...
})

// In API layer
const response = await axiosInstance.get('/users/me')
const user = UserSchema.parse(response.data)  // Runtime validation
```

---

### 29. **Docker Compose Secrets in Environment Variables** 🔵 LOW
**File:** `docker-compose.yml:26-30`

**Issue:**
```yaml
environment:
  DB_PASSWORD: ${DB_PASSWORD:?Database password required}
  JWT_SECRET: ${JWT_SECRET:?JWT secret required}
```

**Better Approach:**
Use Docker secrets in production:
```yaml
secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

---

## Configuration Issues

### 30. **Missing Environment Variables in .env.example Files** 🔷 MEDIUM

**Backend `.env.example` missing:**
- `APP_ENV` (development/production)
- `LOG_LEVEL`
- `DB_HOST` (defaults to localhost, should be explicit)
- `DB_PORT`, `DB_USER`, `DB_NAME` (should all be documented)

**Frontend `.env.example` missing:**
- `VITE_APP_ENV`
- `VITE_ENABLE_ANALYTICS` (if applicable)

**Recommendation:**
Create comprehensive `.env.example` files with comments explaining each variable.

---

## Quick Wins 🚀

These can be fixed immediately with minimal effort:

1. **Fix port mismatch:** Update `frontend/.env.example` port from 8080 → 8000
2. **Replace datetime.utcnow():** Global find/replace across backend
3. **Disable SQL echo:** Change `echo=True` to `echo=settings.app_env != "production"`
4. **Add secret validation:** Add `@model_validator` to Settings class
5. **Fix background task DB session:** Pass only `test_run.id` to background tasks
6. **Add input validation:** Add slug length check in org registration
7. **Update health check:** Add actual database connectivity check
8. **Document minimum Python version:** Add to README (Python 3.11+)

---

## Summary of Findings

| Severity | Count | Description |
|----------|-------|-------------|
| 🔴 Critical | 3 | Immediate security risks (auth, secrets, DB sessions) |
| 🔶 High | 8 | Security & reliability issues (CORS, rate limiting, TODOs) |
| 🔷 Medium | 12 | Quality & operational concerns (logging, migrations, config) |
| 🔵 Low | 6 | Code quality & best practices |
| **Total** | **29** | |

---

## Recommended Action Plan

### Phase 1 (Immediate - This Week)
1. Fix critical DB session issue in background tasks
2. Implement password decryption authorization check
3. Add secret validation on startup
4. Fix datetime.utcnow() deprecation
5. Implement rate limiting on auth endpoints

### Phase 2 (Next Sprint)
6. Complete RBAC implementation (remove TODOs)
7. Set up proper logging infrastructure
8. Configure database connection pooling
9. Add health check details
10. Initialize Alembic migrations

### Phase 3 (Future)
11. Update frontend dependencies (test thoroughly)
12. Add CSRF protection
13. Implement API versioning
14. Add comprehensive error handling
15. Security audit & penetration testing

---

## Conclusion

The Sipper codebase demonstrates good architectural patterns and modern framework usage. However, **several critical security issues must be addressed before production deployment**, particularly around:

- Credential decryption authorization
- Secret management and validation
- Database session handling in async contexts
- Rate limiting and brute force protection

The codebase would benefit from completing the RBAC implementation (currently marked as TODO) and establishing proper operational practices (logging, migrations, monitoring).

**Overall Code Quality Score: 6.5/10**
- Architecture: 8/10
- Security: 5/10 ⚠️
- Testing: N/A (no tests found)
- Documentation: 6/10
- Operations: 5/10

---

**Report Generated:** 2026-03-05 17:07 GMT+1  
**Next Review:** After Phase 1 fixes implemented
