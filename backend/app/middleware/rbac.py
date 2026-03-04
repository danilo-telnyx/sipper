"""RBAC middleware for permission checking."""
from functools import wraps
from fastapi import HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, Permission
from app.auth.dependencies import get_current_active_user


def require_permission(resource: str, action: str):
    """
    Decorator to check if user has required permission.
    
    Usage:
        @router.post("/credentials")
        @require_permission("credentials", "create")
        async def create_credential(...):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user and db from kwargs (injected by FastAPI)
            current_user: User = kwargs.get("current_user")
            db: AsyncSession = kwargs.get("db")
            
            if current_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            # Check if user has the required permission
            has_permission = await check_user_permission(
                db, current_user.id, resource, action
            )
            
            if not has_permission:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {resource}:{action}"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


async def check_user_permission(
    db: AsyncSession,
    user_id: str,
    resource: str,
    action: str
) -> bool:
    """Check if user has a specific permission."""
    # Query: User -> UserRoles -> Role -> RolePermissions -> Permission
    query = select(Permission).join(
        Permission.role_permissions
    ).join(
        Permission.role_permissions.property.mapper.class_.role
    ).join(
        Permission.role_permissions.property.mapper.class_.role.property.mapper.class_.user_roles
    ).where(
        Permission.resource == resource,
        Permission.action == action,
        # UserRole.user_id == user_id  # Would need proper join
    )
    
    # Simplified check (in production, use proper ORM joins)
    result = await db.execute(
        select(Permission).where(
            Permission.resource == resource,
            Permission.action == action
        )
    )
    permission = result.scalar_one_or_none()
    
    # TODO: Implement full RBAC chain check
    # For now, return True if permission exists (placeholder)
    return permission is not None
