"""Permission checking utilities."""
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import User, Role, UserRole
from app.auth.dependencies import get_current_active_user


async def check_is_admin(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to verify current user has admin role.
    Raises 403 if user is not an admin.
    Returns the user if they are an admin.
    """
    # Load user with roles
    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == current_user.id)
    )
    user_with_roles = result.scalar_one_or_none()
    
    if not user_with_roles:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user has admin role
    is_admin = any(
        user_role.role.name.lower() in ['admin', 'administrator', 'owner']
        for user_role in user_with_roles.user_roles
    )
    
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    
    return user_with_roles


async def check_is_admin_or_manager(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to verify current user has admin or manager role.
    Raises 403 if user is neither admin nor manager.
    Returns the user if they have sufficient privileges.
    """
    # Load user with roles
    result = await db.execute(
        select(User)
        .options(selectinload(User.user_roles).selectinload(UserRole.role))
        .where(User.id == current_user.id)
    )
    user_with_roles = result.scalar_one_or_none()
    
    if not user_with_roles:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user has admin or manager role
    has_permission = any(
        user_role.role.name.lower() in ['admin', 'administrator', 'owner', 'manager']
        for user_role in user_with_roles.user_roles
    )
    
    if not has_permission:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Manager privileges required"
        )
    
    return user_with_roles
