# Sipper - Immediate Security Fixes Checklist
**Date:** 2026-03-05  
**Status:** 🚨 ACTION REQUIRED

---

## 🔴 CRITICAL - Fix TODAY

### 1. Fix Encryption Key Format (Blocks Credential Management)
```bash
# Generate proper Fernet key
python3 << 'EOF'
from cryptography.fernet import Fernet
print(f"ENCRYPTION_KEY={Fernet.generate_key().decode()}")
EOF

# Update .env with output
# Then restart: docker-compose restart app
```

**Test:**
```bash
curl -X POST http://localhost:8000/api/credentials \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","sip_domain":"sip.example.com","username":"user","password":"pass"}'

# Should return 201 Created (not 500 Internal Server Error)
```

---

### 2. Regenerate All Secrets
```bash
# Generate new secrets
python3 << 'EOF'
import secrets
print(f"SECRET_KEY={secrets.token_urlsafe(48)}")
print(f"JWT_SECRET={secrets.token_urlsafe(48)}")
print(f"DB_PASSWORD={secrets.token_urlsafe(32)}")
print(f"# ENCRYPTION_KEY from step 1 above")
EOF

# Update .env with all new values
# Restart all services: docker-compose down && docker-compose up -d
```

---

### 3. Disable SQL Echo in Production
**File:** `backend/app/database.py`
```python
engine = create_async_engine(
    settings.database_url,
    echo=settings.app_env == "development",  # ✅ Conditional
    future=True,
)
```

---

### 4. Add Connection Pooling
**File:** `backend/app/database.py`
```python
engine = create_async_engine(
    settings.database_url,
    echo=settings.app_env == "development",
    future=True,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600,
)
```

**Commit and deploy:**
```bash
cd ~/Documents/projects/sipper
git add backend/app/database.py
git commit -m "fix: add connection pooling and conditional SQL logging"
docker-compose restart app
```

---

## 🔥 HIGH - Fix This Week

### 5. Implement Rate Limiting
```bash
# Install dependency
cd ~/Documents/projects/sipper/backend
echo "slowapi==0.1.9" >> requirements.txt
docker-compose build app
```

**File:** `backend/app/main.py`
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
```

**File:** `backend/app/routers/auth.py`
```python
# Add to imports
from app.main import limiter

# Update endpoints
@router.post("/login")
@limiter.limit("5/minute")
async def login(...):
    ...

@router.post("/register")
@limiter.limit("3/hour")
async def register(...):
    ...
```

---

### 6. Remove Database Port Exposure
**File:** `docker-compose.yml`
```yaml
  db:
    image: postgres:16-alpine
    container_name: sipper-db
    environment:
      POSTGRES_DB: ${DB_NAME:-sipper}
      POSTGRES_USER: ${DB_USER:-sipper}
      POSTGRES_PASSWORD: ${DB_PASSWORD:?Database password required}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    # ❌ REMOVE THIS:
    # ports:
    #   - "${DB_PORT:-5432}:5432"
    expose:  # ✅ USE THIS INSTEAD
      - "5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER:-sipper}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - sipper-network
    restart: unless-stopped
```

---

### 7. Tighten CORS Configuration
**File:** `backend/app/main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  # ✅ Explicit
    allow_headers=["Content-Type", "Authorization", "Accept"],  # ✅ Explicit
)
```

**File:** `.env` (production)
```bash
# Remove localhost origins
CORS_ORIGINS=https://your-production-domain.com
```

---

## 🟠 MEDIUM - Plan for Next Sprint

### 8. Add Token Blacklist
- Install Redis: `docker-compose.yml` add redis service
- Add `redis` package: `pip install redis[hiredis]`
- Implement blacklist logic in auth endpoints

### 9. Complete RBAC Implementation
- Fix `check_user_permission()` in `backend/app/middleware/rbac.py`
- Add proper ORM joins for User → Role → Permission chain

### 10. Fix N+1 Queries
- Add `.options(selectinload(...))` to all list endpoints
- Test with `EXPLAIN ANALYZE` in PostgreSQL

---

## Quick Verification Commands

```bash
# Check if containers are running
docker ps | grep sipper

# View recent logs
docker logs sipper-app --tail 50
docker logs sipper-db --tail 20

# Check database connections
docker exec sipper-db psql -U sipper -d sipper -c \
  "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='sipper';"

# Check container resources
docker stats --no-stream sipper-app sipper-db

# Test API health
curl http://localhost:8000/health

# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## Rollback Plan

If any fix causes issues:
```bash
cd ~/Documents/projects/sipper
git log --oneline -5  # Find commit before changes
git checkout <commit-hash>
docker-compose down
docker-compose up -d --build
```

---

## Success Criteria

✅ **All fixes applied when:**
- [ ] Credential creation works (no 500 errors)
- [ ] All secrets are unique and secure
- [ ] SQL queries not logged in production
- [ ] Connection pool configured (check logs for pool stats)
- [ ] Rate limiting returns 429 when exceeded
- [ ] Database not accessible from host (test: `psql -h localhost -U sipper`)
- [ ] CORS only allows production domain

---

**Priority Order:**
1. Encryption key fix (blocks functionality)
2. Secret regeneration (critical security)
3. SQL echo + connection pooling (performance + security)
4. Rate limiting (DoS protection)
5. Network isolation (defense in depth)

**Estimated Time:** 2-3 hours for all critical/high fixes
