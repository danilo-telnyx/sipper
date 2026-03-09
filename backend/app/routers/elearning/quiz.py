"""Quiz endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import User, Course, Question
from app.models.user_progress import QuizAttempt
from app.schemas.progress import QuizSubmission, QuizResult, QuizAttemptResponse
from app.schemas.question import QuizQuestion
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/elearning/quiz", tags=["E-Learning - Quiz"])


@router.get("/{course_id}/{quiz_number}", response_model=List[QuizQuestion])
async def get_quiz_questions(
    course_id: UUID,
    quiz_number: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get quiz questions for a specific quiz number.
    
    Quiz 1: after section 3, Quiz 2: after section 6, etc.
    Each quiz has 5 questions.
    """
    # Get quiz questions (not exam questions)
    result = await db.execute(
        select(Question).where(
            Question.course_id == course_id,
            Question.is_exam_question == False
        ).order_by(Question.order)
    )
    all_questions = result.scalars().all()
    
    # Select 5 questions for this quiz
    # Simple approach: divide questions into groups of 5
    start_idx = (quiz_number - 1) * 5
    end_idx = start_idx + 5
    quiz_questions = all_questions[start_idx:end_idx]
    
    if not quiz_questions:
        raise HTTPException(status_code=404, detail="Quiz not found or no questions available")
    
    # Return questions without correct answers
    return [
        QuizQuestion(
            id=q.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=q.options,
            explanation=None  # Don't show until after submission
        )
        for q in quiz_questions
    ]


@router.post("/submit", response_model=QuizResult)
async def submit_quiz(
    submission: QuizSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit quiz answers and get results."""
    # Verify course exists
    course_result = await db.execute(
        select(Course).where(Course.id == submission.course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get quiz questions
    result = await db.execute(
        select(Question).where(
            Question.course_id == submission.course_id,
            Question.is_exam_question == False
        ).order_by(Question.order)
    )
    all_questions = result.scalars().all()
    
    # Get this quiz's questions
    start_idx = (submission.quiz_number - 1) * 5
    end_idx = start_idx + 5
    quiz_questions = all_questions[start_idx:end_idx]
    
    if not quiz_questions:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Grade the quiz
    score = 0
    correct_answers = {}
    explanations = {}
    
    for question in quiz_questions:
        q_id_str = str(question.id)
        user_answer = submission.answers.get(q_id_str, "")
        correct_answers[q_id_str] = question.correct_answer
        explanations[q_id_str] = question.explanation
        
        if user_answer == question.correct_answer:
            score += 1
    
    total_questions = len(quiz_questions)
    percentage = (score / total_questions * 100) if total_questions > 0 else 0
    passed = percentage >= 60.0  # 60% to pass a quiz
    
    # Save attempt
    attempt = QuizAttempt(
        user_id=current_user.id,
        course_id=submission.course_id,
        quiz_number=submission.quiz_number,
        answers=submission.answers,
        score=score,
        passed=passed
    )
    db.add(attempt)
    await db.commit()
    
    return QuizResult(
        quiz_number=submission.quiz_number,
        score=score,
        total_questions=total_questions,
        percentage=round(percentage, 1),
        passed=passed,
        correct_answers=correct_answers,
        explanations=explanations
    )


@router.get("/attempts/{course_id}", response_model=List[QuizAttemptResponse])
async def get_quiz_attempts(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's quiz attempts for a course."""
    result = await db.execute(
        select(QuizAttempt).where(
            QuizAttempt.user_id == current_user.id,
            QuizAttempt.course_id == course_id
        ).order_by(QuizAttempt.attempted_at.desc())
    )
    attempts = result.scalars().all()
    return attempts
