"""Organization endpoints."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, Organization
from app.schemas import OrganizationResponse, OrganizationUpdate
from app.auth.dependencies import get_current_active_user
from app.auth.permissions import check_is_admin, check_is_admin_or_manager

router = APIRouter(prefix="/orgs", tags=["Organizations"])


@router.get("", response_model=list[OrganizationResponse])
async def list_organizations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """List all organizations (admin only)."""
    result = await db.execute(select(Organization))
    organizations = result.scalars().all()
    return organizations


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get organization details."""
    # Check if user belongs to this organization
    if current_user.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this organization"
        )
    
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    return organization


@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    update_data: OrganizationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin_or_manager)
):
    """Update organization (admin/manager only)."""
    # Check if user belongs to this organization
    if current_user.organization_id != org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this organization"
        )
    
    result = await db.execute(select(Organization).where(Organization.id == org_id))
    organization = result.scalar_one_or_none()
    
    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )
    
    # Update fields
    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(organization, field, value)
    
    await db.commit()
    await db.refresh(organization)
    
    return organization
