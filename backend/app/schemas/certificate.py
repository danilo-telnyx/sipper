"""Certificate schemas."""
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Optional
from app.models.course import CourseLevel


class CertificateResponse(BaseModel):
    """Certificate response."""
    id: UUID
    user_id: UUID
    course_id: UUID
    certificate_number: str
    issued_at: datetime
    pdf_path: Optional[str] = None
    
    class Config:
        from_attributes = True


class CertificateWithDetails(CertificateResponse):
    """Certificate with course and user details."""
    user_name: str
    user_email: str
    course_title: str
    course_level: CourseLevel
    
    class Config:
        from_attributes = True


class CertificateVerify(BaseModel):
    """Verify certificate by number."""
    certificate_number: str
    is_valid: bool
    issued_to: Optional[str] = None
    course_title: Optional[str] = None
    issued_at: Optional[datetime] = None
