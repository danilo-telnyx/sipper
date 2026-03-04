# SIPPER - SIP Testing Web Application
## Technical Specification v1.0

**Project:** SIPPER (SIP Protocol Tester)  
**Type:** Multi-tenant SaaS Web Application  
**Primary Purpose:** RFC-compliant SIP testing and validation  
**Created:** 2026-03-04

---

## 1. Executive Summary

SIPPER is a web-based SIP (Session Initiation Protocol) testing platform designed for telecom engineers, QA teams, and DevOps professionals. It provides comprehensive RFC-compliant SIP testing with multi-tenant organization support, role-based access control, and detailed test result analytics.

**Core Value Proposition:**
- Test SIP endpoints against RFC 3261 and related specifications
- Multi-user organizations with granular permissions
- Docker-native deployment (single-container or orchestrated)
- Lightweight, self-hosted, privacy-focused

---

## 2. Technology Stack

### 2.1 Backend
**Framework:** Node.js 22+ with Express.js 5.x  
**Runtime:** Node.js (LTS version)

**Rationale:**
- Excellent SIP library support (drachtio, sip.js)
- Strong async I/O for concurrent SIP sessions
- Rich npm ecosystem for testing tools
- TypeScript support for type safety

**Key Libraries:**
- `drachtio-srf` - SIP application framework
- `express` - Web framework
- `passport` - Authentication middleware
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT tokens
- `joi` - Input validation
- `winston` - Logging

### 2.2 Frontend
**Framework:** React 18+ with Vite  
**Language:** TypeScript

**UI Library:** Tailwind CSS + shadcn/ui components

**Key Libraries:**
- `react-router-dom` - Routing
- `tanstack-query` (React Query) - Data fetching/caching
- `zustand` - State management
- `axios` - HTTP client
- `recharts` - Data visualization
- `react-hook-form` - Form management
- `zod` - Schema validation

### 2.3 Database
**Primary:** SQLite 3.45+  
**ORM:** Drizzle ORM

**Rationale:**
- Zero-configuration embedded database
- Perfect for Docker single-file deployments
- ACID-compliant transactions
- Sufficient for 10k+ test results per org
- Easy backup (single file)
- Migration path to PostgreSQL if needed

**Future Scale Path:**
- SQLite: 0-50 concurrent users, <100GB data
- PostgreSQL: 50+ users, horizontal scaling needs

### 2.4 DevOps & Infrastructure
**Containerization:** Docker + Docker Compose  
**Reverse Proxy:** Traefik or Nginx (optional)  
**CI/CD:** GitHub Actions  
**Monitoring:** Prometheus + Grafana (optional)

---

## 3. System Architecture

### 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SIPPER Platform                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────┐      │
│  │              Frontend (React SPA)                  │      │
│  │  - Test Configuration UI                           │      │
│  │  - Results Dashboard                               │      │
│  │  - User/Org Management                             │      │
│  │  - Real-time Test Status (WebSocket)               │      │
│  └───────────────────┬───────────────────────────────┘      │
│                      │ HTTPS/WSS                             │
│  ┌───────────────────▼───────────────────────────────┐      │
│  │          API Layer (Express.js)                    │      │
│  │  - REST API Endpoints                              │      │
│  │  - WebSocket Server (test updates)                 │      │
│  │  - JWT Auth Middleware                             │      │
│  │  - Multi-tenant Context                            │      │
│  └───────────────────┬───────────────────────────────┘      │
│                      │                                        │
│  ┌───────────────────▼───────────────────────────────┐      │
│  │         Business Logic Layer                       │      │
│  │  - Test Orchestration                              │      │
│  │  - RBAC Enforcement                                │      │
│  │  - Audit Logging                                   │      │
│  └───────────┬──────────────────┬────────────────────┘      │
│              │                  │                             │
│  ┌───────────▼─────────┐  ┌────▼──────────────────────┐     │
│  │   SIP Test Engine    │  │   Data Access Layer       │     │
│  │  - RFC 3261 Tests    │  │   (Drizzle ORM)           │     │
│  │  - Call Scenarios    │  └────┬──────────────────────┘     │
│  │  - Protocol Validator│       │                             │
│  │  - Result Aggregator │       │                             │
│  └───────────┬──────────┘  ┌────▼──────────────────────┐     │
│              │             │   SQLite Database          │     │
│              │             │  - users, orgs, tests      │     │
│              │             │  - sip_credentials         │     │
│              │             │  - test_results            │     │
│              │             └────────────────────────────┘     │
│              │                                                 │
│              ▼                                                 │
│      ┌──────────────┐                                         │
│      │  SIP Network │  ◄──── Test Target (SIP Server)        │
│      │  (Drachtio)  │                                         │
│      └──────────────┘                                         │
│                                                                │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Component Responsibilities

**Frontend (React SPA):**
- User authentication interface
- Test configuration wizard
- Real-time test execution monitoring
- Results visualization and export
- Organization/user management (admin)

**API Layer:**
- REST endpoints for CRUD operations
- WebSocket for real-time test updates
- JWT-based authentication
- Request validation
- Multi-tenant context isolation

**Business Logic:**
- Test orchestration and scheduling
- RBAC permission checks
- Audit trail generation
- Data aggregation and reporting

**SIP Test Engine:**
- SIP transaction execution (drachtio)
- RFC compliance validation
- Call flow simulation
- Protocol-level analysis
- Result capture and storage

**Data Access Layer:**
- ORM-based database operations
- Transaction management
- Query optimization
- Migration management

---

## 4. Database Schema

### 4.1 Schema Design (Drizzle ORM TypeScript)

```typescript
// users table
{
  id: uuid PRIMARY KEY,
  email: varchar(255) UNIQUE NOT NULL,
  password_hash: varchar(255) NOT NULL,
  full_name: varchar(255) NOT NULL,
  organization_id: uuid FOREIGN KEY -> organizations(id),
  role: enum('admin', 'org_admin', 'tester', 'viewer'),
  is_active: boolean DEFAULT true,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now(),
  last_login_at: timestamp NULL
}

// organizations table
{
  id: uuid PRIMARY KEY,
  name: varchar(255) UNIQUE NOT NULL,
  slug: varchar(100) UNIQUE NOT NULL,
  subscription_tier: enum('free', 'pro', 'enterprise'),
  max_users: integer DEFAULT 5,
  max_sip_credentials: integer DEFAULT 10,
  is_active: boolean DEFAULT true,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
}

// sip_credentials table
{
  id: uuid PRIMARY KEY,
  organization_id: uuid FOREIGN KEY -> organizations(id),
  created_by_user_id: uuid FOREIGN KEY -> users(id),
  name: varchar(255) NOT NULL,
  sip_server: varchar(255) NOT NULL,
  sip_port: integer DEFAULT 5060,
  transport: enum('udp', 'tcp', 'tls', 'ws', 'wss'),
  username: varchar(255) NOT NULL,
  password: varchar(255) NOT NULL (encrypted),
  from_uri: varchar(255),
  contact_uri: varchar(255),
  realm: varchar(255),
  is_active: boolean DEFAULT true,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now(),
  UNIQUE(organization_id, name)
}

// test_suites table
{
  id: uuid PRIMARY KEY,
  organization_id: uuid FOREIGN KEY -> organizations(id),
  created_by_user_id: uuid FOREIGN KEY -> users(id),
  name: varchar(255) NOT NULL,
  description: text,
  test_type: enum('registration', 'call_flow', 'options', 'invite', 'custom'),
  config: jsonb NOT NULL, // Test-specific configuration
  is_active: boolean DEFAULT true,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
}

// test_runs table
{
  id: uuid PRIMARY KEY,
  test_suite_id: uuid FOREIGN KEY -> test_suites(id),
  sip_credential_id: uuid FOREIGN KEY -> sip_credentials(id),
  started_by_user_id: uuid FOREIGN KEY -> users(id),
  status: enum('pending', 'running', 'completed', 'failed', 'cancelled'),
  started_at: timestamp DEFAULT now(),
  completed_at: timestamp NULL,
  duration_ms: integer NULL,
  result_summary: jsonb,
  created_at: timestamp DEFAULT now()
}

// test_results table
{
  id: uuid PRIMARY KEY,
  test_run_id: uuid FOREIGN KEY -> test_runs(id),
  test_name: varchar(255) NOT NULL,
  test_category: varchar(100), // RFC section, e.g., "RFC3261-8.1.1"
  status: enum('passed', 'failed', 'skipped', 'error'),
  expected_behavior: text,
  actual_behavior: text,
  sip_messages: jsonb, // Array of SIP message objects
  error_details: text NULL,
  duration_ms: integer,
  created_at: timestamp DEFAULT now()
}

// permissions table (RBAC matrix)
{
  id: uuid PRIMARY KEY,
  role: enum('admin', 'org_admin', 'tester', 'viewer'),
  resource: varchar(100), // 'test_suite', 'sip_credential', 'user', etc.
  action: enum('create', 'read', 'update', 'delete', 'execute'),
  allowed: boolean DEFAULT true,
  created_at: timestamp DEFAULT now()
}

// audit_logs table
{
  id: uuid PRIMARY KEY,
  organization_id: uuid FOREIGN KEY -> organizations(id),
  user_id: uuid FOREIGN KEY -> users(id),
  action: varchar(100), // 'test.run', 'credential.create', etc.
  resource_type: varchar(100),
  resource_id: uuid,
  details: jsonb,
  ip_address: varchar(45),
  user_agent: text,
  created_at: timestamp DEFAULT now()
}

// api_keys table (optional, for API access)
{
  id: uuid PRIMARY KEY,
  organization_id: uuid FOREIGN KEY -> organizations(id),
  created_by_user_id: uuid FOREIGN KEY -> users(id),
  name: varchar(255),
  key_hash: varchar(255) UNIQUE NOT NULL,
  key_prefix: varchar(10), // First 8 chars for identification
  scopes: jsonb, // Array of allowed permissions
  last_used_at: timestamp NULL,
  expires_at: timestamp NULL,
  is_active: boolean DEFAULT true,
  created_at: timestamp DEFAULT now()
}
```

### 4.2 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_org_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sip_creds_org_id ON sip_credentials(organization_id);
CREATE INDEX idx_test_runs_suite_id ON test_runs(test_suite_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_results_run_id ON test_results(test_run_id);
CREATE INDEX idx_test_results_status ON test_results(status);
CREATE INDEX idx_audit_logs_org_user ON audit_logs(organization_id, user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## 5. RBAC Permission Model

### 5.1 Roles

| Role | Scope | Description |
|------|-------|-------------|
| **admin** | Platform-wide | System administrator, can manage all organizations |
| **org_admin** | Organization | Can manage users, credentials, and all tests within their org |
| **tester** | Organization | Can create and run tests, manage own credentials |
| **viewer** | Organization | Read-only access to test results and credentials |

### 5.2 Permission Matrix

| Resource | admin | org_admin | tester | viewer |
|----------|-------|-----------|--------|--------|
| **Users** |
| Create user | ✓ | ✓ (own org) | ✗ | ✗ |
| Read users | ✓ | ✓ (own org) | ✗ | ✗ |
| Update user | ✓ | ✓ (own org) | ✓ (self) | ✓ (self) |
| Delete user | ✓ | ✓ (own org) | ✗ | ✗ |
| **Organizations** |
| Create org | ✓ | ✗ | ✗ | ✗ |
| Read org | ✓ | ✓ (own) | ✓ (own) | ✓ (own) |
| Update org | ✓ | ✓ (own) | ✗ | ✗ |
| Delete org | ✓ | ✗ | ✗ | ✗ |
| **SIP Credentials** |
| Create | ✓ | ✓ | ✓ | ✗ |
| Read | ✓ | ✓ | ✓ (own + shared) | ✓ (shared) |
| Update | ✓ | ✓ | ✓ (own) | ✗ |
| Delete | ✓ | ✓ | ✓ (own) | ✗ |
| **Test Suites** |
| Create | ✓ | ✓ | ✓ | ✗ |
| Read | ✓ | ✓ | ✓ | ✓ |
| Update | ✓ | ✓ | ✓ (own) | ✗ |
| Delete | ✓ | ✓ | ✓ (own) | ✗ |
| Execute | ✓ | ✓ | ✓ | ✗ |
| **Test Results** |
| Read | ✓ | ✓ | ✓ | ✓ |
| Delete | ✓ | ✓ | ✗ | ✗ |
| **Audit Logs** |
| Read | ✓ | ✓ (own org) | ✗ | ✗ |

### 5.3 Middleware Implementation

```javascript
// Example RBAC middleware (pseudo-code)
function requirePermission(resource, action) {
  return async (req, res, next) => {
    const { user } = req;
    const { organizationId } = req.params;
    
    // Check if user belongs to organization
    if (user.role !== 'admin' && user.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    // Check permission matrix
    const hasPermission = await checkPermission(
      user.role,
      resource,
      action,
      organizationId
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}
```

---

## 6. API Endpoint Design

### 6.1 Authentication Endpoints

```
POST   /api/v1/auth/register         - Register new organization + admin user
POST   /api/v1/auth/login            - Login (returns JWT)
POST   /api/v1/auth/logout           - Logout (invalidate token)
POST   /api/v1/auth/refresh          - Refresh JWT token
POST   /api/v1/auth/forgot-password  - Request password reset
POST   /api/v1/auth/reset-password   - Reset password with token
GET    /api/v1/auth/me               - Get current user profile
```

### 6.2 Organization Endpoints

```
GET    /api/v1/organizations          - List organizations (admin only)
POST   /api/v1/organizations          - Create organization (admin only)
GET    /api/v1/organizations/:id      - Get organization details
PATCH  /api/v1/organizations/:id      - Update organization
DELETE /api/v1/organizations/:id      - Delete organization (admin only)
GET    /api/v1/organizations/:id/stats - Get org statistics
```

### 6.3 User Management Endpoints

```
GET    /api/v1/organizations/:orgId/users       - List users in org
POST   /api/v1/organizations/:orgId/users       - Create user (invite)
GET    /api/v1/organizations/:orgId/users/:id   - Get user details
PATCH  /api/v1/organizations/:orgId/users/:id   - Update user
DELETE /api/v1/organizations/:orgId/users/:id   - Delete user
PATCH  /api/v1/organizations/:orgId/users/:id/role - Change user role
```

### 6.4 SIP Credentials Endpoints

```
GET    /api/v1/organizations/:orgId/credentials       - List SIP credentials
POST   /api/v1/organizations/:orgId/credentials       - Create credential
GET    /api/v1/organizations/:orgId/credentials/:id   - Get credential
PATCH  /api/v1/organizations/:orgId/credentials/:id   - Update credential
DELETE /api/v1/organizations/:orgId/credentials/:id   - Delete credential
POST   /api/v1/organizations/:orgId/credentials/:id/test - Test credential (quick REGISTER)
```

### 6.5 Test Suite Endpoints

```
GET    /api/v1/organizations/:orgId/test-suites       - List test suites
POST   /api/v1/organizations/:orgId/test-suites       - Create test suite
GET    /api/v1/organizations/:orgId/test-suites/:id   - Get test suite
PATCH  /api/v1/organizations/:orgId/test-suites/:id   - Update test suite
DELETE /api/v1/organizations/:orgId/test-suites/:id   - Delete test suite
GET    /api/v1/test-suites/templates                  - List RFC-based templates
```

### 6.6 Test Execution Endpoints

```
POST   /api/v1/test-suites/:suiteId/run               - Execute test suite
GET    /api/v1/test-runs/:runId                       - Get test run status
POST   /api/v1/test-runs/:runId/cancel                - Cancel running test
GET    /api/v1/test-runs/:runId/results               - Get detailed results
GET    /api/v1/test-runs/:runId/logs                  - Get execution logs
GET    /api/v1/test-runs/:runId/export                - Export results (JSON/PDF)
```

### 6.7 Results & Analytics Endpoints

```
GET    /api/v1/organizations/:orgId/test-runs         - List test runs (paginated)
GET    /api/v1/organizations/:orgId/results/summary   - Aggregate statistics
GET    /api/v1/organizations/:orgId/results/trends    - Historical trends
GET    /api/v1/test-results/:resultId                 - Get specific test result
```

### 6.8 Audit & Admin Endpoints

```
GET    /api/v1/organizations/:orgId/audit-logs        - List audit logs
GET    /api/v1/admin/health                           - System health check
GET    /api/v1/admin/metrics                          - Platform metrics (admin)
```

### 6.9 WebSocket Events

```
WS     /ws/test-runs/:runId                           - Real-time test updates

Events:
- test.started { runId, timestamp }
- test.progress { runId, completed, total, currentTest }
- test.result { runId, testName, status, duration }
- test.completed { runId, summary, duration }
- test.failed { runId, error }
```

---

## 7. RFC Coverage Scope

### 7.1 Primary RFC: 3261 (SIP Core)

**Test Categories:**

1. **Registration (RFC 3261 §10)**
   - Basic REGISTER transaction
   - Registration refresh
   - Third-party registration
   - Registration removal (Expires: 0)
   - Contact header validation
   - Authentication challenge handling (401/407)

2. **Session Establishment (RFC 3261 §13)**
   - Basic INVITE transaction
   - Early media handling (183 Session Progress)
   - Call forwarding (3xx responses)
   - Call rejection scenarios (4xx/5xx)
   - ACK handling (2xx vs non-2xx)
   - CANCEL during INVITE transaction

3. **Session Modification (RFC 3261 §14)**
   - Re-INVITE for session updates
   - UPDATE method support (RFC 3311)
   - Session timer refresh (RFC 4028)

4. **Session Termination (RFC 3261 §15)**
   - BYE transaction
   - Proper call-id/tag matching
   - Mid-dialog request routing

5. **SIP Methods (RFC 3261 §7.1)**
   - OPTIONS (capability discovery)
   - SUBSCRIBE/NOTIFY (RFC 6665)
   - MESSAGE (RFC 3428)
   - INFO (RFC 6086)
   - REFER (RFC 3515)

6. **Header Validation**
   - Mandatory headers (Via, From, To, Call-ID, CSeq)
   - Route/Record-Route processing
   - Contact header handling
   - Authorization/Proxy-Authorization

7. **Transaction Layer (RFC 3261 §17)**
   - INVITE client transaction (ICT)
   - Non-INVITE client transaction (NICT)
   - Transaction timeout handling (Timer A, B, D, etc.)
   - Retransmission logic

8. **Transport (RFC 3261 §18)**
   - UDP transport
   - TCP transport
   - TLS transport (RFC 3261 §26.2)
   - WebSocket transport (RFC 7118)

### 7.2 Extended RFC Coverage

| RFC | Title | Priority |
|-----|-------|----------|
| RFC 3262 | PRACK (Provisional Response ACK) | High |
| RFC 3263 | SIP DNS Procedures | Medium |
| RFC 3264 | Offer/Answer Model with SDP | High |
| RFC 3265 | SIP Events (SUBSCRIBE/NOTIFY) | Medium |
| RFC 3311 | UPDATE Method | Medium |
| RFC 3323 | Privacy Mechanism | Low |
| RFC 3428 | MESSAGE Method | High |
| RFC 3515 | REFER Method | Medium |
| RFC 3581 | Symmetric Response Routing | Medium |
| RFC 3891 | Replaces Header | Low |
| RFC 4028 | Session Timers | High |
| RFC 4320 | Non-INVITE Transaction Fixes | Medium |
| RFC 5626 | Client-Initiated Connections (Outbound) | Medium |
| RFC 6665 | SIP Events (obsoletes 3265) | Medium |
| RFC 7118 | WebSocket Transport | High |

### 7.3 Test Scenario Templates

**Template 1: Basic Registration Test**
```yaml
name: "RFC3261-10.1 - Basic Registration"
steps:
  - send: REGISTER
    expect_response: [401, 407]
  - send: REGISTER (with auth)
    expect_response: 200
    validate:
      - header: Contact
        contains: sip_credential.contact_uri
      - header: Expires
        range: [3600, 7200]
```

**Template 2: INVITE Call Flow**
```yaml
name: "RFC3261-13.2 - Basic Call Setup"
steps:
  - send: INVITE (with SDP)
    expect_response: [100, 180, 183]
  - expect_response: 200
    validate:
      - header: Contact
      - sdp: present
  - send: ACK
  - wait: 5s
  - send: BYE
    expect_response: 200
```

---

## 8. Security Model

### 8.1 Authentication & Authorization

**User Authentication:**
- Bcrypt password hashing (cost factor: 12)
- JWT tokens (HS256 or RS256)
  - Access token: 15-minute expiry
  - Refresh token: 7-day expiry
- HTTP-only cookies for token storage (frontend)
- CSRF protection for state-changing operations

**API Key Authentication:**
- SHA-256 hashed keys stored in database
- Prefix-based key identification (e.g., `sip_live_abc123...`)
- Scoped permissions per key
- Rate limiting per key

### 8.2 Multi-Tenant Isolation

**Database-Level:**
- All queries filtered by `organization_id`
- Row-level security (RLS) enforcement
- Foreign key constraints prevent cross-org access

**Application-Level:**
- Middleware injects organization context from JWT
- All database queries include organization filter
- API endpoints validate organization ownership

**Example Isolation:**
```javascript
// Middleware
app.use((req, res, next) => {
  req.organizationId = req.user.organization_id;
  next();
});

// Controller
async function getCredentials(req, res) {
  const credentials = await db
    .select()
    .from(sipCredentials)
    .where(eq(sipCredentials.organization_id, req.organizationId));
  // ^^^ organization_id always filtered
}
```

### 8.3 SIP Credential Security

**Storage:**
- SIP passwords encrypted at rest (AES-256-GCM)
- Encryption key stored in environment variable (not in DB)
- Key rotation supported

**Access Control:**
- Credentials marked as "shared" or "private"
- Private credentials only accessible by creator + org_admins
- Audit log for all credential access

### 8.4 Network Security

**Container Security:**
- Non-root user in Docker container
- Read-only root filesystem (where possible)
- No privileged mode required
- Minimal base image (Alpine Linux)

**TLS/SSL:**
- HTTPS enforced for web interface
- TLS 1.2+ only (no SSLv3, TLS 1.0/1.1)
- Strong cipher suites
- HSTS headers

**Rate Limiting:**
- API: 100 requests/minute per user
- Authentication: 5 failed attempts → 15-minute lockout
- Test execution: 10 concurrent tests per organization

### 8.5 Input Validation

- All inputs validated with Joi/Zod schemas
- SIP URI validation
- SQL injection prevention (parameterized queries via ORM)
- XSS prevention (output encoding)
- Command injection prevention (no shell execution of user input)

### 8.6 Audit Logging

**Logged Events:**
- Authentication (login, logout, failed attempts)
- User management (create, update, delete)
- Credential access (view, create, update, delete)
- Test execution (start, complete, fail)
- Permission changes
- Organization settings changes

**Log Retention:**
- 90 days default
- Configurable per organization
- Exportable for compliance

---

## 9. Docker Deployment

### 9.1 Dockerfile

```dockerfile
# Multi-stage build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --production=false

# Copy source
COPY . .

# Build frontend and backend
RUN npm run build:frontend
RUN npm run build:backend

# Production image
FROM node:22-alpine

RUN addgroup -g 1001 -S sipper && \
    adduser -u 1001 -S sipper -G sipper

WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R sipper:sipper /app

USER sipper

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]
```

### 9.2 Docker Compose

```yaml
version: '3.9'

services:
  sipper:
    build: .
    container_name: sipper-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/app/data/sipper.db
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - PORT=3000
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - sipper-net
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: sipper-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - sipper
    networks:
      - sipper-net
    restart: unless-stopped

networks:
  sipper-net:
    driver: bridge

volumes:
  sipper-data:
```

### 9.3 Environment Variables

```bash
# .env.example
NODE_ENV=production
PORT=3000

# Database
DATABASE_PATH=/app/data/sipper.db

# Security
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
ENCRYPTION_KEY=<generate-with-openssl-rand-base64-32>

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# SIP
SIP_LISTEN_PORT=5060
SIP_PUBLIC_IP=auto

# Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<set-strong-password>

# Optional: External Services
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

---

## 10. Version & Release Strategy

### 10.1 Versioning Scheme

**Semantic Versioning (SemVer):** `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes (e.g., API redesign, database schema incompatibility)
- **MINOR:** New features, backward-compatible
- **PATCH:** Bug fixes, security patches

**Example:**
- `v1.0.0` - Initial release
- `v1.1.0` - Add WebSocket support for real-time updates
- `v1.1.1` - Fix INVITE retransmission bug
- `v2.0.0` - Migrate from SQLite to PostgreSQL (breaking change)

### 10.2 Release Channels

| Channel | Purpose | Update Frequency | Stability |
|---------|---------|------------------|-----------|
| **stable** | Production deployments | Monthly | High |
| **beta** | Pre-release testing | Weekly | Medium |
| **nightly** | Latest features | Daily | Low |

**Docker Tags:**
- `sipper:latest` → latest stable release
- `sipper:1.2.3` → specific version
- `sipper:beta` → latest beta
- `sipper:nightly` → development branch

### 10.3 Database Migrations

**Migration Tool:** Drizzle Kit

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Rollback (if needed)
npm run db:rollback
```

**Migration Policy:**
- All migrations in `migrations/` directory
- Migrations run automatically on container start (production)
- Migration failures prevent app startup
- Backup database before MAJOR version upgrades

### 10.4 Release Checklist

**Pre-Release:**
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scan completed (npm audit, Snyk)
- [ ] Changelog updated
- [ ] Database migrations tested (up + down)
- [ ] Docker image built and tagged
- [ ] Documentation updated

**Release:**
- [ ] Git tag created (`git tag v1.2.3`)
- [ ] Docker image pushed to registry
- [ ] GitHub release created with changelog
- [ ] Update documentation site

**Post-Release:**
- [ ] Monitor error logs for 24 hours
- [ ] Verify no critical bugs reported
- [ ] Update version in README

### 10.5 Backward Compatibility

**API Versioning:**
- All endpoints prefixed with `/api/v1/`
- New major API version when breaking changes needed
- Old API version supported for 6 months after deprecation

**Database Schema:**
- Add columns: backward-compatible
- Remove columns: requires MAJOR version bump
- Rename columns: provide migration + deprecation notice

---

## 11. Development Workflow

### 11.1 Project Structure

```
sipper/
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   └── api/           # API client
│   ├── public/
│   └── package.json
├── backend/               # Node.js API
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database schema (Drizzle)
│   │   ├── middleware/    # Auth, RBAC, etc.
│   │   ├── sip/           # SIP test engine
│   │   └── server.ts      # Express app
│   └── package.json
├── migrations/            # Database migrations
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                  # Documentation
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── package.json           # Root package.json (workspace)
├── README.md
└── SPEC.md               # This file
```

### 11.2 Development Commands

```bash
# Install dependencies
npm install

# Run development servers
npm run dev              # Start both frontend + backend (concurrently)
npm run dev:frontend     # Vite dev server (port 5173)
npm run dev:backend      # Node backend (port 3000)

# Build for production
npm run build            # Build frontend + backend
npm run build:frontend   # Build React SPA
npm run build:backend    # Build Node API (TypeScript)

# Database
npm run db:generate      # Generate migration
npm run db:migrate       # Apply migrations
npm run db:studio        # Open Drizzle Studio (DB GUI)

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests

# Linting & Formatting
npm run lint             # ESLint
npm run format           # Prettier

# Docker
docker-compose up -d     # Start all services
docker-compose logs -f   # View logs
docker-compose down      # Stop services
```

---

## 12. Testing Strategy

### 12.1 Unit Tests
- Test pure functions (validators, parsers)
- Test SIP message builders
- Test RBAC permission logic
- Coverage target: >80%

### 12.2 Integration Tests
- Test API endpoints with test database
- Test SIP transaction flows
- Test database queries
- Use supertest for HTTP testing

### 12.3 End-to-End Tests
- Playwright for frontend testing
- Full user workflows (login → create test → execute → view results)
- Test across browsers (Chrome, Firefox)

### 12.4 SIP Testing
- Use SIPp for SIP server simulation
- Test against known good/bad SIP implementations
- RFC compliance validation

---

## 13. Future Enhancements (Roadmap)

**Phase 1 (MVP - v1.0):**
- Basic registration and call flow tests
- Single-org, multi-user support
- SQLite database
- Docker deployment

**Phase 2 (v1.1-1.5):**
- Extended RFC coverage (3262, 3311, 4028)
- Test scheduling (cron-like)
- Email notifications
- Export to PDF/CSV
- API key authentication

**Phase 3 (v2.0+):**
- PostgreSQL support for scaling
- Multi-region test execution
- Load testing capabilities (concurrent calls)
- Webhook integrations
- CI/CD pipeline integration (GitHub Actions, GitLab CI)
- Grafana dashboards

**Phase 4 (v3.0+):**
- Distributed test execution (test agents)
- Advanced SIP scenarios (call transfer, conferencing)
- RTP/SRTP media analysis
- WebRTC testing support

---

## 14. Dependencies

### 14.1 Backend Dependencies

```json
{
  "dependencies": {
    "express": "^5.0.0",
    "drachtio-srf": "^4.5.0",
    "drizzle-orm": "^0.30.0",
    "better-sqlite3": "^9.4.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "joi": "^17.12.0",
    "winston": "^3.11.0",
    "express-rate-limit": "^7.1.5",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "ws": "^8.16.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "vitest": "^1.2.0",
    "supertest": "^6.3.4",
    "drizzle-kit": "^0.20.0"
  }
}
```

### 14.2 Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "recharts": "^2.10.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0",
    "typescript": "^5.3.3",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## 15. Non-Functional Requirements

### 15.1 Performance
- API response time: <200ms (95th percentile)
- Test execution start: <2 seconds
- Support 100+ concurrent users per instance
- Database query optimization (indexes, caching)

### 15.2 Scalability
- Horizontal scaling via load balancer (future)
- SQLite suitable for <50 users per instance
- Migration path to PostgreSQL documented

### 15.3 Reliability
- 99% uptime target
- Automatic container restart on failure
- Graceful shutdown (drain connections)
- Database backups (daily recommended)

### 15.4 Usability
- Mobile-responsive UI
- Dark mode support
- Keyboard shortcuts for power users
- Comprehensive documentation

### 15.5 Maintainability
- TypeScript for type safety
- ESLint + Prettier for code quality
- Automated tests in CI/CD
- Clear contribution guidelines

---

## 16. Success Metrics

**User Engagement:**
- Active users per week
- Average tests executed per user
- Test suite creation rate

**Technical:**
- API error rate (<1%)
- Test execution success rate (>95%)
- Average test duration
- Container resource usage (CPU, memory)

**Business:**
- Organization sign-ups
- User retention (30-day, 90-day)
- Feature adoption rates

---

## Appendix A: Glossary

- **SIP:** Session Initiation Protocol (RFC 3261)
- **SDP:** Session Description Protocol (RFC 4566)
- **UA:** User Agent (SIP client or server)
- **UAC:** User Agent Client (initiates requests)
- **UAS:** User Agent Server (responds to requests)
- **INVITE:** SIP method to establish sessions
- **REGISTER:** SIP method for registration
- **ACK:** Acknowledgment for 2xx INVITE responses
- **BYE:** SIP method to terminate sessions
- **RBAC:** Role-Based Access Control
- **JWT:** JSON Web Token
- **CSRF:** Cross-Site Request Forgery
- **XSS:** Cross-Site Scripting
- **ORM:** Object-Relational Mapping

---

## Appendix B: References

- [RFC 3261 - SIP: Session Initiation Protocol](https://www.rfc-editor.org/rfc/rfc3261)
- [RFC 3264 - Offer/Answer Model with SDP](https://www.rfc-editor.org/rfc/rfc3264)
- [Drachtio Documentation](https://drachtio.org/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-04  
**Author:** AI Agent (Clawdbot)  
**Status:** Draft for Review

