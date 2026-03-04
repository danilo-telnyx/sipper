# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-04

### Added
- Initial release of SIPPER
- Docker multi-stage build (backend + frontend)
- Docker Compose orchestration with PostgreSQL
- GitHub Actions CI/CD pipeline
  - Automated Docker image builds
  - Push to GitHub Container Registry (ghcr.io)
  - Version alignment validation
  - Automated GitHub releases
- Complete documentation
  - README with quick start and configuration guide
  - .env.example with all configuration options
  - API documentation structure
- SIP testing core features
  - Registration testing
  - Basic call flow validation
  - Transport protocol support (UDP/TCP/TLS)
- FastAPI backend with RESTful API
- React-based web UI
- PostgreSQL database for call history
- Health check endpoints
- Prometheus metrics endpoint
- JWT authentication
- Version alignment strategy (VERSION file = package.json = Docker tag)

### Security
- Non-root Docker user
- No secrets in repository
- CORS protection
- SQL injection protection via ORM
- Rate limiting on API endpoints

### Documentation
- Comprehensive README.md
- Architecture overview
- Quick start guide
- Configuration guide
- Development guide
- Roadmap for future releases
- Upgrade path documentation

[Unreleased]: https://github.com/danilo-smaldone/sipper/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/danilo-smaldone/sipper/releases/tag/v0.1.0
