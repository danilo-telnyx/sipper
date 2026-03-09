"""Final exam endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
import secrets

from app.database import get_db
from app.models import User, Course, Question
from app.models.user_progress import ExamAttempt
from app.models.certificate import Certificate
from app.schemas.progress import ExamSubmission, ExamResult, ExamAttemptResponse
from app.schemas.question import ExamQuestion
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/elearning/exam", tags=["E-Learning - Exam"])


@router.get("/{course_id}", response_model=List[ExamQuestion])
async def get_exam_questions(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get final exam questions (15 questions)."""
    # Get exam questions
    result = await db.execute(
        select(Question).where(
            Question.course_id == course_id,
            Question.is_exam_question == True
        ).order_by(Question.order).limit(15)
    )
    exam_questions = result.scalars().all()
    
    if len(exam_questions) < 15:
        raise HTTPException(
            status_code=404, 
            detail=f"Exam incomplete - only {len(exam_questions)} questions available (need 15)"
        )
    
    # Return questions without correct answers
    return [
        ExamQuestion(
            id=q.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=q.options,
            explanation=None  # Don't show until after submission
        )
        for q in exam_questions
    ]


@router.post("/submit", response_model=ExamResult)
async def submit_exam(
    submission: ExamSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit exam answers and get results. Generate certificate if passed (>= 70%)."""
    # Verify course exists
    course_result = await db.execute(
        select(Course).where(Course.id == submission.course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get exam questions
    result = await db.execute(
        select(Question).where(
            Question.course_id == submission.course_id,
            Question.is_exam_question == True
        ).order_by(Question.order).limit(15)
    )
    exam_questions = result.scalars().all()
    
    if len(exam_questions) < 15:
        raise HTTPException(status_code=400, detail="Exam incomplete")
    
    # Grade the exam
    score = 0
    correct_answers = {}
    explanations = {}
    
    for question in exam_questions:
        q_id_str = str(question.id)
        user_answer = submission.answers.get(q_id_str, "")
        correct_answers[q_id_str] = question.correct_answer
        explanations[q_id_str] = question.explanation
        
        if user_answer == question.correct_answer:
            score += 1
    
    total_questions = len(exam_questions)
    percentage = (score / total_questions * 100) if total_questions > 0 else 0
    passed = percentage >= 70.0  # 70% to pass exam
    
    # Save exam attempt
    attempt = ExamAttempt(
        user_id=current_user.id,
        course_id=submission.course_id,
        answers=submission.answers,
        score=score,
        passed=passed
    )
    db.add(attempt)
    
    certificate_id = None
    
    # Generate certificate if passed and doesn't already have one
    if passed:
        # Check if certificate already exists
        cert_check = await db.execute(
            select(Certificate).where(
                Certificate.user_id == current_user.id,
                Certificate.course_id == submission.course_id
            )
        )
        existing_cert = cert_check.scalar_one_or_none()
        
        if not existing_cert:
            # Generate unique certificate number
            cert_number = f"TELNYX-SIP-{course.level.value.upper()}-{secrets.token_hex(6).upper()}"
            
            certificate = Certificate(
                user_id=current_user.id,
                course_id=submission.course_id,
                certificate_number=cert_number
            )
            db.add(certificate)
            await db.commit()
            await db.refresh(certificate)
            certificate_id = certificate.id
        else:
            certificate_id = existing_cert.id
    
    await db.commit()
    
    return ExamResult(
        score=score,
        total_questions=total_questions,
        percentage=round(percentage, 1),
        passed=passed,
        correct_answers=correct_answers,
        explanations=explanations,
        certificate_id=certificate_id
    )


@router.get("/attempts/{course_id}", response_model=List[ExamAttemptResponse])
async def get_exam_attempts(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's exam attempts for a course."""
    result = await db.execute(
        select(ExamAttempt).where(
            ExamAttempt.user_id == current_user.id,
            ExamAttempt.course_id == course_id
        ).order_by(ExamAttempt.attempted_at.desc())
    )
    attempts = result.scalars().all()
    return attempts
