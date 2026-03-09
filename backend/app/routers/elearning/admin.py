"""Admin endpoints for e-learning management."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from uuid import UUID

from app.database import get_db
from app.models import User, Course, Question
from app.models.user_progress import UserProgress, QuizAttempt, ExamAttempt
from app.models.certificate import Certificate
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from app.auth.permissions import check_is_admin

router = APIRouter(prefix="/elearning/admin", tags=["E-Learning - Admin"])


# ====== Question Management ======

@router.get("/questions/{course_id}", response_model=List[QuestionResponse])
async def list_course_questions(
    course_id: UUID,
    is_exam: bool = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """List all questions for a course (admin only)."""
    query = select(Question).where(Question.course_id == course_id)
    
    if is_exam is not None:
        query = query.where(Question.is_exam_question == is_exam)
    
    query = query.order_by(Question.order)
    
    result = await db.execute(query)
    questions = result.scalars().all()
    return questions


@router.post("/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_question(
    question_data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Create a new question (admin only)."""
    # Verify course exists
    course_result = await db.execute(
        select(Course).where(Course.id == question_data.course_id)
    )
    if not course_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Course not found")
    
    question = Question(**question_data.model_dump())
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.patch("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: UUID,
    question_data: QuestionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Update a question (admin only)."""
    result = await db.execute(
        select(Question).where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for key, value in question_data.model_dump(exclude_unset=True).items():
        setattr(question, key, value)
    
    await db.commit()
    await db.refresh(question)
    return question


@router.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    question_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Delete a question (admin only)."""
    result = await db.execute(
        select(Question).where(Question.id == question_id)
    )
    question = result.scalar_one_or_none()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    await db.delete(question)
    await db.commit()


# ====== User Stats & Analytics ======

@router.get("/stats/overview")
async def get_stats_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
) -> Dict[str, Any]:
    """Get overall e-learning stats (admin only)."""
    # Total users
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar()
    
    # Total courses
    courses_result = await db.execute(select(func.count(Course.id)))
    total_courses = courses_result.scalar()
    
    # Total certificates issued
    certs_result = await db.execute(select(func.count(Certificate.id)))
    total_certificates = certs_result.scalar()
    
    # Total quiz attempts
    quiz_result = await db.execute(select(func.count(QuizAttempt.id)))
    total_quiz_attempts = quiz_result.scalar()
    
    # Total exam attempts
    exam_result = await db.execute(select(func.count(ExamAttempt.id)))
    total_exam_attempts = exam_result.scalar()
    
    # Passed exams
    passed_exam_result = await db.execute(
        select(func.count(ExamAttempt.id)).where(ExamAttempt.passed == True)
    )
    passed_exams = passed_exam_result.scalar()
    
    return {
        "total_users": total_users,
        "total_courses": total_courses,
        "total_certificates": total_certificates,
        "total_quiz_attempts": total_quiz_attempts,
        "total_exam_attempts": total_exam_attempts,
        "passed_exams": passed_exams,
        "exam_pass_rate": round((passed_exams / total_exam_attempts * 100) if total_exam_attempts > 0 else 0, 1)
    }


@router.get("/stats/users")
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
) -> List[Dict[str, Any]]:
    """Get stats for all users (admin only)."""
    # Get all users
    users_result = await db.execute(select(User))
    users = users_result.scalars().all()
    
    user_stats = []
    
    for user in users:
        # Count progress
        progress_result = await db.execute(
            select(func.count(UserProgress.id)).where(
                UserProgress.user_id == user.id,
                UserProgress.completed == True
            )
        )
        completed_sections = progress_result.scalar()
        
        # Count quiz attempts
        quiz_result = await db.execute(
            select(func.count(QuizAttempt.id)).where(
                QuizAttempt.user_id == user.id
            )
        )
        quiz_attempts = quiz_result.scalar()
        
        # Count passed quizzes
        passed_quiz_result = await db.execute(
            select(func.count(QuizAttempt.id)).where(
                QuizAttempt.user_id == user.id,
                QuizAttempt.passed == True
            )
        )
        passed_quizzes = passed_quiz_result.scalar()
        
        # Count exam attempts
        exam_result = await db.execute(
            select(func.count(ExamAttempt.id)).where(
                ExamAttempt.user_id == user.id
            )
        )
        exam_attempts = exam_result.scalar()
        
        # Count passed exams
        passed_exam_result = await db.execute(
            select(func.count(ExamAttempt.id)).where(
                ExamAttempt.user_id == user.id,
                ExamAttempt.passed == True
            )
        )
        passed_exams = passed_exam_result.scalar()
        
        # Count certificates
        cert_result = await db.execute(
            select(func.count(Certificate.id)).where(
                Certificate.user_id == user.id
            )
        )
        certificates = cert_result.scalar()
        
        user_stats.append({
            "user_id": str(user.id),
            "email": user.email,
            "full_name": user.full_name,
            "completed_sections": completed_sections,
            "quiz_attempts": quiz_attempts,
            "passed_quizzes": passed_quizzes,
            "exam_attempts": exam_attempts,
            "passed_exams": passed_exams,
            "certificates": certificates
        })
    
    return user_stats


@router.get("/stats/course/{course_id}")
async def get_course_stats(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
) -> Dict[str, Any]:
    """Get stats for a specific course (admin only)."""
    # Verify course exists
    course_result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Users who started this course
    started_result = await db.execute(
        select(func.count(func.distinct(UserProgress.user_id))).where(
            UserProgress.course_id == course_id
        )
    )
    users_started = started_result.scalar()
    
    # Quiz attempts
    quiz_result = await db.execute(
        select(func.count(QuizAttempt.id)).where(
            QuizAttempt.course_id == course_id
        )
    )
    quiz_attempts = quiz_result.scalar()
    
    # Passed quizzes
    passed_quiz_result = await db.execute(
        select(func.count(QuizAttempt.id)).where(
            QuizAttempt.course_id == course_id,
            QuizAttempt.passed == True
        )
    )
    passed_quizzes = passed_quiz_result.scalar()
    
    # Exam attempts
    exam_result = await db.execute(
        select(func.count(ExamAttempt.id)).where(
            ExamAttempt.course_id == course_id
        )
    )
    exam_attempts = exam_result.scalar()
    
    # Passed exams
    passed_exam_result = await db.execute(
        select(func.count(ExamAttempt.id)).where(
            ExamAttempt.course_id == course_id,
            ExamAttempt.passed == True
        )
    )
    passed_exams = passed_exam_result.scalar()
    
    # Certificates issued
    cert_result = await db.execute(
        select(func.count(Certificate.id)).where(
            Certificate.course_id == course_id
        )
    )
    certificates = cert_result.scalar()
    
    return {
        "course_id": str(course_id),
        "course_title": course.title,
        "course_level": course.level.value,
        "users_started": users_started,
        "quiz_attempts": quiz_attempts,
        "passed_quizzes": passed_quizzes,
        "quiz_pass_rate": round((passed_quizzes / quiz_attempts * 100) if quiz_attempts > 0 else 0, 1),
        "exam_attempts": exam_attempts,
        "passed_exams": passed_exams,
        "exam_pass_rate": round((passed_exams / exam_attempts * 100) if exam_attempts > 0 else 0, 1),
        "certificates_issued": certificates,
        "completion_rate": round((certificates / users_started * 100) if users_started > 0 else 0, 1)
    }
