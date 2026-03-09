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

### 🆕 Enhanced SIP Testing (v0.4.0)
- ✅ **Enhanced SIP Test Builder** — Advanced UI for protocol-specific testing
  - Method selector: INVITE, REGISTER, OPTIONS, REFER
  - Authentication toggle: Test authenticated/unauthenticated flows
  - Real-time RFC validation with error/warning feedback
- ✅ **REFER Support (RFC 3515)** — Call transfer testing (blind & attended)
- ✅ **Session Recording (RFC 7865)** — Recording metadata for compliance
- ✅ **Unauthenticated Messages** — Test server behavior without auth
- ✅ **SDP Editor** — Session Description Protocol editing with templates
- ✅ **Parameter Validation** — Comprehensive RFC 3261 compliance checks

### 🆕 Help System (v0.5.0)
- ✅ **Contextual Help Panel** — Context-aware help with keyboard shortcuts
  - Toggle with `?` key or click help icon
  - Slide-in panel with tabbed interface
  - Route-based content detection
- ✅ **Comprehensive Documentation** — In-app guides for all features
  - Step-by-step instructions
  - Copy-paste code examples
  - RFC references with IETF links
  - Troubleshooting tips
- ✅ **7 Context Pages** — Dashboard, Credentials, Test Runners, Results, Admin
- ✅ **Code Sample Library** — One-click copy with syntax highlighting

### 🆕 Flow Visualization + Documentation (v0.6.0)
- ✅ **SIP Flow Diagrams** — Interactive sequence diagrams
  - Color-coded response classes (1xx-5xx)
  - Expandable message details (headers, body, raw)
  - Zoom controls (50%-200%)
  - Fullscreen mode
  - Real-time updates during tests
  - JSON export (PNG/SVG coming soon)
- ✅ **Interactive Documentation** — Comprehensive guide with workflows
  - 5 tabbed sections: Overview, Workflows, Features, API, Security
  - Visual workflow diagrams (Registration, Call Setup, Transfer)
  - Sprint history timeline
  - API endpoint reference
  - WebSocket events documentation
  - Security best practices
- ✅ **Version Display** — FE/BE versions in sidebar footer

### 🆕 Production Ready (v0.7.1)
- ✅ **E2E Testing** — Playwright test suite
  - 33 comprehensive tests across 4 suites
  - Cross-browser testing (Chrome, Firefox, Safari, Mobile)
  - Authentication, Help System, SIP Builder, Accessibility
- ✅ **Enhanced Documentation** — Production-grade guides
  - RFC Compliance Matrix (98% compliance, 6 RFCs)
  - INVITE User Guide with troubleshooting
  - Comprehensive troubleshooting guide
  - Browser compatibility matrix
- ✅ **Performance Optimizations** — 55% bundle size reduction
  - Code splitting with lazy loading
  - Main bundle: 988KB → 442KB
  - Individual page chunks: 4-35KB
  - Faster initial load times
- ✅ **Accessibility (WCAG 2.1 AA)** — Fully accessible
  - Keyboard navigation
  - ARIA labels
  - Screen reader support
  - Focus indicators
- ✅ **Mobile Responsive** — Tested across devices
  - iPhone SE, iPad, Desktop viewports
  - Touch-friendly controls
  - Responsive breakpoints

### 🎓 E-Learning Platform (v0.8.0)
- ✅ **SIP Training Courses** — Comprehensive 3-level curriculum
  - Basic: SIP fundamentals and protocol basics
  - Intermediate: Advanced SIP features and call flows
  - Advanced: Complex scenarios, troubleshooting, and RFC deep-dives
- ✅ **Interactive Assessments** — Built-in quiz system
  - 5-question quizzes every 3 sections (60% pass threshold)
  - 15-question final exams per level (70% pass for certification)
  - Immediate feedback with explanations
- ✅ **Telnyx SIP Certification** — Auto-generated certificates
  - Professional certificates issued on exam pass
  - Download as PDF
  - Certificate validation system
- ✅ **Progress Tracking** — User learning dashboard
  - Track completion across all courses
  - Visual progress indicators
  - Personal learning history
- ✅ **Admin Course Management** — Full control for instructors
  - Question bank CRUD operations
  - User results and analytics
  - Branched question flows
  - Platform statistics dashboard
  - Content organization tools

**Access:** Navigate to "SIP Training" in the sidebar to start learning!

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

## 💻 Local Development (Without Docker)

**Prerequisites:**
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

**Setup:**

1. **Backend & SIP Engine:**
```bash
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js SIP engine dependencies
cd sip-engine
npm install
cd ..

# Setup database
createdb sipper
alembic upgrade head

# Start both services (recommended)
./start-all.sh
```

This starts:
- **Python FastAPI backend** on `http://localhost:8000`
- **Node.js SIP Engine** on `http://localhost:5001`

**Or start services separately:**

```bash
# Terminal 1: SIP Engine
cd backend/sip-engine
npm start

# Terminal 2: FastAPI backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

2. **Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies API requests to backend.

**Important:** The SIP Engine must be running for tests to execute! The backend calls the SIP Engine via HTTP to run actual SIP protocol tests.

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
