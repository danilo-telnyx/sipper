# SIPPER Troubleshooting Guide

**Version**: 0.7.0  
**Last Updated**: 2026-03-08

---

## Quick Diagnostics

### Is SIPPER Running?

```bash
# Check backend health
curl http://localhost:8000/health

# Expected: {"status":"healthy"}
```

### Common Startup Issues

| Symptom | Cause | Solution |
|---------|-------|----------|
| Port 8000 in use | Another service using port | Stop other service or change port in `docker-compose.yml` |
| Database connection failed | PostgreSQL not ready | Wait 10s and restart: `docker-compose restart app` |
| Frontend 404 errors | Static files not built | Run `cd frontend && npm run build` |

---

## Frontend Issues

### 1. "405 Method Not Allowed" on Test Creation

**Symptom**: Error when clicking "Run Test"  
**Cause**: API endpoint mismatch (fixed in v0.6.0+)  
**Solution**:
```bash
# Pull latest code
git pull origin main

# Rebuild frontend
cd frontend && npm install && npm run build
```

### 2. WebSocket Connection Failed

**Symptom**: "Max reconnection attempts, falling back to polling"  
**Cause**: WebSocket server not configured  
**Impact**: ⚠️ Minor - App works fine with HTTP polling  
**Solution**: Not required - polling fallback is automatic

### 3. Help Panel Not Opening

**Symptom**: Pressing `?` does nothing  
**Cause**: Keyboard listener not loaded  
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Check browser console for errors

### 4. Validation Errors Not Showing

**Symptom**: No red error messages in SIP Test Builder  
**Cause**: Validation not triggered  
**Solution**: Fill out at least one field to trigger validation

---

## Backend Issues

### 1. Credential Decryption Failed

**Symptom**: 500 error when loading credentials  
**Cause**: ENCRYPTION_KEY changed or missing  
**Solution**:
```bash
# Check if ENCRYPTION_KEY is set
docker exec sipper-app env | grep ENCRYPTION_KEY

# If missing, add to .env:
ENCRYPTION_KEY=<generate new key>

# Restart
docker-compose restart app
```

⚠️ **Warning**: Changing ENCRYPTION_KEY will make existing credentials unreadable!

### 2. JWT Token Expired

**Symptom**: 401 Unauthorized on API calls  
**Cause**: Access token expired (15 min lifetime)  
**Solution**: Refresh page to trigger token refresh automatically

### 3. Database Migration Failed

**Symptom**: App won't start, migration errors in logs  
**Cause**: Database schema out of sync  
**Solution**:
```bash
# Reset database (⚠️ DESTROYS ALL DATA)
docker-compose down -v
docker-compose up -d

# Or manually run migrations
docker exec sipper-app alembic upgrade head
```

---

## Test Execution Issues

### 1. Test Stuck in "Running" State

**Symptom**: Test status never updates to completed  
**Cause**: Background task failed  
**Solution**:
1. Check backend logs: `docker-compose logs app`
2. Cancel test (if endpoint exists)
3. Report issue with logs

### 2. Connection Timeout

**Symptom**: Test fails with "Connection timeout"  
**Cause**: SIP server unreachable  
**Solution**:
1. Verify SIP server IP/domain is correct
2. Check firewall allows UDP port 5060
3. Test with `OPTIONS` method first (lighter than INVITE)

### 3. Authentication Failed (401/407)

**Symptom**: Test fails with 401 or 407  
**Cause**: Wrong credentials or realm  
**Solutions**:
- Verify username/password in credentials
- Check SIP domain matches server realm
- Enable "Authentication" toggle in test builder
- Test with unauthenticated OPTIONS first

---

## Performance Issues

### 1. Slow Page Load

**Symptom**: Pages take >3s to load  
**Cause**: Large bundle size  
**Solution** (Sprint 5 enhancement):
- Code splitting implemented
- Use lazy loading for routes
- Enable compression in production

### 2. Memory Leak

**Symptom**: Browser RAM usage grows over time  
**Cause**: Event listeners not cleaned up  
**Solution**:
- Hard refresh browser
- Check browser console for warnings
- Report issue with reproduction steps

---

## SIP-Specific Issues

### 1. SDP Validation Failed

**Symptoms**:
- ❌ "SDP must include v=" error
- ❌ "SDP must include m=" error

**Cause**: Incomplete SDP  
**Solution**: Use SDP template in INVITE form

**Required SDP Fields**:
```sdp
v=0                  # Version
o=...                # Origin
s=Session            # Session name
c=IN IP4 127.0.0.1   # Connection
t=0 0                # Timing
m=audio 5004 RTP...  # Media
```

### 2. REFER Replaces Format Error

**Symptom**: "Replaces must include from-tag and to-tag"  
**Cause**: Invalid Replaces header format  
**Solution**: Use format: `call-id;from-tag=XXX;to-tag=YYY`

**Example**:
```
3848276298220188511@example.com;from-tag=9fxced76sl;to-tag=314159
```

### 3. Codec Negotiation Failed (488)

**Symptom**: 488 Not Acceptable Here  
**Cause**: No common codecs between client and server  
**Solution**:
- Check server supported codecs
- Add multiple codecs to SDP (PCMU, PCMA, G.729)
- Use SDP template (includes PCMU/PCMA)

---

## Docker Issues

### 1. Container Won't Start

```bash
# Check container status
docker-compose ps

# Check logs for errors
docker-compose logs app

# Common fixes:
docker-compose down
docker-compose up -d --build
```

### 2. Database Connection Refused

**Symptom**: `connection refused` in logs  
**Cause**: PostgreSQL container not ready  
**Solution**:
```bash
# Check DB container
docker-compose logs db

# Restart both services
docker-compose restart db app
```

---

## Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 90+ | ✅ Full | Recommended |
| Firefox | 88+ | ✅ Full | Recommended |
| Safari | 14+ | ✅ Full | - |
| Edge | 90+ | ✅ Full | Chromium-based |
| IE 11 | Any | ❌ Not supported | Use modern browser |

---

## Getting Help

### Before Reporting an Issue

1. ✅ Check this troubleshooting guide
2. ✅ Search existing GitHub issues
3. ✅ Collect diagnostic information:
   ```bash
   # Version
   cat VERSION
   
   # Backend logs
   docker-compose logs app --tail=100
   
   # Frontend console errors
   # (Open browser DevTools → Console)
   ```

### Reporting a Bug

Include:
1. SIPPER version (`cat VERSION`)
2. Environment (Docker/local, OS)
3. Steps to reproduce
4. Expected vs actual behavior
5. Logs/screenshots

**GitHub Issues**: https://github.com/danilo-telnyx/sipper/issues

---

## Debug Mode

### Enable Verbose Logging

```bash
# Add to .env
LOG_LEVEL=DEBUG

# Restart
docker-compose restart app
```

### Frontend Debug Mode

Open browser console and run:
```javascript
localStorage.setItem('debug', '*')
```

Refresh page to see verbose logs.

---

## Useful Commands

```bash
# Restart everything
docker-compose restart

# View live logs
docker-compose logs -f app

# Shell into container
docker exec -it sipper-app bash

# Check Python dependencies
docker exec sipper-app pip list

# Check Node dependencies
cd frontend && npm list
```

---

## Known Issues (v0.7.0)

1. **WebSocket reconnection**: Falls back to polling (not a bug, by design)
2. **Bundle size warning**: Code splitting partially implemented
3. **PNG/SVG export**: Not yet implemented (JSON export works)

---

**Need more help?** Check the [Documentation](/documentation) page or open an issue on GitHub.
