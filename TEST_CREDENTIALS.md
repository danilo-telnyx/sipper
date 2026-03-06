# Sipper Test Credentials

## Primary Test Account

```
Email:        testuser@example.com
Password:     TestPassword123!
Organization: Test Organization
Role:         user
Status:       Active ✅
Created:      March 6, 2026
```

---

## Quick Login Test

### Using cURL (Backend Only)

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@example.com","password":"TestPassword123!"}'
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Using Browser (Full Stack)

1. Open: `http://localhost:8000`
2. Click "Login" or navigate to `/login`
3. Enter:
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
4. Click "Login"
5. **Expected:** Redirect to `/dashboard`

---

## Other Available Test Accounts

From database:

| Email | Organization | Notes |
|-------|-------------|-------|
| `danilo@telnyx.com` | My Organization | May have different password |
| `test2@example.com` | Test Org | Unknown password |
| `newtest@example.com` | New Test Organization | Unknown password |
| `newuser@example.com` | Test Company | Unknown password |

**Note:** Passwords for these accounts were not captured during analysis.

---

## Expected Behavior After Login

### ✅ Successful Login Should:

1. **Show loading state** ("Logging in..." button text)
2. **Display toast notification:** "Welcome back! You have been logged in successfully."
3. **Store auth data** in localStorage as `sipper-auth`:
   ```json
   {
     "state": {
       "user": { "id": "...", "email": "...", ... },
       "token": "eyJhbGc...",
       "refreshToken": "eyJhbGc...",
       "isAuthenticated": true
     },
     "version": 0
   }
   ```
4. **Redirect to dashboard** at `/dashboard`
5. **Show user info** in header/navbar
6. **Enable protected routes** (credentials, test-runner, etc.)

### ❌ Failed Login Should:

1. **Show error toast:** "Login failed - Incorrect email or password"
2. **Keep user on login page**
3. **Not store any auth data**
4. **Backend logs:** Warning about failed attempt

---

## Troubleshooting

### Login Button Does Nothing

**Possible Causes:**
1. Backend not running
   ```bash
   docker-compose ps
   # sipper-app should be "Up" and "healthy"
   ```

2. API endpoint wrong
   ```bash
   # Check frontend env
   cat frontend/.env | grep VITE_API_BASE_URL
   # Should be: http://localhost:8000/api
   ```

3. Browser console errors (F12 → Console tab)

### Login Returns 401 Unauthorized

**Possible Causes:**
1. Wrong password
2. User doesn't exist
3. Check backend logs:
   ```bash
   docker-compose logs app | grep -i login
   ```

### Login Returns 200 but No Redirect

**Possible Causes:**
1. **Backend missing user object** (See: ScanNReports/LOGIN_FLOW_ANALYSIS.md Section 7)
2. Frontend auth state not updating
3. Check browser console for errors
4. Check localStorage (F12 → Application → Local Storage)

### "Email already registered" During Registration

**Solution:** Use a different email or login with existing account

### Can't Register with `.local` Domain

**Error:** "The part after the @-sign is a special-use or reserved name"

**Solution:** Use standard domains like `.com`, `.org`, `.net`

```bash
# ❌ Won't work:
test@sipper.local

# ✅ Will work:
test@example.com
test@sipper.com
test@test.org
```

---

## Creating New Test Users

### Via API

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123!",
    "full_name": "New User",
    "organization_name": "New Company"
  }'
```

### Via Browser

1. Open: `http://localhost:8000/register`
2. Fill in:
   - Email
   - Password (min 8 chars)
   - Full Name
   - Organization Name
3. Click "Register"
4. **Should auto-login** and redirect to dashboard

---

## Password Requirements

Based on frontend validation (`frontend/src/lib/validations/auth.ts`):

- Minimum length: 8 characters
- Must contain: uppercase, lowercase, number, special char
- Examples:
  - ✅ `TestPassword123!`
  - ✅ `SecurePass123!`
  - ✅ `MyP@ssw0rd`
  - ❌ `password` (too simple)
  - ❌ `12345678` (no letters)

---

## Database Access

### Check User Exists

```bash
docker exec sipper-db psql -U sipper -d sipper -c \
  "SELECT email, full_name, is_active FROM users WHERE email='testuser@example.com';"
```

### Check User's Organization

```bash
docker exec sipper-db psql -U sipper -d sipper -c \
  "SELECT u.email, o.name as org_name, o.slug 
   FROM users u 
   JOIN organizations o ON u.organization_id = o.id 
   WHERE u.email='testuser@example.com';"
```

### Check User's Role

```bash
docker exec sipper-db psql -U sipper -d sipper -c \
  "SELECT u.email, r.name as role 
   FROM users u 
   LEFT JOIN user_roles ur ON u.id = ur.user_id 
   LEFT JOIN roles r ON ur.role_id = r.id 
   WHERE u.email='testuser@example.com';"
```

### Reset Password (Manual)

```python
# Run inside Docker container
docker exec -it sipper-app python

from app.auth.password import hash_password
new_hash = hash_password("NewPassword123!")
print(new_hash)
# Copy the hash, then:

# Update in database:
docker exec sipper-db psql -U sipper -d sipper -c \
  "UPDATE users SET password_hash='<paste-hash-here>' WHERE email='testuser@example.com';"
```

---

## Environment Check

### Backend Health

```bash
# Check containers are running
docker-compose ps

# Expected:
# sipper-app   Up (healthy)
# sipper-db    Up (healthy)

# Check backend logs
docker-compose logs app | tail -20

# Test API is responding
curl http://localhost:8000/api/health
```

### Frontend Health

```bash
# Check if frontend dev server is running
curl http://localhost:8000/

# Should return HTML (not 404)
```

### Database Health

```bash
# Test database connection
docker exec sipper-db psql -U sipper -d sipper -c "SELECT 1;"

# Should return:
# ?column? 
#----------
#        1
```

---

## Security Notes

⚠️ **These are TEST credentials for development only**

**Never use in production:**
- Change all default passwords
- Use strong, unique passwords
- Enable 2FA if available
- Use environment-specific secrets
- Don't commit credentials to git

**Current security status:**
- ✅ Passwords hashed with PBKDF2-SHA256
- ✅ 100,000 iterations
- ✅ Random salt per password
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ Session timeout (30 min inactivity)
- ⚠️ JWT secret should be changed in production
- ⚠️ Use HTTPS in production

---

## Quick Reference

| What | Command |
|------|---------|
| Start services | `docker-compose up -d` |
| Stop services | `docker-compose down` |
| View logs | `docker-compose logs -f app` |
| Rebuild backend | `docker-compose build --no-cache app` |
| Database shell | `docker exec -it sipper-db psql -U sipper -d sipper` |
| Backend shell | `docker exec -it sipper-app bash` |
| Check DB users | `docker exec sipper-db psql -U sipper -d sipper -c "SELECT email FROM users;"` |

---

**Last Updated:** March 6, 2026  
**Status:** ✅ Test account verified working  
**Next Steps:** See `ScanNReports/LOGIN_FLOW_ANALYSIS.md` for fixing the login flow issue
