"""
SIPPER - SIP Protocol Testing Platform
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

# Version from VERSION file
VERSION = os.getenv("APP_VERSION", "0.1.0")

app = FastAPI(
    title="SIPPER API",
    description="SIP Protocol Testing & Monitoring Platform",
    version=VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "SIPPER",
        "version": VERSION,
        "description": "SIP Protocol Testing Platform",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for container orchestration"""
    return {
        "status": "healthy",
        "version": VERSION,
        "service": "sipper",
    }


@app.get("/api/v1/info")
async def api_info():
    """API information"""
    return {
        "api_version": "v1",
        "app_version": VERSION,
        "endpoints": {
            "tests": "/api/v1/tests",
            "metrics": "/api/v1/metrics",
            "config": "/api/v1/config",
        },
    }


# Placeholder routes for MVP
@app.get("/api/v1/tests")
async def list_tests():
    """List all SIP tests (placeholder)"""
    return {"tests": [], "message": "MVP - Test execution coming in v0.1.1"}


@app.get("/api/v1/metrics/summary")
async def metrics_summary():
    """Get test metrics summary (placeholder)"""
    return {
        "total_tests": 0,
        "success_rate": 0.0,
        "avg_mos_score": 0.0,
        "message": "MVP - Metrics coming in v0.1.1",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
