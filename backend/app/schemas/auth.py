"""Authentication schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Registration request schema."""
    email: EmailStr
    password: str
    full_name: str
    organization_name: str


class UserData(BaseModel):
    """User data in token response."""
    id: str
    email: str
    full_name: str | None
    role: str
    organization_id: str
    is_active: bool
    created_at: str


class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserData | None = None
