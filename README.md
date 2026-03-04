# SIPPER 🍹

**SIP Protocol Testing & Monitoring Platform**

SIPPER is a comprehensive SIP (Session Initiation Protocol) testing tool designed for telecommunications engineers, QA teams, and DevOps professionals. Test SIP infrastructure, monitor call quality, and automate SIP endpoint validation with ease.

[![CI/CD](https://github.com/danilo-smaldone/sipper/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/danilo-smaldone/sipper/actions)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://github.com/danilo-smaldone/sipper/pkgs/container/sipper)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🎯 Features

### Core SIP Testing
- **Registration Testing**: Validate SIP registration with any SIP server
- **Call Flow Testing**: Test INVITE, BYE, ACK, and full call flows
- **Audio Quality**: RTP stream analysis and MOS score calculation
- **Transport Protocols**: Support for UDP, TCP, TLS, and WebSocket
- **Authentication**: Digest authentication (MD5, SHA-256)

### Advanced Capabilities
- **Concurrent Call Testing**: Load testing with configurable call rates
- **Custom SIP Scenarios**: Script complex call flows
- **Real-time Monitoring**: Live dashboard with call metrics
- **Historical Analytics**: PostgreSQL-backed call data storage
- **API-First Design**: RESTful API for automation and integration
- **Telnyx Integration**: Native support for Telnyx SIP connections

### Developer Experience
- **One-Command Deployment**: `docker-compose up` and you're running
- **Web UI**: Modern React-based interface
- **API Documentation**: Interactive Swagger/OpenAPI docs
- **Detailed Logging**: Structured logging with configurable levels
- **Health Checks**: Built-in health endpoints for orchestration

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      SIPPER                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐          ┌──────────────┐           │
│  │   Frontend   │          │   Backend    │           │
│  │  (React/TS)  │◄────────►│ (FastAPI/Py) │           │
│  └──────────────┘          └──────┬───────┘           │
│       Nginx                       │                    │
│                                   │                    │
│                          ┌────────▼────────┐           │
│                          │   PostgreSQL    │           │
│                          │   (Call Data)   │           │
│                          └─────────────────┘           │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           │
                           │ SIP (UDP/TCP/TLS)
                           ▼
                    ┌──────────────┐
                    │  SIP Server  │
                    │ (PBX/Trunk)  │
                    └──────────────┘
```

### Technology Stack
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, pjsua2
- **Frontend**: React 18, TypeScript, TailwindCSS, Recharts
- **Database**: PostgreSQL 16
- **Deployment**: Docker, Docker Compose
- **CI/CD**: GitHub Actions → GitHub Container Registry

---

## 🚀 Quick Start

### Prerequisites
- Docker 24.0+
- Docker Compose 2.20+
- 2GB RAM minimum
- Ports 8000, 5060, 5432 available

### 1. Clone the Repository
```bash
git clone https://github.com/danilo-smaldone/sipper.git
cd sipper
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your SIP server details and passwords
nano .env
```

**Required configuration:**
- `DB_PASSWORD`: Secure database password
- `SECRET_KEY`: Application secret (min 32 chars)
- `SIP_SERVER`: Your SIP server address
- `SIP_PORT`: SIP server port (default: 5060)

### 3. Launch SIPPER
```bash
docker-compose up -d
```

### 4. Access the Application
- **Web UI**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### 5. Run Your First Test
```bash
# Via API
curl -X POST http://localhost:8000/api/v1/tests/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass",
    "domain": "sip.example.com"
  }'
```

---

## 📖 Configuration Guide

### Environment Variables

See [`.env.example`](.env.example) for all available options.

**Critical Settings:**

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_PASSWORD` | PostgreSQL password | ✅ | - |
| `SECRET_KEY` | App secret key | ✅ | - |
| `SIP_SERVER` | Target SIP server | ✅ | - |
| `SIP_PORT` | SIP port | ❌ | 5060 |
| `SIP_TRANSPORT` | UDP/TCP/TLS | ❌ | UDP |
| `TELNYX_API_KEY` | Telnyx API key | ❌ | - |

### Database Configuration

SIPPER uses PostgreSQL for persistent storage:
- **Call history**: All test results and metrics
- **User settings**: Test configurations and profiles
- **Analytics data**: Aggregated statistics

**Backup recommendation**: Schedule daily backups of the `postgres_data` volume.

### SIP Transport Security

For TLS/SRTP:
1. Set `SIP_TRANSPORT=TLS`
2. Mount certificates in `docker-compose.yml`:
   ```yaml
   volumes:
     - ./certs:/app/certs:ro
   ```
3. Update `.env` with certificate paths

---

## 🔌 API Documentation

### Interactive Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Test Management
- `POST /api/v1/tests/register` - Run registration test
- `POST /api/v1/tests/call` - Execute call test
- `GET /api/v1/tests/{test_id}` - Retrieve test results
- `GET /api/v1/tests` - List all tests

#### Monitoring
- `GET /api/v1/metrics/summary` - Get test statistics
- `GET /api/v1/metrics/quality` - Audio quality metrics
- `GET /health` - Health check

#### Configuration
- `GET /api/v1/config` - Get current configuration
- `PUT /api/v1/config` - Update configuration

### Authentication
API uses JWT tokens. Obtain token via:
```bash
curl -X POST http://localhost:8000/api/v1/auth/token \
  -d "username=admin&password=yourpassword"
```

---

## 🔄 Version & Release Strategy

SIPPER follows **semantic versioning** (SemVer 2.0.0):

### Version Alignment
All version identifiers are synchronized:
- `VERSION` file
- `package.json` (frontend)
- `pyproject.toml` (backend)
- Docker image tags
- GitHub releases

### Release Process
1. **Update VERSION file**: `echo "0.2.0" > VERSION`
2. **Update package files**: Sync `package.json` and `pyproject.toml`
3. **Commit**: `git commit -am "Bump version to 0.2.0"`
4. **Tag**: `git tag -a v0.2.0 -m "Release v0.2.0"`
5. **Push**: `git push && git push --tags`
6. **Automated**:
   - GitHub Actions builds Docker image
   - Tags as `v0.2.0`, `0.2`, `0`, `latest`
   - Pushes to `ghcr.io/danilo-smaldone/sipper:0.2.0`
   - Creates GitHub release

### Upgrade Path
```bash
# Pull latest version
docker-compose pull

# Backup database
docker-compose exec db pg_dump -U sipper sipper > backup.sql

# Restart with new version
docker-compose up -d

# Verify
curl http://localhost:8000/health
```

---

## 🛠️ Development Guide

### Local Development Setup

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests
pytest

# Run locally
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Build
npm run build
```

### Project Structure
```
sipper/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models/              # Database models
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   ├── sip/                 # SIP protocol handling
│   └── tests/               # Backend tests
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API clients
│   │   └── utils/           # Utilities
│   └── tests/               # Frontend tests
├── .github/
│   └── workflows/           # CI/CD pipelines
├── docker-compose.yml       # Orchestration
├── Dockerfile               # Multi-stage build
├── .env.example             # Configuration template
└── VERSION                  # Source of truth for version
```

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `pytest && npm test`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open Pull Request

---

## 🗺️ Roadmap

### v0.1.0 - MVP (Current)
- [x] Basic SIP registration testing
- [x] Call flow validation
- [x] Docker deployment
- [x] REST API
- [x] Web UI (basic)

### v0.2.0 - Enhanced Testing
- [ ] Load testing (concurrent calls)
- [ ] Custom SIP scenarios
- [ ] DTMF testing
- [ ] Call recording
- [ ] Extended audio quality metrics (R-factor, jitter)

### v0.3.0 - Enterprise Features
- [ ] Multi-tenancy support
- [ ] RBAC (Role-Based Access Control)
- [ ] Scheduled test execution
- [ ] Email/Slack notifications
- [ ] Advanced analytics dashboard

### v1.0.0 - Production Ready
- [ ] High availability setup
- [ ] Horizontal scaling
- [ ] Prometheus/Grafana integration
- [ ] Compliance reporting
- [ ] Professional support tier

### Future Stages
- **WebRTC Support**: Browser-based SIP testing
- **Mobile Apps**: iOS/Android native apps
- **AI-Powered Analysis**: Automated issue detection
- **Cloud SaaS**: Hosted SIPPER platform

---

## 📊 Monitoring & Metrics

### Health Checks
```bash
# Application health
curl http://localhost:8000/health

# Database health
docker-compose exec db pg_isready
```

### Logs
```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f db

# All services
docker-compose logs -f
```

### Metrics Endpoint
Prometheus-compatible metrics at `/metrics`:
- `sipper_tests_total`: Total tests run
- `sipper_tests_success`: Successful tests
- `sipper_call_duration_seconds`: Call duration histogram
- `sipper_mos_score`: MOS score distribution

---

## 🔒 Security

### Best Practices Implemented
- ✅ No secrets in repository (use `.env`)
- ✅ Non-root Docker user
- ✅ Health checks for all services
- ✅ CORS protection
- ✅ JWT authentication
- ✅ SQL injection protection (SQLAlchemy ORM)
- ✅ Rate limiting on API endpoints

### Production Recommendations
1. **Use TLS**: Enable `SIP_TRANSPORT=TLS` for production
2. **Strong passwords**: Generate with `openssl rand -hex 32`
3. **Firewall rules**: Restrict database port (5432) to app only
4. **Regular updates**: `docker-compose pull && docker-compose up -d`
5. **Backup strategy**: Automate PostgreSQL backups
6. **Secrets management**: Use Docker secrets or vault in production

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/danilo-smaldone/sipper/issues)
- **Discussions**: [GitHub Discussions](https://github.com/danilo-smaldone/sipper/discussions)
- **Email**: danilo@telnyx.com

---

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- SIP stack powered by [PJSIP](https://www.pjsip.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Made with ❤️ for the telecom community**
