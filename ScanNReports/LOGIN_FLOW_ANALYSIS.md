# Sipper Login Flow Analysis & Debug Report

**Date:** March 6, 2026  
**Status:** ⚠️ CRITICAL ISSUE IDENTIFIED  
**Issue:** Backend/Frontend API contract mismatch

---

## Executive Summary

The login flow has a **critical mismatch** between backend and frontend expectations:

- ✅ **Backend authentication works correctly** (password hashing, JWT generation)
- ✅ **Frontend UI and logic are well-implemented**
- ❌ **Backend returns only tokens, but frontend expects tokens + user object**
- ❌ **No `/auth/me` endpoint to fetch current user profile**

**Impact:** Login will fail because frontend cannot store user data in auth state.

---

## 1. Login Flow Diagram

### Current (Broken) Flow
```
User Input (email/password)
    ↓
Frontend Form Submission (LoginPage.tsx)
    ↓
API Call to POST /api/auth/login
    ↓
Backend Validation (auth.py)
    ↓
Password Verification (PBKDF2-SHA256)
    ↓
JWT Token Generation (access + refresh)
    ↓
❌ Backend Returns: { access_token, refresh_token, token_type }
    ↓
❌ Frontend Expects: { user: {...}, token: "...", refreshToken: "..." }
    ↓
❌ AuthContext.setAuth() fails - missing user object
    ↓
❌ Login appears to fail (no redirect)
```

### Expected (Fixed) Flow
```
User Input (email/password)
    ↓
Frontend Form Submission
    ↓
API Call to POST /api/auth/login
    ↓
Backend Validation
    ↓
Password Verification
    ↓
JWT Token Generation
    ↓
✅ Backend Fetches User Object
    ↓
✅ Backend Returns: { user: {...}, access_token, refresh_token }
    ↓
✅ Frontend Stores User + Tokens in AuthContext
    ↓
✅ Redirect to /dashboard
```

---

## 2. Backend Analysis

### Login Endpoint (`backend/app/routers/auth.py`)

**Location:** `backend/app/routers/auth.py:97-121`

**What it accepts:**
```python
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
```

**What it does:**
1. Finds user by email
2. Verifies password using PBKDF2-SHA256 (100,000 iterations)
3. Checks if user is active
4. Generates JWT tokens (access + refresh)
5. Returns tokens

**What it returns (CURRENT):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

**What it SHOULD return:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "User Name",
    "role": "user",
    "organization_id": "uuid",
    "is_active": true,
    "created_at": "2026-03-06T..."
  }
}
```

### Password Verification (`backend/app/auth/password.py`)

**Implementation:** ✅ Secure
- Algorithm: PBKDF2-SHA256
- Iterations: 100,000
- Salt: 32 bytes (random per password)
- Constant-time comparison (`secrets.compare_digest`)

**Status:** No issues found

### JWT Token Generation (`backend/app/auth/jwt.py`)

**Implementation:** ✅ Correct
- Library: python-jose
- Algorithm: HS256 (configurable)
- Access token: 30 minutes expiry (configurable)
- Refresh token: 7 days expiry (configurable)

**Token Payload:**
```json
{
  "sub": "user-uuid",
  "org_id": "org-uuid",
  "exp": 1772817549,
  "type": "access" | "refresh"
}
```

**Note:** Token only contains IDs, not full user object (intentional, good practice)

---

## 3. Frontend Analysis

### Login Page (`frontend/src/pages/auth/LoginPage.tsx`)

**Implementation:** ✅ Excellent
- Form validation with Zod schema
- Password visibility toggle
- Remember me functionality
- Loading states
- Error handling
- Accessibility (ARIA labels)

**Post-login redirect:** `/dashboard` (default) or previous page

### Auth Context (`frontend/src/contexts/AuthContext.tsx`)

**Features:**
- Auto-refresh token (every 15 minutes)
- Session timeout (30 minutes of inactivity)
- Activity tracking (mouse, keyboard, scroll, touch)
- Zustand store with persistence

**Issue:** `login()` function expects:
```typescript
interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}
```

But backend returns:
```typescript
{
  access_token: string
  refresh_token: string
  token_type: string
}
```

### Auth Store (`frontend/src/store/auth.ts`)

**Implementation:** ✅ Correct (Zustand + persist)
- Stores: user, token, refreshToken, isAuthenticated
- Persists to localStorage as `sipper-auth`

**Issue:** Cannot store user if backend doesn't provide it

### Axios Configuration (`frontend/src/lib/axios.ts`)

**Features:**
- Request interceptor: adds `Authorization: Bearer <token>` header
- Response interceptor: handles 401, refreshes token automatically
- Error handling and queue for pending requests during refresh

**Status:** ✅ Well-implemented

---

## 4. Routing Analysis

### Protected Routes (`frontend/src/App.tsx`)

**Post-login destination:** `/dashboard`

**All routes:**
- `/` → redirects to `/dashboard` (protected)
- `/login` → LoginPage (public)
- `/register` → RegisterPage (public)
- `/dashboard` → DashboardPage (protected)
- `/credentials` → CredentialsPage (protected)
- `/test-runner` → TestRunnerPage (protected)
- `/test-results` → TestResultsPage (protected)
- `/test-results/:id` → TestResultDetailPage (protected)
- `/users` → UsersPage (protected, admin/org-admin only)
- `/organization` → OrganizationPage (protected, org-admin only)

**Status:** ✅ All pages exist and are properly protected

---

## 5. Test Credentials

### Working Test User

```
Email: testuser@example.com
Password: TestPassword123!
Organization: Test Organization
Status: Active
Created: March 6, 2026
```

### Other Existing Users

From database:
```
test-1772814697@example.com
newtest@example.com
newuser@example.com
danilo@telnyx.com
test2@example.com
```

---

## 6. Issues Found

### CRITICAL: Backend/Frontend API Mismatch

**Problem:** Backend returns different data structure than frontend expects

**Backend returns:**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

**Frontend expects:**
```json
{
  "user": { ...user object... },
  "token": "...",
  "refreshToken": "..."
}
```

**Impact:**
- Login appears to succeed (200 OK)
- But frontend cannot extract user data
- `authStore.setAuth()` likely fails or stores incomplete data
- User is not redirected to dashboard
- User appears stuck on login page

### Missing Endpoint: `/auth/me`

**Problem:** No endpoint to fetch current user profile

**Impact:**
- Cannot fetch user data after token refresh
- Cannot validate token by fetching user profile
- Cannot sync user data if it changes

---

## 7. The Fix

### Option 1: Modify Backend Login Response (RECOMMENDED)

**File:** `backend/app/routers/auth.py`

**Change the login endpoint to return user data:**

```python
@router.post("/login", response_model=TokenResponse)
@limiter.limit(get_login_limit())
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login user."""
    # Find user
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    # Generate tokens
    token_data = {"sub": str(user.id), "org_id": str(user.organization_id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # ✅ ADD: Fetch user's role
    role_result = await db.execute(
        select(UserRole).where(UserRole.user_id == user.id)
    )
    user_role = role_result.scalar_one_or_none()
    role_name = user_role.role.name if user_role and user_role.role else "user"
    
    # ✅ CHANGE: Return TokenResponse with user data
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "role": role_name,
            "organization_id": str(user.organization_id),
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat(),
        }
    }
```

**Also update `TokenResponse` schema:**

```python
# File: backend/app/schemas/auth.py

class UserData(BaseModel):
    """User data in token response."""
    id: str
    email: str
    full_name: str
    role: str
    organization_id: str
    is_active: bool
    created_at: str

class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserData | None = None  # ✅ ADD user field
```

**Apply same fix to the `/register` endpoint.**

### Option 2: Add `/auth/me` Endpoint + Modify Frontend

**Backend - Add endpoint:**

```python
# File: backend/app/routers/auth.py

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile."""
    # Fetch role
    role_result = await db.execute(
        select(UserRole).where(UserRole.user_id == current_user.id)
    )
    user_role = role_result.scalar_one_or_none()
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": user_role.role.name if user_role and user_role.role else "user",
        "organization_id": str(current_user.organization_id),
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat(),
    }
```

**Frontend - Modify login flow:**

```typescript
// File: frontend/src/contexts/AuthContext.tsx

const login = async (credentials: LoginRequest) => {
  // 1. Login to get tokens
  const loginResponse = await authApi.login(credentials)
  
  if (loginResponse.success && loginResponse.data) {
    const { access_token, refresh_token } = loginResponse.data
    
    // 2. Store token temporarily
    authStore.setAuth({
      user: null, // Don't have user yet
      token: access_token,
      refreshToken: refresh_token,
    })
    
    // 3. Fetch user profile
    const userResponse = await authApi.me()
    
    if (userResponse.success && userResponse.data) {
      // 4. Update with full user data
      authStore.setAuth({
        user: userResponse.data,
        token: access_token,
        refreshToken: refresh_token,
      })
    } else {
      throw new Error('Failed to fetch user profile')
    }
  } else {
    throw new Error(loginResponse.error || 'Login failed')
  }
}
```

**Why Option 1 is better:**
- Single API call (faster)
- Simpler frontend code
- Matches common REST API patterns
- Registration already needs user data

---

## 8. Additional Improvements

### Add Debug Logging

#### Backend Logging

```python
# File: backend/app/routers/auth.py

import logging
logger = logging.getLogger(__name__)

@router.post("/login", response_model=TokenResponse)
async def login(...):
    logger.info(f"🔐 Login attempt for: {login_data.email}")
    
    # ... existing validation code ...
    
    if not user or not verify_password(login_data.password, user.password_hash):
        logger.warning(f"❌ Login failed for: {login_data.email} - Invalid credentials")
        raise HTTPException(...)
    
    if not user.is_active:
        logger.warning(f"❌ Login failed for: {login_data.email} - User inactive")
        raise HTTPException(...)
    
    logger.info(f"✅ Login successful for: {user.email} (ID: {user.id})")
    
    # ... token generation ...
    
    return response
```

#### Frontend Logging

```typescript
// File: frontend/src/contexts/AuthContext.tsx

const login = async (credentials: LoginRequest) => {
  console.log('🔐 Login attempt:', { email: credentials.email })
  
  try {
    const response = await authApi.login(credentials)
    console.log('✅ Login API response:', response)
    
    if (response.success && response.data) {
      console.log('✅ Setting auth state:', {
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        hasRefreshToken: !!response.data.refreshToken,
      })
      
      authStore.setAuth(response.data)
      console.log('✅ Auth state set successfully')
    } else {
      console.error('❌ Login failed:', response.error)
      throw new Error(response.error || 'Login failed')
    }
  } catch (error) {
    console.error('❌ Login error:', error)
    throw error
  }
}
```

### Add Environment Variable Documentation

Create `.env.example` files:

**Backend:**
```bash
# Database
DATABASE_URL=postgresql+asyncpg://sipper:sipper@db:5432/sipper

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Environment
ENVIRONMENT=development
```

**Frontend:**
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 9. Verification Steps

### Step 1: Apply the Fix

```bash
# 1. Modify backend/app/routers/auth.py (see section 7)
# 2. Modify backend/app/schemas/auth.py (add user field)
# 3. Update register endpoint similarly
```

### Step 2: Rebuild Backend

```bash
cd ~/Documents/projects/sipper

# Stop containers
docker-compose down

# Rebuild backend (no cache to ensure changes are applied)
docker-compose build --no-cache app

# Start services
docker-compose up -d

# Watch logs
docker-compose logs -f app
```

### Step 3: Test Login API

```bash
# Test login - should now return user object
curl -v -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPassword123!"}'

# Expected response:
# {
#   "access_token": "...",
#   "refresh_token": "...",
#   "token_type": "bearer",
#   "user": {
#     "id": "...",
#     "email": "testuser@example.com",
#     "full_name": "Test User",
#     "role": "user",
#     "organization_id": "...",
#     "is_active": true,
#     "created_at": "..."
#   }
# }
```

### Step 4: Test in Browser

```bash
# 1. Open http://localhost:8000
# 2. Open DevTools (F12) -> Console tab
# 3. Try to login with: testuser@example.com / TestPassword123!
# 4. Check console logs for:
#    - "🔐 Login attempt"
#    - "✅ Login API response"
#    - "✅ Auth state set successfully"
# 5. Should redirect to /dashboard
# 6. Check Application tab -> Local Storage -> sipper-auth
#    - Should contain user, token, refreshToken
```

### Step 5: Verify Dashboard Access

```bash
# 1. After successful login, should see dashboard
# 2. User name should appear in header/navbar
# 3. Try navigating to other protected routes
# 4. Try logging out
# 5. Try refreshing page (should stay logged in)
```

---

## 10. Database Status

### Existing Users (5 total)

```sql
SELECT email, full_name, is_active 
FROM users 
ORDER BY created_at DESC;
```

Result:
```
             email             | full_name | is_active
-------------------------------+-----------+-----------
 testuser@example.com          | Test User | t
 test-1772814697@example.com   | Test User | t
 newtest@example.com           | New Test  | t
 newuser@example.com           | New Test User | t
 danilo@telnyx.com             | danilo    | t
 test2@example.com             | Test User | t
```

### Existing Organizations (5 total)

```sql
SELECT id, name, slug 
FROM organizations 
ORDER BY created_at DESC;
```

Result:
```
                  id                  |         name          |         slug          
--------------------------------------+-----------------------+-----------------------
 ebbaed56-f849-4b2f-b8da-88316a6feced | Test Organization     | test-organization
 5f84e818-7086-4a03-8cb1-798390111de7 | Test Org 1772814697   | test-org-1772814697
 11fffd63-e34a-4ac3-bb31-a6e557f0e788 | New Test Organization | new-test-organization
 78913555-06a7-49f6-b6a1-cf1025b3392c | Test Company          | test-company
 02ab771d-bdd0-459b-afe9-8ce85f376052 | My Organization       | my-organization
```

---

## 11. Post-Login Destination

### Expected Behavior

After successful login:

1. **Auth state populated:**
   - user: full user object
   - token: JWT access token
   - refreshToken: JWT refresh token
   - isAuthenticated: true

2. **Storage:**
   - Data persisted to localStorage as `sipper-auth`

3. **Redirect:**
   - Navigate to `/dashboard` (or previous protected page if came from redirect)
   - React Router's `replace: true` prevents back button to login

4. **Dashboard page:**
   - Shows user's SIP testing dashboard
   - Displays recent tests, credentials, stats
   - User name/email in header
   - Sidebar navigation available

### What Page Appears

**URL:** `http://localhost:8000/dashboard`

**Page:** `frontend/src/pages/DashboardPage.tsx`

**Status:** ✅ Page exists and is fully implemented

**Features:**
- Dashboard stats
- Recent test results
- Quick actions (create credential, run test)
- Activity feed

---

## 12. Summary & Next Steps

### Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend Auth | ✅ Working | Password hashing, JWT generation correct |
| Frontend UI | ✅ Working | Login form, validation, UX excellent |
| API Contract | ❌ **BROKEN** | **Backend missing user object in response** |
| Token Security | ✅ Secure | PBKDF2-SHA256, JWT with proper expiry |
| Protected Routes | ✅ Working | All routes configured correctly |
| Dashboard Page | ✅ Exists | Ready to receive authenticated users |

### Priority Actions

1. **[CRITICAL]** Apply the fix from Section 7 (Option 1 recommended)
2. **[HIGH]** Add debug logging (Section 8)
3. **[MEDIUM]** Test login flow end-to-end (Section 9)
4. **[LOW]** Add `.env.example` files (Section 8)

### Expected Time to Fix

- Code changes: 15 minutes
- Testing: 10 minutes
- Documentation: 5 minutes
- **Total: ~30 minutes**

### Success Criteria

- ✅ Login API returns user object along with tokens
- ✅ Frontend successfully stores user + tokens
- ✅ User redirected to /dashboard after login
- ✅ User name/email displayed in UI
- ✅ Token refresh works without losing user data
- ✅ Browser refresh preserves login state

---

## Appendix A: File Locations

### Backend
- Auth router: `backend/app/routers/auth.py`
- Auth schemas: `backend/app/schemas/auth.py`
- Password utils: `backend/app/auth/password.py`
- JWT utils: `backend/app/auth/jwt.py`
- Auth dependencies: `backend/app/auth/dependencies.py`

### Frontend
- Login page: `frontend/src/pages/auth/LoginPage.tsx`
- Auth context: `frontend/src/contexts/AuthContext.tsx`
- Auth store: `frontend/src/store/auth.ts`
- API service: `frontend/src/services/api.ts`
- Axios config: `frontend/src/lib/axios.ts`
- App routing: `frontend/src/App.tsx`
- Types: `frontend/src/types/index.ts`

---

## Appendix B: API Endpoints

### Auth Endpoints

| Method | Endpoint | Request | Response | Status |
|--------|----------|---------|----------|--------|
| POST | `/auth/register` | RegisterRequest | TokenResponse | ✅ Working |
| POST | `/auth/login` | LoginRequest | TokenResponse | ⚠️ Missing user |
| POST | `/auth/logout` | - | { message } | ✅ Working |
| POST | `/auth/refresh` | { refreshToken } | TokenResponse | ✅ Working |
| GET | `/auth/me` | - | User | ❌ Missing |

### User Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/users` | Required | List org users |
| GET | `/users/{id}` | Required | Get user details |
| POST | `/users` | Admin | Create user |
| PUT | `/users/{id}` | Admin | Update user |
| DELETE | `/users/{id}` | Admin | Delete user |

---

**End of Report**
