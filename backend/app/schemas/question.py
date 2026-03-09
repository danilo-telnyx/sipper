"""Question schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, List
from app.models.question import QuestionType


class QuestionBase(BaseModel):
    """Base question schema."""
    question_text: str
    question_type: QuestionType
    options: List[str]  # ["Option A", "Option B", ...] or ["True", "False"]
    correct_answer: str
    explanation: Optional[str] = None
    is_exam_question: bool = False
    order: int


class QuestionCreate(QuestionBase):
    """Question creation schema."""
    course_id: UUID


class QuestionUpdate(BaseModel):
    """Question update schema."""
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    is_exam_question: Optional[bool] = None
    order: Optional[int] = None


class QuestionResponse(QuestionBase):
    """Question response schema (with answer for admin)."""
    id: UUID
    course_id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class QuestionForUser(BaseModel):
    """Question for user (without correct answer)."""
    id: UUID
    question_text: str
    question_type: QuestionType
    options: List[str]
    explanation: Optional[str] = None  # Shown after answering
    
    class Config:
        from_attributes = True


class QuizQuestion(QuestionForUser):
    """Quiz question (no answer exposed)."""
    pass


class ExamQuestion(QuestionForUser):
    """Exam question (no answer exposed)."""
    pass
