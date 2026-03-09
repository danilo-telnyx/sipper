"""User progress and attempt models."""
import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class UserProgress(Base):
    """Track user progress through course sections."""
    
    __tablename__ = "user_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    section_id = Column(UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime)
    
    # Composite unique constraint: one progress record per user/section
    __table_args__ = (
        UniqueConstraint('user_id', 'section_id', name='uq_user_section_progress'),
    )
    
    # Relationships
    user = relationship("User", back_populates="course_progress")
    course = relationship("Course", back_populates="user_progress")
    section = relationship("Section", back_populates="user_progress")


class QuizAttempt(Base):
    """Track quiz attempts (5 questions every 3 sections)."""
    
    __tablename__ = "quiz_attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    quiz_number = Column(Integer, nullable=False)  # Which quiz (after section 3, 6, 9, etc.)
    answers = Column(JSON, nullable=False)  # {question_id: answer}
    score = Column(Integer, nullable=False)  # Number correct
    passed = Column(Boolean, nullable=False)  # True if score >= 3 (60%)
    attempted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    course = relationship("Course", back_populates="quiz_attempts")


class ExamAttempt(Base):
    """Track final exam attempts (15 questions)."""
    
    __tablename__ = "exam_attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    answers = Column(JSON, nullable=False)  # {question_id: answer}
    score = Column(Integer, nullable=False)  # Number correct (out of 15)
    passed = Column(Boolean, nullable=False)  # True if score >= 11 (70%)
    attempted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="exam_attempts")
    course = relationship("Course", back_populates="exam_attempts")
