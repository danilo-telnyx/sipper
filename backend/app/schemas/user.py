"""User schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    """User creation schema."""
    password: str
    organization_id: UUID


class UserUpdate(BaseModel):
    """User update schema."""
    email: EmailStr | None = None
    full_name: str | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    """User response schema."""
    id: UUID
    organization_id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
