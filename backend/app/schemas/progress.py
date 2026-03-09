"""Progress and attempt schemas."""
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Dict, Optional, List


# ====== User Progress ======

class ProgressMarkComplete(BaseModel):
    """Mark a section as complete."""
    section_id: UUID


class ProgressResponse(BaseModel):
    """User progress response."""
    id: UUID
    user_id: UUID
    course_id: UUID
    section_id: UUID
    completed: bool
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ====== Quiz Attempts ======

class QuizSubmission(BaseModel):
    """Submit quiz answers."""
    course_id: UUID
    quiz_number: int  # Which quiz (1, 2, 3...)
    answers: Dict[str, str]  # {question_id: answer}


class QuizResult(BaseModel):
    """Quiz grading result."""
    quiz_number: int
    score: int
    total_questions: int
    percentage: float
    passed: bool
    correct_answers: Dict[str, str]  # {question_id: correct_answer}
    explanations: Dict[str, Optional[str]]  # {question_id: explanation}


class QuizAttemptResponse(BaseModel):
    """Quiz attempt response."""
    id: UUID
    user_id: UUID
    course_id: UUID
    quiz_number: int
    score: int
    passed: bool
    attempted_at: datetime
    
    class Config:
        from_attributes = True


# ====== Exam Attempts ======

class ExamSubmission(BaseModel):
    """Submit exam answers."""
    course_id: UUID
    answers: Dict[str, str]  # {question_id: answer}


class ExamResult(BaseModel):
    """Exam grading result."""
    score: int
    total_questions: int
    percentage: float
    passed: bool  # True if >= 70%
    correct_answers: Dict[str, str]  # {question_id: correct_answer}
    explanations: Dict[str, Optional[str]]  # {question_id: explanation}
    certificate_id: Optional[UUID] = None  # If passed


class ExamAttemptResponse(BaseModel):
    """Exam attempt response."""
    id: UUID
    user_id: UUID
    course_id: UUID
    score: int
    passed: bool
    attempted_at: datetime
    
    class Config:
        from_attributes = True


# ====== Dashboard ======

class UserDashboard(BaseModel):
    """User learning dashboard."""
    total_courses: int
    courses_in_progress: int
    courses_completed: int
    certificates_earned: int
    recent_activity: List[Dict]  # Recent progress, quiz attempts, etc.
