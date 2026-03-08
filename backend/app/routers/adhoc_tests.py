"""Ad-hoc test execution with strict rate limiting."""
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, TestRun
from app.schemas import TestRunCreate, TestRunResponse
from app.auth.dependencies import get_current_active_user
from app.rate_limit import limiter, get_adhoc_test_limit

router = APIRouter(prefix="/adhoc-tests", tags=["Ad-hoc Tests"])


@router.post("/run", response_model=TestRunResponse, status_code=status.HTTP_202_ACCEPTED)
@limiter.limit(get_adhoc_test_limit())
async def run_adhoc_test(
    test_data: TestRunCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Execute a SIP test with ad-hoc credentials (not saved).
    
    Rate limiting: 10/hour (production), 100/hour (development)
    
    Security:
    - Credentials encrypted before storing in metadata
    - Input sanitization applied
    - CRLF injection prevention
    """
    # Validate ad-hoc credentials required
    if not test_data.ad_hoc_credentials:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ad-hoc credentials required for this endpoint"
        )
    
    # SECURITY: Sanitize ad-hoc credentials
    from app.utils.sanitization import sanitize_domain, sanitize_username
    try:
        test_data.ad_hoc_credentials.domain = sanitize_domain(test_data.ad_hoc_credentials.domain)
        test_data.ad_hoc_credentials.username = sanitize_username(test_data.ad_hoc_credentials.username)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid credential format: {str(e)}"
        )
    
    # SECURITY: Sanitize optional SDP body
    if test_data.sdp_body:
        from app.utils.sanitization import sanitize_sdp_body
        try:
            test_data.sdp_body = sanitize_sdp_body(test_data.sdp_body)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid SDP body: {str(e)}"
            )
    
    # Prepare metadata with encrypted credentials
    from app.utils import encrypt_credential
    metadata = dict(test_data.metadata) if test_data.metadata else {}
    metadata["ad_hoc_credentials"] = {
        "domain": test_data.ad_hoc_credentials.domain,
        "username": test_data.ad_hoc_credentials.username,
        "password_encrypted": encrypt_credential(test_data.ad_hoc_credentials.password),
        "port": test_data.ad_hoc_credentials.port,
        "transport": test_data.ad_hoc_credentials.transport,
    }
    metadata["is_adhoc"] = True
    
    # Create test run
    test_run = TestRun(
        organization_id=current_user.organization_id,
        credential_id=None,  # Ad-hoc has no saved credential
        test_type=test_data.test_type,
        status="pending",
        created_by=current_user.id,
        metadata=metadata
    )
    db.add(test_run)
    await db.commit()
    await db.refresh(test_run)
    
    # Execute test in background
    from app.routers.tests import execute_sip_test
    background_tasks.add_task(execute_sip_test, test_run.id)
    
    return test_run
