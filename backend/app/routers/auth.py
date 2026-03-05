"""Authentication endpoints."""
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models import User, Organization
from app.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, create_refresh_token
from app.rate_limit import limiter, get_login_limit, get_register_limit

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(get_register_limit())  # Dynamic based on environment
async def register(
    request: Request,
    register_data: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user and organization."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == register_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if organization with same name already exists
    result = await db.execute(select(Organization).where(Organization.name == register_data.organization_name))
    existing_org = result.scalar_one_or_none()
    
    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization '{register_data.organization_name}' already exists. Please choose a different name or contact your organization admin."
        )
    
    # Generate unique organization slug
    base_slug = re.sub(r'[^a-z0-9-]', '', register_data.organization_name.lower().replace(" ", "-"))
    org_slug = base_slug
    
    # Check for slug conflicts and generate unique slug
    attempt = 0
    while attempt < 10:
        result = await db.execute(select(Organization).where(Organization.slug == org_slug))
        if not result.scalar_one_or_none():
            break
        # Add random suffix if slug exists
        org_slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"
        attempt += 1
    
    # Create organization
    organization = Organization(
        name=register_data.organization_name,
        slug=org_slug
    )
    db.add(organization)
    
    try:
        await db.flush()  # Get org ID
        
        # Create user
        user = User(
            email=register_data.email,
            password_hash=hash_password(register_data.password),
            full_name=register_data.full_name,
            organization_id=organization.id
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. This organization name or email may already be in use."
        )
    
    # Generate tokens
    token_data = {"sub": str(user.id), "org_id": str(user.organization_id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit(get_login_limit())  # Dynamic based on environment
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """Login user."""
    # Find user
    result = await db.execute(select(User).where(User.email == login_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled"
        )
    
    # Generate tokens
    token_data = {"sub": str(user.id), "org_id": str(user.organization_id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/logout")
async def logout():
    """Logout user (client should discard tokens)."""
    # In a production system, you'd add the token to a blacklist
    return {"message": "Successfully logged out"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh access token using refresh token."""
    from app.auth.jwt import verify_token
    
    payload = verify_token(refresh_token, "refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Generate new tokens
    token_data = {"sub": payload["sub"], "org_id": payload["org_id"]}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )
