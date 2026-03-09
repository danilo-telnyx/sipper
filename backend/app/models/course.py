"""Course model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class CourseLevel(str, enum.Enum):
    """Course difficulty levels."""
    BASIC = "basic"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Course(Base):
    """Course model for e-learning platform."""
    
    __tablename__ = "courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level = Column(Enum(CourseLevel), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    order = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    sections = relationship("Section", back_populates="course", cascade="all, delete-orphan", order_by="Section.order")
    questions = relationship("Question", back_populates="course", cascade="all, delete-orphan")
    user_progress = relationship("UserProgress", back_populates="course", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="course", cascade="all, delete-orphan")
    exam_attempts = relationship("ExamAttempt", back_populates="course", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="course", cascade="all, delete-orphan")
