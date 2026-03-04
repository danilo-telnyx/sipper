# SIPPER Backend - Quick Start Guide

Get the backend running in 5 minutes!

## 🚀 Option 1: Docker (Recommended)

### Step 1: Configure Environment
```bash
cd ~/Documents/projects/sipper/backend

# Copy example env file
cp .env.example .env

# Generate encryption key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Copy the output and paste into .env for ENCRYPTION_KEY

# Set JWT_SECRET in .env (any random string)
# Example: JWT_SECRET=my-super-secret-key-change-in-production
```

### Step 2: Start Services
```bash
docker-compose up -d
```

### Step 3: Verify
```bash
# Check health
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# Open API docs
open http://localhost:8000/docs
```

### Step 4: Create First User
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "full_name": "Admin User",
    "organization_name": "My Organization"
  }'
```

You'll get back access and refresh tokens. Copy the `access_token` for next steps.

### Step 5: Test Authenticated Endpoint
```bash
# Replace YOUR_TOKEN with the access_token from step 4
curl http://localhost:8000/orgs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐍 Option 2: Local Python (Development)

### Step 1: Setup Python Environment
```bash
cd ~/Documents/projects/sipper/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Start PostgreSQL
```bash
# Option A: Using Docker for DB only
docker run -d \
  --name sipper-db \
  -e POSTGRES_DB=sipper \
  -e POSTGRES_USER=sipper \
  -e POSTGRES_PASSWORD=sipper_dev \
  -p 5432:5432 \
  postgres:15-alpine

# Option B: Use local PostgreSQL
# (Make sure it's running and create database 'sipper')
```

### Step 3: Configure Environment
```bash
cp .env.example .env

# Edit .env:
# - DATABASE_URL=postgresql+asyncpg://sipper:sipper_dev@localhost:5432/sipper
# - ENCRYPTION_KEY=<generated key>
# - JWT_SECRET=<random string>
```

### Step 4: Run API
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 5: Verify
Open http://localhost:8000/docs in your browser.

## 📋 Common Commands

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Access database
docker exec -it sipper-db psql -U sipper -d sipper
```

### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","full_name":"Test User","organization_name":"Test Org"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# List credentials (requires token)
curl http://localhost:8000/credentials \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔍 Troubleshooting

### Issue: "Connection refused" to database
**Solution:** Make sure PostgreSQL is running:
```bash
docker-compose ps
# Should show db container as "Up"
```

### Issue: "Invalid token" errors
**Solution:** Token might be expired (15 min). Login again or use refresh endpoint:
```bash
curl -X POST http://localhost:8000/auth/refresh?refresh_token=YOUR_REFRESH_TOKEN
```

### Issue: "Encryption key" error
**Solution:** Make sure ENCRYPTION_KEY in .env is a valid Fernet key:
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### Issue: Database schema errors
**Solution:** Reset database:
```bash
docker-compose down -v  # Removes volumes
docker-compose up -d    # Fresh start
```

## 📖 Next Steps

1. **Explore API Docs:** http://localhost:8000/docs
2. **Read SPEC.md** for architecture details
3. **Read README.md** for full documentation
4. **Check IMPLEMENTATION.md** for what's been built
5. **Review VERIFICATION.md** for testing checklist

## 🎯 Example Workflow

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","full_name":"User","organization_name":"Org"}' \
  | jq -r .access_token)

# 2. Create SIP credential
CRED_ID=$(curl -s -X POST http://localhost:8000/credentials \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My SIP","sip_domain":"sip.example.com","username":"user1","password":"sippass"}' \
  | jq -r .id)

# 3. Run test
TEST_ID=$(curl -s -X POST http://localhost:8000/tests/run \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"test_type\":\"registration\",\"credential_id\":\"$CRED_ID\",\"metadata\":{}}" \
  | jq -r .id)

# 4. Check results
curl http://localhost:8000/tests/results/$TEST_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

## ✅ You're Ready!

Your SIPPER backend is now running. Start building the frontend or integrate the SIP testing engine!

---

**Last Updated:** 2026-03-04
