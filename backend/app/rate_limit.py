"""Rate limiting configuration."""
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.config import settings

# Initialize rate limiter with environment-aware limits
def get_rate_limit_key():
    """Get rate limit key based on environment."""
    if settings.app_env == "development":
        # In development, use a more permissive key to allow testing
        return lambda: "dev-testing"
    return get_remote_address

limiter = Limiter(key_func=get_rate_limit_key())

# Environment-aware rate limits
def get_login_limit():
    """Get login rate limit based on environment."""
    if settings.app_env == "development":
        return "100/minute"  # Very permissive for dev
    return "5/minute"  # Strict for production

def get_register_limit():
    """Get registration rate limit based on environment."""
    if settings.app_env == "development":
        return "100/hour"  # Very permissive for dev
    return "3/10minutes"  # Strict for production
