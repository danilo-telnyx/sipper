"""SIP Credentials endpoints."""
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, SIPCredential
from app.schemas import SIPCredentialCreate, SIPCredentialUpdate, SIPCredentialResponse
from app.auth.dependencies import get_current_active_user
from app.utils import encrypt_credential, decrypt_credential

router = APIRouter(prefix="/credentials", tags=["Credentials"])


@router.get("", response_model=list[SIPCredentialResponse])
async def list_credentials(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List SIP credentials for current user's organization."""
    result = await db.execute(
        select(SIPCredential).where(
            SIPCredential.organization_id == current_user.organization_id
        )
    )
    credentials = result.scalars().all()
    return credentials


@router.get("/{credential_id}", response_model=SIPCredentialResponse)
async def get_credential(
    credential_id: UUID,
    include_password: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get SIP credential details."""
    result = await db.execute(
        select(SIPCredential).where(SIPCredential.id == credential_id)
    )
    credential = result.scalar_one_or_none()
    
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found"
        )
    
    # Check if user has access
    if credential.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    response = SIPCredentialResponse.model_validate(credential)
    
    # Optionally include decrypted password (admin only in production)
    if include_password:
        # TODO: Check admin permission
        response_dict = response.model_dump()
        response_dict["password"] = decrypt_credential(credential.password_encrypted)
        return response_dict
    
    return response


@router.post("", response_model=SIPCredentialResponse, status_code=status.HTTP_201_CREATED)
async def create_credential(
    credential_data: SIPCredentialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new SIP credential."""
    # Encrypt password
    encrypted_password = encrypt_credential(credential_data.password)
    
    # Create credential
    credential = SIPCredential(
        name=credential_data.name,
        organization_id=current_user.organization_id,
        sip_domain=credential_data.sip_domain,
        username=credential_data.username,
        password_encrypted=encrypted_password,
        created_by=current_user.id
    )
    db.add(credential)
    await db.commit()
    await db.refresh(credential)
    
    return credential


@router.put("/{credential_id}", response_model=SIPCredentialResponse)
async def update_credential(
    credential_id: UUID,
    update_data: SIPCredentialUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update SIP credential."""
    result = await db.execute(
        select(SIPCredential).where(SIPCredential.id == credential_id)
    )
    credential = result.scalar_one_or_none()
    
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found"
        )
    
    # Check permissions
    if credential.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Update fields
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Handle password encryption
    if "password" in update_dict:
        update_dict["password_encrypted"] = encrypt_credential(update_dict.pop("password"))
    
    for field, value in update_dict.items():
        setattr(credential, field, value)
    
    await db.commit()
    await db.refresh(credential)
    
    return credential


@router.delete("/{credential_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_credential(
    credential_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete SIP credential."""
    result = await db.execute(
        select(SIPCredential).where(SIPCredential.id == credential_id)
    )
    credential = result.scalar_one_or_none()
    
    if not credential:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Credential not found"
        )
    
    if credential.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    await db.delete(credential)
    await db.commit()
    
    return None
