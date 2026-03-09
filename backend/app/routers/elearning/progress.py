"""User progress tracking endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models import User, Section
from app.models.user_progress import UserProgress
from app.schemas.progress import ProgressMarkComplete, ProgressResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/elearning/progress", tags=["E-Learning - Progress"])


@router.get("/{course_id}", response_model=List[ProgressResponse])
async def get_course_progress(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's progress for a specific course."""
    result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.course_id == course_id
        )
    )
    progress = result.scalars().all()
    return progress


@router.post("/complete", response_model=ProgressResponse)
async def mark_section_complete(
    data: ProgressMarkComplete,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a section as complete."""
    # Verify section exists and get course_id
    section_result = await db.execute(
        select(Section).where(Section.id == data.section_id)
    )
    section = section_result.scalar_one_or_none()
    
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    # Check if progress already exists
    existing_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.section_id == data.section_id
        )
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        # Update existing
        existing.completed = True
        existing.completed_at = datetime.utcnow()
        await db.commit()
        await db.refresh(existing)
        return existing
    else:
        # Create new progress record
        progress = UserProgress(
            user_id=current_user.id,
            course_id=section.course_id,
            section_id=data.section_id,
            completed=True,
            completed_at=datetime.utcnow()
        )
        db.add(progress)
        await db.commit()
        await db.refresh(progress)
        return progress
