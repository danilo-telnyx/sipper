"""Role and Permission schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class PermissionResponse(BaseModel):
    """Permission response schema."""
    id: UUID
    resource: str
    action: str
    description: str | None = None
    
    model_config = ConfigDict(from_attributes=True)


class RoleBase(BaseModel):
    """Base role schema."""
    name: str
    description: str | None = None


class RoleCreate(RoleBase):
    """Role creation schema."""
    permission_ids: list[UUID] = []


class RoleResponse(RoleBase):
    """Role response schema."""
    id: UUID
    organization_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
