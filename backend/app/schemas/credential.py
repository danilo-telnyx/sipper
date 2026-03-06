"""SIP Credential schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class SIPCredentialBase(BaseModel):
    """Base SIP credential schema."""
    name: str
    sip_domain: str
    username: str
    port: int = 5060
    transport: str = "UDP"  # UDP, TCP, TLS
    outbound_proxy: str | None = None


class SIPCredentialCreate(SIPCredentialBase):
    """SIP credential creation schema."""
    password: str  # Plain text, will be encrypted


class SIPCredentialUpdate(BaseModel):
    """SIP credential update schema."""
    name: str | None = None
    sip_domain: str | None = None
    username: str | None = None
    password: str | None = None
    port: int | None = None
    transport: str | None = None
    outbound_proxy: str | None = None


class SIPCredentialResponse(SIPCredentialBase):
    """SIP credential response schema (password excluded by default)."""
    id: UUID
    organization_id: UUID
    created_by: UUID | None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class SIPCredentialWithPassword(SIPCredentialResponse):
    """SIP credential response with decrypted password (admin only)."""
    password: str
