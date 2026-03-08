# 🧪 Sipper - SIP Protocol Testing Platform

Production-ready web application for executing RFC3261-compliant SIP protocol tests with multi-tenant RBAC and Telnyx integration.

## 🚀 Quick Start (Docker)

```bash
# Clone the repository
git clone https://github.com/danilo-telnyx/sipper.git
cd sipper

# Create environment file
cp .env.example .env
# Edit .env with your settings (DB credentials, JWT secrets)

# Start with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:8000
```

**First time setup:**
1. Navigate to http://localhost:8000
2. Click "Register" to create your organization and admin account
3. Add your SIP credentials via the Credentials Manager
4. Run your first SIP test!

## 📋 Prerequisites

- Docker Desktop or Docker Engine
- Docker Compose
- 8000 (HTTP) and 5060 (SIP UDP) ports available

## 🔧 Configuration

### 1. Create environment file

```bash
cp .env.example .env
```

### 2. Generate production secrets

**IMPORTANT:** Never use default/example secrets in production!

```bash
# Generate JWT_SECRET (48 characters recommended)
python3 -c "import secrets; print(f'JWT_SECRET={secrets.token_urlsafe(48)}')"

# Generate SECRET_KEY (48 characters recommended)
python3 -c "import secrets; print(f'SECRET_KEY={secrets.token_urlsafe(48)}')"

# Generate ENCRYPTION_KEY (Fernet key for credential encryption)
python3 -c "from cryptography.fernet import Fernet; print(f'ENCRYPTION_KEY={Fernet.generate_key().decode()}')"

# Generate DB_PASSWORD
python3 -c "import secrets; print(f'DB_PASSWORD={secrets.token_urlsafe(32)}')"
```

### 3. Update .env with generated secrets

```env
# Database Configuration
DB_USER=sipper
DB_PASSWORD=<paste generated password>
DB_NAME=sipper_db

# Application Environment
APP_ENV=production
API_HOST=0.0.0.0
API_PORT=8000

# Security Secrets (REQUIRED)
JWT_SECRET=<paste generated JWT secret>
SECRET_KEY=<paste generated secret key>
ENCRYPTION_KEY=<paste generated Fernet key>

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:8000,http://localhost:3000
```

### 4. Verify configuration

After starting the application, verify everything works:

```bash
# Check health
curl http://localhost:8000/health

# Check logs for startup validation
docker-compose logs app | grep -i "validation\|startup"
```

The application will **refuse to start** if weak/default secrets are detected.

## 🏗️ Architecture

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** FastAPI + PostgreSQL + asyncpg
- **SIP Engine:** RFC3261-compliant Node.js SIP client
- **Auth:** JWT with refresh tokens, multi-tenant RBAC
- **Database:** PostgreSQL 16 with asyncio support

## 📦 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `sipper-app` | 8000 (HTTP), 5060 (UDP) | FastAPI backend + React frontend |
| `sipper-db` | 5432 | PostgreSQL 16 database |

## 🧪 Features

- ✅ RFC3261-compliant SIP testing
- ✅ Multi-tenant organization isolation
- ✅ Role-based access control (Admin, Manager, User)
- ✅ Encrypted SIP credential storage
- ✅ **Telnyx Auto-Import** — One-click import of SIP credentials from Telnyx API
- ✅ WebSocket real-time test monitoring
- ✅ Telnyx SIP trunk integration
- ✅ Test history and result analytics
- ✅ Docker-ready deployment
- ✅ Comprehensive test coverage

## 🌟 Telnyx Auto-Import

Sipper can automatically import SIP credentials directly from your Telnyx account:

1. **Open Credentials Manager**
2. **Click "Add Credential"**
3. **Toggle "Telnyx Integration" ON**
4. **Enter your Telnyx credentials:**
   - **Connection ID** — Find this in your Telnyx Portal under SIP > Connections
   - **API Key** — Generate one in Telnyx Portal under API Keys
5. **Wait ~1 second** — All SIP fields auto-populate!
6. **Click "Add Credential"** to save

**Auto-populated fields:**
- Credential name (from connection name)
- SIP username
- SIP password
- SIP domain (sip.telnyx.com)
- Port (5060)
- Transport (UDP)

**Note:** Your Telnyx API key is only used for the import request and is never stored.

## 🛠️ Development

```bash
# Build from source
docker-compose up --build

# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Run tests
docker exec sipper-app pytest backend/tests/ -v
```

## 🔧 Development Scripts

**Full rebuild (use when frontend changes):**
```bash
./scripts/rebuild.sh
```

**Quick restart (use to clear rate limits):**
```bash
./scripts/quick-reset.sh
```

**Manual rebuild:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## ⚙️ Development vs Production

The application automatically adjusts based on `APP_ENV`:

**Development mode** (`APP_ENV=development`):
- Permissive rate limiting (100 requests/min)
- SQL queries logged
- Detailed error messages

**Production mode** (`APP_ENV=production`):
- Strict rate limiting (5 login/min, 3 register/10min)
- SQL logging disabled
- Minimal error exposure

Set in `.env`: `APP_ENV=development` or `APP_ENV=production`

## 📚 API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI spec: http://localhost:8000/openapi.json

## 🔐 Security

- Passwords hashed with PBKDF2-SHA256 (100,000 iterations)
- SIP credentials encrypted at rest with AES-256
- JWT tokens with configurable expiration
- Multi-tenant data isolation at database level
- CORS properly configured

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Pull requests welcome! Please ensure:
- Docker build succeeds
- All tests pass
- Code follows existing style

## 📞 Support

- Issues: https://github.com/danilo-telnyx/sipper/issues
- Docs: See `/docs` directory in the repository

---

Built with ❤️ by the Telnyx Solutions Engineering team
