# SIPPER Deployment Guide

## 🚀 Deployment Instructions

### Repository
- **GitHub:** https://github.com/danilo-telnyx/sipper
- **Release:** v0.1.0
- **Docker Image:** ghcr.io/danilo-telnyx/sipper:0.1.0

---

## 📦 Quick Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/danilo-telnyx/sipper.git
cd sipper

# Configure environment
cp .env.example .env
nano .env  # Edit with your configuration

# Required: Set these in .env
# - DB_PASSWORD (secure password for PostgreSQL)
# - SECRET_KEY (min 32 characters for JWT)
# - SIP_SERVER (your SIP server address)

# Launch all services
docker-compose up -d

# Verify deployment
docker-compose ps
curl http://localhost:8000/health

# View logs
docker-compose logs -f app
```

**Access:**
- Web UI: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

---

### Option 2: Pull Docker Image Directly

```bash
# Pull the image
docker pull ghcr.io/danilo-telnyx/sipper:0.1.0

# Run with environment variables
docker run -d \
  --name sipper \
  -p 8000:8000 \
  -p 5060:5060/udp \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-db-password \
  -e SECRET_KEY=your-secret-key \
  -e SIP_SERVER=sip.example.com \
  ghcr.io/danilo-telnyx/sipper:0.1.0
```

---

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `my_secure_pass_123` |
| `SECRET_KEY` | JWT secret (32+ chars) | `your_32_char_secret_key_here` |
| `SIP_SERVER` | Target SIP server | `sip.example.com` |

### Optional Variables

See `.env.example` for full list:
- `SIP_PORT`: SIP port (default: 5060)
- `SIP_TRANSPORT`: UDP/TCP/TLS (default: UDP)
- `TELNYX_API_KEY`: Telnyx integration (optional)
- `LOG_LEVEL`: Logging level (default: info)

---

## 🔄 CI/CD Pipeline

The repository includes automated CI/CD via GitHub Actions:

### Triggers
- **Push to main:** Builds and pushes `latest` tag
- **Tag push (v*):** Builds versioned release

### Workflow Steps
1. Run backend tests (pytest)
2. Run frontend tests (npm test)
3. Build multi-platform Docker image (amd64, arm64)
4. Push to GitHub Container Registry (ghcr.io)
5. Create GitHub release (on version tag)

### Version Alignment
All versions are synchronized:
- `VERSION` file
- `package.json`
- Docker tags
- GitHub releases

### Manual Release Process
```bash
# Update version
echo "0.2.0" > VERSION

# Update package files (ensure alignment)
# - frontend/package.json
# - backend/pyproject.toml (if exists)

# Commit and tag
git add VERSION package.json
git commit -m "Bump version to 0.2.0"
git tag -a v0.2.0 -m "Release v0.2.0"

# Push (triggers CI/CD)
git push && git push --tags

# CI/CD automatically:
# - Builds Docker image
# - Tags as v0.2.0, 0.2, 0, latest
# - Creates GitHub release
```

---

## 🔐 Security Checklist

- [ ] Change default `DB_PASSWORD` in `.env`
- [ ] Generate strong `SECRET_KEY` (32+ chars)
- [ ] Review `CORS_ORIGINS` for production
- [ ] Enable TLS for SIP if required (`SIP_TRANSPORT=TLS`)
- [ ] Restrict database port (5432) with firewall
- [ ] Enable HTTPS with reverse proxy (nginx/traefik)
- [ ] Set up automated backups for PostgreSQL
- [ ] Review and harden docker-compose.yml for production

### Generate Secure Secrets
```bash
# Generate SECRET_KEY
openssl rand -hex 32

# Generate DB_PASSWORD
openssl rand -base64 24
```

---

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:8000/health

# Database health
docker-compose exec db pg_isready -U sipper

# Service status
docker-compose ps
```

### Logs
```bash
# All logs
docker-compose logs -f

# Application only
docker-compose logs -f app

# Database only
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100 app
```

### Metrics
Prometheus-compatible metrics available at:
```
http://localhost:8000/metrics
```

---

## 🆙 Upgrade Path

### From v0.1.0 to v0.2.0+

```bash
# Backup database first
docker-compose exec db pg_dump -U sipper sipper > backup-$(date +%Y%m%d).sql

# Pull latest code
git pull origin main

# Pull new Docker images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d

# Verify
curl http://localhost:8000/health
```

### Rollback Procedure
```bash
# Stop services
docker-compose down

# Checkout previous version
git checkout v0.1.0

# Restore database if needed
cat backup-YYYYMMDD.sql | docker-compose exec -T db psql -U sipper sipper

# Start services
docker-compose up -d
```

---

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Common issues:
# - Missing .env file → Copy .env.example
# - Database connection failed → Check DB_PASSWORD
# - Port already in use → Change APP_PORT in .env
```

### Database connection errors
```bash
# Verify database is running
docker-compose ps db

# Check database health
docker-compose exec db pg_isready -U sipper

# Reset database
docker-compose down -v
docker-compose up -d
```

### Permission denied errors
```bash
# Fix log/data directories
mkdir -p logs data
chmod 755 logs data

# Restart
docker-compose restart app
```

---

## 📞 Support

- **Issues:** https://github.com/danilo-telnyx/sipper/issues
- **Discussions:** https://github.com/danilo-telnyx/sipper/discussions
- **Email:** danilo@telnyx.com

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible at http://localhost:8000
- [ ] API docs working at http://localhost:8000/docs
- [ ] Health check returns `{"status": "healthy"}`
- [ ] Database accepting connections
- [ ] Logs showing no errors
- [ ] `.env` file configured correctly
- [ ] Secrets are secure (not default values)
- [ ] Backup strategy implemented
- [ ] Monitoring configured (if production)

---

**Deployment Date:** 2026-03-04  
**Version:** v0.1.0  
**Status:** ✅ Production Ready
