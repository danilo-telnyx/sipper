# 🔧 Sipper Troubleshooting Guide

Common issues and solutions for Sipper deployment and operation.

---

## 🚨 Container Issues

### Containers won't start

**Symptom:** `docker-compose up` fails or containers exit immediately

**Solutions:**

```bash
# Check logs for error messages
docker-compose logs app
docker-compose logs db

# Common issue: Port conflicts
# Check if ports 8000 or 5432 are already in use
sudo lsof -i :8000
sudo lsof -i :5432

# Kill conflicting processes or change ports in docker-compose.yml
```

### Port already in use

**Error:** `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution:**

```bash
# Option 1: Find and kill the process using the port
lsof -ti:8000 | xargs kill -9

# Option 2: Change the port in .env
echo "APP_PORT=8080" >> .env
docker-compose up -d
```

### Database connection refused

**Error:** `connection refused` or `could not connect to server`

**Solution:**

```bash
# Wait for database to be ready (can take 30-60 seconds on first start)
docker-compose logs db | grep "database system is ready"

# Check database health
docker exec sipper-db pg_isready -U sipper

# If still failing, restart database
docker-compose restart db
```

---

## 🔐 Authentication Issues

### Can't register or login

**Symptom:** 401/403 errors, "Weak secret detected"

**Solution:**

```bash
# Check if you're using default secrets
grep -i "change-this\|example\|test123" .env

# If found, regenerate secrets:
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Update .env with new secrets and restart
docker-compose restart app
```

### JWT token errors

**Error:** `Invalid token` or `Token has expired`

**Solution:**

```bash
# Clear browser cookies and local storage
# In browser console:
localStorage.clear()
sessionStorage.clear()

# Then try logging in again
```

---

## 🔒 Encryption Errors

### Credential creation fails with 500 error

**Error:** `Invalid token` or `Incorrect padding` when creating credentials

**Solution:**

```bash
# Regenerate valid Fernet encryption key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Update ENCRYPTION_KEY in .env
# MUST be exactly 44 characters ending with '='

# Restart application
docker-compose restart app

# Test credential creation
curl -X POST http://localhost:8000/api/credentials/ \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"test","sip_domain":"sip.example.com","username":"user","password":"pass"}'
```

### Can't decrypt existing credentials

**Issue:** Changed ENCRYPTION_KEY, now old credentials fail to decrypt

**Solution:**

⚠️ **There is NO recovery** if you lose the ENCRYPTION_KEY used to encrypt data.

```bash
# If you have a backup of the old .env:
cp .env.backup .env
docker-compose restart app

# Otherwise, you must:
# 1. Delete old credentials from database
# 2. Re-create them with the new key
```

**Prevention:** Always backup your .env file before changing secrets!

---

## 🌐 Frontend Issues

### Frontend not loading / blank page

**Symptoms:** Accessing http://localhost:8000 shows blank page or 404

**Solution:**

```bash
# Check if frontend was built
docker exec sipper-app ls -la /app/frontend/dist

# If missing, rebuild containers
docker-compose build --no-cache app
docker-compose up -d

# Check application logs
docker-compose logs app | grep -i frontend
```

### API calls fail with CORS errors

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution:**

```bash
# Check CORS_ORIGINS in .env includes your frontend URL
echo "CORS_ORIGINS=http://localhost:3000,http://localhost:8000" >> .env

# Restart application
docker-compose restart app
```

### Frontend Not Loading / Asset Errors

**Symptoms:**
- Blank page or "Failed to fetch dynamically imported module"
- 404 errors on /assets/*.js files

**Cause:** Docker cached old frontend build

**Solution:**
```bash
./scripts/rebuild.sh
# OR manually:
docker-compose down
docker rmi sipper-app
docker-compose build --no-cache
docker-compose up -d
```

---

## 🗄️ Database Issues

### Database won't initialize

**Symptom:** Tables not created, errors about missing relations

**Solution:**

```bash
# Drop and recreate database
docker-compose down -v  # ⚠️ DELETES ALL DATA
docker-compose up -d

# Check initialization
docker-compose logs db | grep "CREATE TABLE"
```

### Can't connect to database from host

**Error:** `psql: connection refused` when trying `psql -h localhost -U sipper`

**Solution:**

This is by design for security. Database is NOT exposed to host.

```bash
# To access database, use docker exec:
docker exec -it sipper-db psql -U sipper -d sipper_db

# Or temporarily expose port in docker-compose.yml (development only):
# ports:
#   - "5432:5432"
```

### Database performance issues

**Symptom:** Slow queries, connection timeouts

**Solution:**

```bash
# Check active connections
docker exec sipper-db psql -U sipper -d sipper_db -c \
  "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='sipper_db';"

# Connection pooling is configured (pool_size=20, max_overflow=10)
# If consistently hitting limits, increase in backend/app/database.py

# Check for long-running queries
docker exec sipper-db psql -U sipper -d sipper_db -c \
  "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active';"
```

---

## 🧪 Testing Issues

### SIP tests fail or timeout

**Symptom:** Tests show "failed" status, no SIP connection

**Solution:**

```bash
# Check SIP port is open
sudo lsof -i :5060

# Verify SIP credentials are correct
curl -X GET http://localhost:8000/api/credentials/<id>?include_password=true \
  -H "Authorization: Bearer <admin-token>"

# Check if SIP server is reachable
nc -zv sip.telnyx.com 5060

# Review test logs
docker-compose logs app | grep -i "sip\|test"
```

### Background tasks not executing

**Symptom:** Tests stuck in "pending" status forever

**Solution:**

```bash
# Check application logs for errors
docker-compose logs app | grep -i "background\|task\|test"

# Restart application
docker-compose restart app

# Verify database connectivity for background tasks
docker-compose logs app | grep -i "session\|pool"
```

---

## 📊 Rate Limiting

### Getting 429 Too Many Requests

**Error:** `429 Too Many Requests` on login/register

**Solution:**

This is expected behavior to prevent brute-force attacks.

**Limits:**
- Login: 5 requests per minute per IP (production) / 100 per minute (development)
- Register: 3 requests per 10 minutes per IP (production) / 100 per hour (development)

```bash
# Wait a few minutes and try again

# For development, set APP_ENV=development in .env for permissive rate limits
# ⚠️ Always use APP_ENV=production in production environments!
```

### Rate Limit Errors During Testing

**Symptoms:**
- "Rate limit exceeded" on login/register
- HTTP 429 errors

**Quick fix:**
```bash
./scripts/quick-reset.sh
```

**Permanent fix:**
Set `APP_ENV=development` in `.env` for permissive rate limits during development.

---

## 🔄 Docker Issues

### Rebuild not picking up changes

**Issue:** Code changes not reflected after rebuild

**Solution:**

```bash
# Full clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Disk space issues

**Error:** `no space left on device`

**Solution:**

```bash
# Clean up Docker resources
docker system prune -a --volumes

# Check disk usage
docker system df

# Remove old Sipper images/volumes
docker images | grep sipper
docker volume ls | grep sipper
```

---

## 🆘 Emergency Reset

If nothing else works, perform a complete reset:

```bash
# ⚠️ WARNING: This deletes ALL data!

# Stop and remove everything
docker-compose down -v

# Remove images
docker rmi sipper-app

# Remove dangling volumes
docker volume prune

# Start fresh
cp .env.example .env
# Generate new secrets (see README)
docker-compose up -d --build
```

---

## 📝 Logs and Debugging

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail 100 app

# Search logs for errors
docker-compose logs app | grep -i error
docker-compose logs app | grep -i warning
```

### Check container status

```bash
# List running containers
docker ps | grep sipper

# Check resource usage
docker stats --no-stream sipper-app sipper-db

# Inspect container
docker inspect sipper-app
```

### Health checks

```bash
# Application health
curl http://localhost:8000/health

# Database health
docker exec sipper-db pg_isready -U sipper

# Container health status
docker ps --filter "name=sipper" --format "table {{.Names}}\t{{.Status}}"
```

---

## 🔗 Useful Commands Reference

```bash
# Quick health check
docker ps && curl -s http://localhost:8000/health

# Restart everything
docker-compose restart

# View environment variables
docker exec sipper-app env | grep -E "DB_|JWT_|ENCRYPTION"

# Access database shell
docker exec -it sipper-db psql -U sipper -d sipper_db

# Follow logs in real-time
docker-compose logs -f --tail 50

# Check database connections
docker exec sipper-db psql -U sipper -d sipper_db -c \
  "SELECT client_addr, state, query FROM pg_stat_activity WHERE datname='sipper_db';"
```

---

## 📞 Still Having Issues?

1. Check application logs: `docker-compose logs app`
2. Check database logs: `docker-compose logs db`
3. Verify all secrets are properly set in `.env`
4. Try a clean rebuild: `docker-compose down && docker-compose up -d --build`
5. Open an issue: https://github.com/danilo-telnyx/sipper/issues

---

**Last updated:** 2026-03-05  
**Version:** 0.1.0
