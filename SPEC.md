# SIPPER - Technical Specification

**Project:** SIPPER - SIP Testing Platform with Multi-Tenant RBAC  
**Version:** 1.0  
**Date:** 2026-03-04

---

## Technology Stack

### Backend Framework: **FastAPI (Python)**

**Rationale:**
- Native async/await support (critical for SIP testing operations)
- Automatic OpenAPI/Swagger documentation generation
- Built-in data validation with Pydantic
- High performance (comparable to Node.js)
- Excellent for API-first architectures
- Strong typing support
- Smaller learning curve for DevOps teams

### Database: **PostgreSQL 15+**

**Rationale:**
- Row-Level Security (RLS) for multi-tenant isolation
- JSONB support for flexible test result storage
- Excellent performance and reliability
- Native encryption support
- Strong ACID compliance
- pgcrypto extension for credential encryption

### ORM: **SQLAlchemy 2.0 + Alembic**

**Rationale:**
- Mature, battle-tested ORM
- Async support (asyncpg driver)
- Excellent migration tools (Alembic)
- Fine-grained query control
- Compatible with PostgreSQL RLS

### Authentication: **JWT (Access + Refresh Tokens)**

**Rationale:**
- Stateless, scalable architecture
- Access token: 15 minutes (short-lived)
- Refresh token: 7 days (httpOnly cookie)
- Easy horizontal scaling
- No session storage overhead

### Credential Encryption: **AES-256-GCM via PostgreSQL pgcrypto**

**Rationale:**
- Database-level encryption
- Encryption keys stored in environment variables
- Automatic encryption/decryption via database functions
- Auditable access logs

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### roles
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(name, organization_id)
);
```

#### permissions
```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource VARCHAR(100) NOT NULL, -- e.g., 'credentials', 'tests', 'users'
    action VARCHAR(50) NOT NULL,    -- e.g., 'create', 'read', 'update', 'delete'
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(resource, action)
);
```

#### role_permissions
```sql
CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

#### user_roles
```sql
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);
```

#### sip_credentials
```sql
CREATE TABLE sip_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sip_domain VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password_encrypted BYTEA NOT NULL, -- AES-256-GCM encrypted
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### test_runs
```sql
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    credential_id UUID REFERENCES sip_credentials(id) ON DELETE SET NULL,
    test_type VARCHAR(50) NOT NULL, -- e.g., 'registration', 'call', 'message'
    status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);
```

#### test_results
```sql
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- success, failure, warning
    message TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

### Multi-Tenant Isolation (Row-Level Security)

```sql
-- Enable RLS on all tenant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- Example policy for users table
CREATE POLICY tenant_isolation_users ON users
    USING (organization_id = current_setting('app.current_organization_id')::UUID);
```

---

## API Architecture

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user (org admin creates org)
- `POST /auth/login` - Login (returns access + refresh tokens)
- `POST /auth/logout` - Logout (invalidate refresh token)
- `POST /auth/refresh` - Refresh access token

#### Organizations
- `GET /orgs` - List organizations (admin only)
- `GET /orgs/:id` - Get organization details
- `PUT /orgs/:id` - Update organization

#### Users
- `GET /users` - List users in organization
- `GET /users/:id` - Get user details
- `POST /users` - Create user (admin only)
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/roles` - Get user roles
- `PUT /users/:id/roles` - Update user roles

#### SIP Credentials
- `GET /credentials` - List credentials
- `GET /credentials/:id` - Get credential (decrypted for authorized users)
- `POST /credentials` - Create credential
- `PUT /credentials/:id` - Update credential
- `DELETE /credentials/:id` - Delete credential

#### Tests
- `POST /tests/run` - Execute SIP test
- `GET /tests/runs` - List test runs
- `GET /tests/runs/:id` - Get test run details
- `GET /tests/results/:id` - Get test results

### Middleware Stack
1. CORS configuration
2. Request logging
3. JWT authentication
4. Organization context injection (RLS)
5. RBAC permission checking
6. Rate limiting
7. Request validation (Pydantic)
8. Error handling

---

## Security Architecture

### Authentication Flow
1. User submits email + password to `/auth/login`
2. Server validates credentials, generates:
   - Access token (JWT, 15 min expiry, contains: user_id, org_id, roles)
   - Refresh token (JWT, 7 days, stored in httpOnly cookie)
3. Client includes access token in `Authorization: Bearer <token>` header
4. On expiry, client calls `/auth/refresh` with refresh token to get new access token

### RBAC Implementation
- Decorator: `@require_permission("resource", "action")`
- Checks user's roles → role_permissions → validates against endpoint
- Example: `@require_permission("credentials", "create")`

### Credential Encryption
- Encryption key stored in environment variable: `ENCRYPTION_KEY`
- PostgreSQL function for encrypt/decrypt:
```sql
CREATE OR REPLACE FUNCTION encrypt_credential(plaintext TEXT)
RETURNS BYTEA AS $$
BEGIN
    RETURN pgp_sym_encrypt(plaintext, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

---

## Docker Setup

### Multi-Container (docker-compose)

**Services:**
1. **api** - FastAPI application
2. **db** - PostgreSQL 15
3. **redis** (future) - Token blacklist, rate limiting

### Dockerfile (API)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sipper
      POSTGRES_USER: sipper
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql+asyncpg://sipper:${DB_PASSWORD}@db:5432/sipper
      ENCRYPTION_KEY: ${ENCRYPTION_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./app:/app/app

volumes:
  postgres_data:
```

---

## Dependencies

### Python Packages (requirements.txt)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy[asyncio]==2.0.25
asyncpg==0.29.0
alembic==1.13.1
pydantic[email]==2.5.3
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
```

---

## Project Structure
```
~/Documents/projects/sipper/
├── SPEC.md                    # This file
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI app entry point
│   │   ├── config.py         # Settings (env vars)
│   │   ├── database.py       # DB connection
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   ├── auth/             # Auth logic
│   │   ├── middleware/       # RBAC, logging
│   │   └── utils/            # Helpers
│   ├── alembic/              # DB migrations
│   ├── tests/                # Pytest tests
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── README.md
```

---

## Next Steps (Implementation)
1. ✅ Create project structure
2. ⏳ Implement database models
3. ⏳ Setup authentication system
4. ⏳ Implement RBAC middleware
5. ⏳ Create API endpoints
6. ⏳ Add input validation
7. ⏳ Setup Docker environment
8. ⏳ Generate OpenAPI docs
9. ⏳ Write tests

---

**Approved:** Ready for implementation  
**Estimated Time:** 6-8 hours for core backend
