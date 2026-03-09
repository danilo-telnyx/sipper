"""Course management endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from uuid import UUID

from app.database import get_db
from app.models import Course, Section, User
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse, CourseWithSections,
    SectionCreate, SectionUpdate, SectionResponse, CourseProgress
)
from app.auth.dependencies import get_current_user
from app.auth.permissions import check_is_admin
from app.models.user_progress import UserProgress, ExamAttempt
from app.models.certificate import Certificate

router = APIRouter(prefix="/elearning/courses", tags=["E-Learning - Courses"])


@router.get("", response_model=List[CourseResponse])
async def list_courses(
    include_inactive: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all courses."""
    query = select(Course)
    if not include_inactive:
        query = query.where(Course.is_active == True)
    query = query.order_by(Course.order)
    
    result = await db.execute(query)
    courses = result.scalars().all()
    return courses


@router.get("/progress", response_model=List[CourseProgress])
async def get_my_progress(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's progress across all courses."""
    # Get all active courses
    courses_result = await db.execute(
        select(Course).where(Course.is_active == True).order_by(Course.order)
    )
    courses = courses_result.scalars().all()
    
    progress_list = []
    for course in courses:
        # Count total sections
        sections_result = await db.execute(
            select(Section).where(Section.course_id == course.id)
        )
        total_sections = len(sections_result.scalars().all())
        
        # Count completed sections
        completed_result = await db.execute(
            select(UserProgress).where(
                UserProgress.user_id == current_user.id,
                UserProgress.course_id == course.id,
                UserProgress.completed == True
            )
        )
        completed_sections = len(completed_result.scalars().all())
        
        # Check exam passed
        exam_result = await db.execute(
            select(ExamAttempt).where(
                ExamAttempt.user_id == current_user.id,
                ExamAttempt.course_id == course.id,
                ExamAttempt.passed == True
            )
        )
        exam_passed = exam_result.scalar_one_or_none() is not None
        
        # Check certificate
        cert_result = await db.execute(
            select(Certificate).where(
                Certificate.user_id == current_user.id,
                Certificate.course_id == course.id
            )
        )
        certificate = cert_result.scalar_one_or_none()
        
        progress_list.append(CourseProgress(
            course_id=course.id,
            course_title=course.title,
            course_level=course.level,
            total_sections=total_sections,
            completed_sections=completed_sections,
            progress_percentage=round((completed_sections / total_sections * 100) if total_sections > 0 else 0, 1),
            quizzes_passed=0,  # TODO: Calculate
            exam_passed=exam_passed,
            certificate_id=certificate.id if certificate else None
        ))
    
    return progress_list


@router.get("/{course_id}", response_model=CourseWithSections)
async def get_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get course with all sections."""
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.sections))
        .where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return course


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(
    course_data: CourseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Create a new course (admin only)."""
    course = Course(**course_data.model_dump())
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


@router.patch("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: UUID,
    course_data: CourseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Update a course (admin only)."""
    result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    for key, value in course_data.model_dump(exclude_unset=True).items():
        setattr(course, key, value)
    
    await db.commit()
    await db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Delete a course (admin only)."""
    result = await db.execute(
        select(Course).where(Course.id == course_id)
    )
    course = result.scalar_one_or_none()
    
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    await db.delete(course)
    await db.commit()


# ====== Sections ======

@router.post("/{course_id}/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
async def create_section(
    course_id: UUID,
    section_data: SectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Create a new section (admin only)."""
    # Verify course exists
    result = await db.execute(select(Course).where(Course.id == course_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Course not found")
    
    section = Section(course_id=course_id, **section_data.model_dump())
    db.add(section)
    await db.commit()
    await db.refresh(section)
    return section


@router.patch("/sections/{section_id}", response_model=SectionResponse)
async def update_section(
    section_id: UUID,
    section_data: SectionUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Update a section (admin only)."""
    result = await db.execute(
        select(Section).where(Section.id == section_id)
    )
    section = result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    for key, value in section_data.model_dump(exclude_unset=True).items():
        setattr(section, key, value)
    
    await db.commit()
    await db.refresh(section)
    return section


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_section(
    section_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(check_is_admin)
):
    """Delete a section (admin only)."""
    result = await db.execute(
        select(Section).where(Section.id == section_id)
    )
    section = result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    await db.delete(section)
    await db.commit()
