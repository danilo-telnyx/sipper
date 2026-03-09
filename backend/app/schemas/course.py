"""Course schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from app.models.course import CourseLevel


class SectionBase(BaseModel):
    """Base section schema."""
    title: str
    content: str  # Markdown
    order: int


class SectionCreate(SectionBase):
    """Section creation schema."""
    pass


class SectionUpdate(BaseModel):
    """Section update schema."""
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None


class SectionResponse(SectionBase):
    """Section response schema."""
    id: UUID
    course_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CourseBase(BaseModel):
    """Base course schema."""
    level: CourseLevel
    title: str
    description: Optional[str] = None
    order: int


class CourseCreate(CourseBase):
    """Course creation schema."""
    is_active: bool = True


class CourseUpdate(BaseModel):
    """Course update schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class CourseResponse(CourseBase):
    """Course response schema."""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CourseWithSections(CourseResponse):
    """Course with sections."""
    sections: List[SectionResponse] = []
    
    class Config:
        from_attributes = True


class CourseProgress(BaseModel):
    """Course progress for a user."""
    course_id: UUID
    course_title: str
    course_level: CourseLevel
    total_sections: int
    completed_sections: int
    progress_percentage: float
    quizzes_passed: int
    exam_passed: bool
    certificate_id: Optional[UUID] = None
