"""Main FastAPI application."""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import init_db
from app.rate_limit import limiter
from app.routers import auth, organizations, users, credentials, tests, telnyx, dashboard, adhoc_tests

# Frontend directory
FRONTEND_DIR = Path("/app/frontend/dist")


async def validate_secrets():
    """Validate that production secrets are properly configured."""
    weak_secrets = ["change-this", "your-secret", "test123", "example", "demo", "sipper_secret", "sipper_jwt"]
    
    # Check JWT_SECRET
    jwt_secret_lower = settings.jwt_secret.lower()
    if any(weak in jwt_secret_lower for weak in weak_secrets):
        raise ValueError(f"WEAK JWT_SECRET detected - use production secret. Generate with: python3 -c \"import secrets; print(secrets.token_urlsafe(48))\"")
    
    if len(settings.jwt_secret) < 32:
        raise ValueError("JWT_SECRET too short - use 32+ characters")
    
    # Check SECRET_KEY if exists
    if hasattr(settings, 'secret_key'):
        secret_key_lower = settings.secret_key.lower()
        if any(weak in secret_key_lower for weak in weak_secrets):
            raise ValueError(f"WEAK SECRET_KEY detected - use production secret")
        
        if len(settings.secret_key) < 32:
            raise ValueError("SECRET_KEY too short - use 32+ characters")
    
    # Check ENCRYPTION_KEY format
    if hasattr(settings, 'encryption_key'):
        # Should be a valid Fernet key (44 characters base64)
        if len(settings.encryption_key) != 44 or not settings.encryption_key.endswith('='):
            raise ValueError("ENCRYPTION_KEY appears invalid - generate with: python3 -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    await validate_secrets()
    await init_db()
    yield
    # Shutdown (if needed)


# Create FastAPI app
app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=settings.api_description,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(adhoc_tests.router, prefix="/api")
app.include_router(organizations.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(credentials.router, prefix="/api")
app.include_router(tests.router, prefix="/api")
app.include_router(telnyx.router, prefix="/api")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# Mount static files for frontend
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")
    
    @app.get("/")
    async def serve_spa():
        """Serve the frontend SPA."""
        return FileResponse(FRONTEND_DIR / "index.html")
    
    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        """Catch-all route for SPA routing."""
        # Check if it's an API route
        if full_path.startswith(("api/", "docs", "redoc", "openapi.json", "health")):
            return {"error": "Not found"}
        
        # Serve frontend
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        
        # Fallback to index.html for SPA routing
        return FileResponse(FRONTEND_DIR / "index.html")
else:
    @app.get("/")
    async def root():
        """Root endpoint (frontend not available)."""
        return {
            "name": settings.api_title,
            "version": settings.api_version,
            "docs": "/docs",
            "openapi": "/openapi.json"
        }
