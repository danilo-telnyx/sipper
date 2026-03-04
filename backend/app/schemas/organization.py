"""Organization schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class OrganizationBase(BaseModel):
    """Base organization schema."""
    name: str
    slug: str


class OrganizationCreate(OrganizationBase):
    """Organization creation schema."""
    pass


class OrganizationUpdate(BaseModel):
    """Organization update schema."""
    name: str | None = None
    slug: str | None = None
    is_active: bool | None = None


class OrganizationResponse(OrganizationBase):
    """Organization response schema."""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
