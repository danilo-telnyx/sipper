"""User schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict, model_validator
from typing import Any


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
    role: str | None = None
    
    model_config = ConfigDict(from_attributes=True)
    
    @model_validator(mode='before')
    @classmethod
    def extract_role(cls, data: Any) -> Any:
        """Extract role from user_roles relationship."""
        if hasattr(data, 'user_roles') and data.user_roles:
            # Get the first role name
            role_name = data.user_roles[0].role.name if data.user_roles[0].role else None
            if isinstance(data, dict):
                data['role'] = role_name
            else:
                # Create a dict from the ORM object
                return {
                    'id': data.id,
                    'email': data.email,
                    'full_name': data.full_name,
                    'organization_id': data.organization_id,
                    'is_active': data.is_active,
                    'created_at': data.created_at,
                    'updated_at': data.updated_at,
                    'role': role_name
                }
        return data
