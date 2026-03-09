"""Certificate endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from pathlib import Path

from app.database import get_db
from app.models import User, Course
from app.models.certificate import Certificate
from app.schemas.certificate import CertificateResponse, CertificateWithDetails, CertificateVerify
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/elearning/certificates", tags=["E-Learning - Certificates"])


@router.get("", response_model=List[CertificateWithDetails])
async def get_my_certificates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all certificates for the current user."""
    result = await db.execute(
        select(Certificate).where(
            Certificate.user_id == current_user.id
        ).order_by(Certificate.issued_at.desc())
    )
    certificates = result.scalars().all()
    
    # Enrich with details
    enriched = []
    for cert in certificates:
        course_result = await db.execute(
            select(Course).where(Course.id == cert.course_id)
        )
        course = course_result.scalar_one()
        
        enriched.append(CertificateWithDetails(
            id=cert.id,
            user_id=cert.user_id,
            course_id=cert.course_id,
            certificate_number=cert.certificate_number,
            issued_at=cert.issued_at,
            pdf_path=cert.pdf_path,
            user_name=current_user.full_name or current_user.email,
            user_email=current_user.email,
            course_title=course.title,
            course_level=course.level
        ))
    
    return enriched


@router.get("/{certificate_id}", response_model=CertificateWithDetails)
async def get_certificate(
    certificate_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific certificate."""
    result = await db.execute(
        select(Certificate).where(
            Certificate.id == certificate_id,
            Certificate.user_id == current_user.id
        )
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # Get course details
    course_result = await db.execute(
        select(Course).where(Course.id == certificate.course_id)
    )
    course = course_result.scalar_one()
    
    return CertificateWithDetails(
        id=certificate.id,
        user_id=certificate.user_id,
        course_id=certificate.course_id,
        certificate_number=certificate.certificate_number,
        issued_at=certificate.issued_at,
        pdf_path=certificate.pdf_path,
        user_name=current_user.full_name or current_user.email,
        user_email=current_user.email,
        course_title=course.title,
        course_level=course.level
    )


@router.get("/{certificate_id}/download")
async def download_certificate(
    certificate_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download certificate PDF."""
    result = await db.execute(
        select(Certificate).where(
            Certificate.id == certificate_id,
            Certificate.user_id == current_user.id
        )
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    # TODO: Generate PDF if not exists
    # For now, return JSON with certificate data
    if certificate.pdf_path and Path(certificate.pdf_path).exists():
        return FileResponse(
            certificate.pdf_path,
            media_type="application/pdf",
            filename=f"certificate_{certificate.certificate_number}.pdf"
        )
    
    # Get course details for PDF generation
    course_result = await db.execute(
        select(Course).where(Course.id == certificate.course_id)
    )
    course = course_result.scalar_one()
    
    # Return placeholder response for now
    return {
        "message": "PDF generation not yet implemented",
        "certificate_number": certificate.certificate_number,
        "user_name": current_user.full_name or current_user.email,
        "course_title": course.title,
        "course_level": course.level.value,
        "issued_at": certificate.issued_at.isoformat()
    }


@router.get("/verify/{certificate_number}", response_model=CertificateVerify)
async def verify_certificate(
    certificate_number: str,
    db: AsyncSession = Depends(get_db)
):
    """Verify a certificate by certificate number (public endpoint)."""
    result = await db.execute(
        select(Certificate).where(
            Certificate.certificate_number == certificate_number
        )
    )
    certificate = result.scalar_one_or_none()
    
    if not certificate:
        return CertificateVerify(
            certificate_number=certificate_number,
            is_valid=False
        )
    
    # Get user and course details
    user_result = await db.execute(
        select(User).where(User.id == certificate.user_id)
    )
    user = user_result.scalar_one()
    
    course_result = await db.execute(
        select(Course).where(Course.id == certificate.course_id)
    )
    course = course_result.scalar_one()
    
    return CertificateVerify(
        certificate_number=certificate_number,
        is_valid=True,
        issued_to=user.full_name or user.email,
        course_title=course.title,
        issued_at=certificate.issued_at
    )
