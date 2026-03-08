# Production Deployment Guide

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 14+ (or use Docker Compose provided DB)
- Domain with SSL certificate
- 8000 (HTTP) and 5060 (SIP UDP) ports available

## Environment Configuration

### 1. Generate Secrets

**CRITICAL:** Never use example/default secrets in production!

```bash
# JWT secret (48+ characters recommended)
python3 -c "import secrets; print(f'JWT_SECRET={secrets.token_urlsafe(48)}')"

# App secret key
python3 -c "import secrets; print(f'SECRET_KEY={secrets.token_urlsafe(48)}')"

# Encryption key for SIP credentials
python3 -c "from cryptography.fernet import Fernet; print(f'ENCRYPTION_KEY={Fernet.generate_key().decode()}')"

# Database password
python3 -c "import secrets; print(f'DB_PASSWORD={secrets.token_urlsafe(32)}')"
```

### 2. Create `.env` File

```bash
cp .env.example .env
# Edit .env with generated secrets
```

**Required variables:**

```env
# Application
APP_ENV=production
APP_NAME=SIPPER
FRONTEND_URL=https://your-domain.com

# Security
JWT_SECRET=<generated-secret>
SECRET_KEY=<generated-secret>
ENCRYPTION_KEY=<generated-key>
JWT_EXPIRE_MINUTES=1440

# Database
DB_USER=sipper
DB_PASSWORD=<generated-password>
DB_NAME=sipper
DB_HOST=db
DB_PORT=5432

# Rate Limiting (Production)
RATE_LIMIT_ENABLED=true
RATE_LIMIT_PER_MINUTE=20

# CORS (adjust for your domain)
CORS_ORIGINS=https://your-domain.com

# Optional: Telnyx Integration
TELNYX_API_KEY=<your-telnyx-key>  # Only if using auto-import feature
```

## Deployment Methods

### Option 1: Docker Compose (Recommended)

```bash
# Clone repository
git clone https://github.com/danilo-telnyx/sipper.git
cd sipper

# Configure environment
cp .env.example .env
# Edit .env with production secrets

# Build and start services
docker-compose up -d --build

# Check logs
docker-compose logs -f app

# Verify health
curl http://localhost:8000/health
```

**Services:**
- `sipper-app`: FastAPI backend + React frontend + Node.js SIP Engine
- `sipper-db`: PostgreSQL database
- `sipper-nginx`: Reverse proxy (optional, for SSL termination)

### Option 2: Manual Deployment

#### Backend Setup

```bash
# Install dependencies
cd backend

# Python backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Node.js SIP Engine
cd sip-engine
npm install
cd ..

# Database migrations
alembic upgrade head

# Start services
./start-all.sh
```

#### Frontend Setup

```bash
cd frontend

# Install and build
npm install
npm run build

# Serve dist/ with nginx or serve
npx serve -s dist -l 5173
```

## SSL/TLS Configuration

### With Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket (for future real-time features)
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### With Caddy

```caddy
your-domain.com {
    reverse_proxy /api/* localhost:8000
    reverse_proxy /* localhost:5173
}
```

## Database Migrations

### Initial Setup

```bash
cd backend
source venv/bin/activate
alembic upgrade head
```

### Creating Migrations

```bash
# After model changes
alembic revision --autogenerate -m "description of changes"
alembic upgrade head
```

### Rollback

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

## Health Checks

### Backend API

```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","version":"0.7.0"}
```

### SIP Engine

```bash
curl http://localhost:5001/health
# Expected: {"status":"ok","service":"sipper-sip-engine","version":"1.0.0"}
```

### Database

```bash
docker-compose exec db psql -U sipper -c "SELECT 1"
# Or if running locally:
psql -U sipper -c "SELECT 1"
```

## Monitoring

### Logs

```bash
# Docker Compose
docker-compose logs -f app
docker-compose logs -f db

# Manual deployment
tail -f backend/logs/app.log
journalctl -u sipper-backend -f
```

### Metrics

Consider integrating:
- **Prometheus** for metrics collection
- **Grafana** for visualization
- **Sentry** for error tracking
- **DataDog/New Relic** for APM

Add to `backend/app/main.py`:
```python
from prometheus_fastapi_instrumentator import Instrumentator

# After app creation
Instrumentator().instrument(app).expose(app)
```

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR=/var/backups/sipper
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
docker-compose exec -T db pg_dump -U sipper sipper | gzip > "$BACKUP_DIR/sipper_$DATE.sql.gz"

# Keep last 30 days
find "$BACKUP_DIR" -name "sipper_*.sql.gz" -mtime +30 -delete
```

### Restore

```bash
gunzip < backup.sql.gz | docker-compose exec -T db psql -U sipper sipper
```

## Security Checklist

- [ ] All secrets generated and unique
- [ ] `.env` file permissions set to 600
- [ ] Database not exposed to public internet
- [ ] SSL/TLS certificates valid and auto-renewing
- [ ] CORS origins restricted to your domain
- [ ] Rate limiting enabled
- [ ] Firewall configured (allow only 80, 443, 5060 UDP)
- [ ] Regular security updates applied
- [ ] Backup strategy implemented and tested
- [ ] Monitoring and alerting configured

## Firewall Configuration

### UFW (Ubuntu)

```bash
# Allow SSH, HTTP, HTTPS, SIP
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5060/udp
ufw enable
```

### iptables

```bash
# Allow SIP traffic
iptables -A INPUT -p udp --dport 5060 -j ACCEPT
iptables -A OUTPUT -p udp --sport 5060 -j ACCEPT
```

## Performance Tuning

### PostgreSQL

```conf
# /etc/postgresql/14/main/postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 4MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Uvicorn Workers

```bash
# Adjust based on CPU cores (2 * cores + 1)
uvicorn app.main:app --workers 4 --host 0.0.0.0 --port 8000
```

## Scaling

### Horizontal Scaling

1. **Load balancer** (nginx, HAProxy, Traefik)
2. **Multiple app instances** (Docker Swarm, Kubernetes)
3. **Shared PostgreSQL** (managed service recommended)
4. **Redis session store** (for multi-instance sessions)

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database indexes
- Enable connection pooling (PgBouncer)

## Troubleshooting

### App won't start

```bash
# Check logs
docker-compose logs app

# Common issues:
# - Missing .env file → create it
# - Wrong DB credentials → check .env
# - Port conflict → check if 8000 is in use
# - Migration failures → check alembic logs
```

### SIP tests failing

```bash
# Check SIP engine
curl http://localhost:5001/health

# Check UDP port 5060
netstat -an | grep 5060

# Check firewall
ufw status
```

### Database connection errors

```bash
# Check DB is running
docker-compose ps db

# Check credentials
docker-compose exec db psql -U sipper -c "SELECT 1"

# Check network
docker-compose exec app ping db
```

## Maintenance

### Updates

```bash
# Pull latest code
git pull origin main

# Rebuild services
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app alembic upgrade head
```

### Cleanup

```bash
# Remove old images
docker image prune -a

# Remove old logs
find /var/log/sipper -name "*.log" -mtime +30 -delete
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/sipper
            git pull origin main
            docker-compose down
            docker-compose up -d --build
            docker-compose exec app alembic upgrade head
```

## Support

- **Issues:** https://github.com/danilo-telnyx/sipper/issues
- **Docs:** `/docs` directory in repository
- **Security:** Report vulnerabilities privately via GitHub Security tab

---

**Last updated:** 2026-03-08 (Sprint 5 - v0.7.0)
