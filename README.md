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

Create `.env` file in the project root:

```env
# Database
POSTGRES_USER=sipper
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=sipper_db

# Backend API
DATABASE_URL=postgresql+asyncpg://sipper:your_secure_password@db:5432/sipper_db
JWT_SECRET=your_jwt_secret_key_min_32_characters_long
ENCRYPTION_KEY=your_encryption_key_32_chars_minimum

# Optional
API_HOST=0.0.0.0
API_PORT=8000
```

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
- ✅ WebSocket real-time test monitoring
- ✅ Telnyx SIP trunk integration
- ✅ Test history and result analytics
- ✅ Docker-ready deployment

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
```

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
