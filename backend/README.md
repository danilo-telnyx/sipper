# SIPPER Backend API

REST API for SIPPER - SIP Testing Platform with Multi-Tenant RBAC

## 🚀 Features

- ✅ **FastAPI Framework** - Modern, fast, async Python web framework
- ✅ **PostgreSQL Database** - Multi-tenant with Row-Level Security (RLS)
- ✅ **JWT Authentication** - Access + refresh token strategy
- ✅ **RBAC** - Role-Based Access Control with fine-grained permissions
- ✅ **Encrypted Credentials** - AES-256 encryption for SIP credentials
- ✅ **Async Operations** - Background task execution for SIP tests
- ✅ **OpenAPI/Swagger** - Auto-generated API documentation
- ✅ **Docker Ready** - Multi-container setup with docker-compose

## 📦 Tech Stack

- **Framework:** FastAPI 0.109.0
- **Database:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0 (async)
- **Auth:** JWT (python-jose)
- **Password Hashing:** bcrypt (passlib)
- **Encryption:** Fernet (cryptography)

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings (env vars)
│   ├── database.py          # DB connection
│   ├── models/              # SQLAlchemy models
│   │   ├── user.py
│   │   ├── organization.py
│   │   ├── role.py
│   │   ├── user_role.py
│   │   ├── sip_credential.py
│   │   └── test.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── organization.py
│   │   ├── role.py
│   │   ├── credential.py
│   │   └── test.py
│   ├── routers/             # API endpoints
│   │   ├── auth.py          # /auth/*
│   │   ├── organizations.py # /orgs/*
│   │   ├── users.py         # /users/*
│   │   ├── credentials.py   # /credentials/*
│   │   └── tests.py         # /tests/*
│   ├── auth/                # Auth logic
│   │   ├── jwt.py
│   │   ├── password.py
│   │   └── dependencies.py
│   ├── middleware/          # RBAC, logging
│   │   └── rbac.py
│   └── utils/               # Helpers
│       └── encryption.py
├── alembic/                 # DB migrations (future)
├── tests/                   # Pytest tests (future)
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

## 🔧 Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### 1. Clone & Install

```bash
cd ~/Documents/projects/sipper/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Generate Fernet encryption key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Edit .env and set:
# - JWT_SECRET (random string)
# - ENCRYPTION_KEY (output from command above)
# - DB_PASSWORD (if using Docker)
```

### 3. Run with Docker (Recommended)

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f api

# API will be available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### 4. Run Locally (Development)

```bash
# Start PostgreSQL separately
# Then run:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user + organization |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| POST | `/auth/refresh` | Refresh access token |

### Organizations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orgs` | List organizations |
| GET | `/orgs/{id}` | Get organization details |
| PUT | `/orgs/{id}` | Update organization |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users` | List users in org |
| GET | `/users/{id}` | Get user details |
| POST | `/users` | Create user |
| PUT | `/users/{id}` | Update user |
| DELETE | `/users/{id}` | Delete user |
| GET | `/users/{id}/roles` | Get user roles |
| PUT | `/users/{id}/roles` | Update user roles |

### SIP Credentials

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/credentials` | List credentials |
| GET | `/credentials/{id}` | Get credential |
| POST | `/credentials` | Create credential |
| PUT | `/credentials/{id}` | Update credential |
| DELETE | `/credentials/{id}` | Delete credential |

### Tests

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tests/run` | Execute SIP test |
| GET | `/tests/runs` | List test runs |
| GET | `/tests/runs/{id}` | Get test run details |
| GET | `/tests/results/{id}` | Get test results |

## 🔐 Security Features

### JWT Authentication
- **Access Token:** 15-minute expiry
- **Refresh Token:** 7-day expiry
- Tokens include: user_id, org_id

### Password Hashing
- bcrypt with automatic salt generation
- Secure password verification

### Credential Encryption
- AES-256 (Fernet) symmetric encryption
- Credentials encrypted at rest in database
- Decryption only on-demand for authorized users

### Multi-Tenant Isolation
- Organization-level data separation
- All queries filtered by organization_id
- PostgreSQL RLS ready (to be enabled)

## 🧪 Testing

```bash
# Run tests (future)
pytest

# Run with coverage
pytest --cov=app tests/
```

## 📖 API Documentation

Interactive API documentation is auto-generated:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

## 🛠️ Development

### Database Migrations (Alembic - Future)

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Add New Endpoint

1. Create router in `app/routers/`
2. Define schemas in `app/schemas/`
3. Add models if needed in `app/models/`
4. Register router in `app/main.py`

## 🚀 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` and `ENCRYPTION_KEY`
- [ ] Use strong database password
- [ ] Enable PostgreSQL RLS policies
- [ ] Set `echo=False` in database.py
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS
- [ ] Set up logging and monitoring
- [ ] Configure rate limiting
- [ ] Enable token blacklisting (Redis)
- [ ] Run security audit

## 📝 Implementation Notes

### Completed ✅
1. REST API framework setup (FastAPI)
2. Database models (Users, Orgs, Roles, Permissions, Credentials, Tests)
3. JWT authentication system
4. RBAC middleware structure
5. All API endpoints (auth, orgs, users, credentials, tests)
6. Input validation (Pydantic schemas)
7. OpenAPI documentation (auto-generated)
8. Docker configuration
9. Credential encryption (AES-256)
10. Multi-tenant data isolation (app-level)

### TODO 🔨
- [ ] Complete RBAC permission checking (full ORM chain)
- [ ] Add Alembic migrations
- [ ] Implement token blacklist (Redis)
- [ ] Enable PostgreSQL RLS policies
- [ ] Add comprehensive tests (pytest)
- [ ] Implement actual SIP testing logic
- [ ] Add rate limiting
- [ ] Set up logging and monitoring
- [ ] Add admin dashboard endpoints

## 📄 License

MIT

## 👥 Authors

Created by Claude (Anthropic) for SIPPER project  
Date: 2026-03-04
