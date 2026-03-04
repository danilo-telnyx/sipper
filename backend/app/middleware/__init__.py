"""Middleware module."""
from app.middleware.rbac import require_permission

__all__ = ["require_permission"]
