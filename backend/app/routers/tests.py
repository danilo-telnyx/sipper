"""Test execution endpoints."""
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, TestRun, TestResult, SIPCredential
from app.schemas import TestRunCreate, TestRunResponse, TestResultResponse
from app.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/tests", tags=["Tests"])


async def execute_sip_test(test_run_id: UUID):
    """
    Background task to execute SIP test.
    This is a placeholder - actual SIP testing logic would go here.
    Creates its own DB session to avoid lifecycle issues.
    """
    from app.database import AsyncSessionLocal
    
    # Create new session for background task
    async with AsyncSessionLocal() as db:
        try:
            # Fetch test run
            result = await db.execute(select(TestRun).where(TestRun.id == test_run_id))
            test_run = result.scalar_one_or_none()
            
            if not test_run:
                return
            
            # Update status to running
            test_run.status = "running"
            await db.commit()
            
            # Simulate test execution
            # TODO: Implement actual SIP testing logic (registration, call, message)
            steps = [
                {"step": "connect", "status": "success", "message": "Connected to SIP server"},
                {"step": "register", "status": "success", "message": "Registration successful"},
                {"step": "call", "status": "success", "message": "Call completed"},
            ]
            
            for step in steps:
                test_result = TestResult(
                    test_run_id=test_run_id,
                    step_name=step["step"],
                    status=step["status"],
                    message=step["message"],
                    details={}
                )
                db.add(test_result)
            
            # Update test run status
            test_run.status = "completed"
            test_run.completed_at = datetime.now(timezone.utc)
            
            await db.commit()
        except Exception as e:
            # Log error and mark test as failed
            await db.rollback()
            if test_run:
                test_run.status = "failed"
                await db.commit()


@router.post("/run", response_model=TestRunResponse, status_code=status.HTTP_202_ACCEPTED)
async def run_test(
    test_data: TestRunCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Execute a SIP test (async)."""
    # Validate credential access
    if test_data.credential_id:
        result = await db.execute(
            select(SIPCredential).where(SIPCredential.id == test_data.credential_id)
        )
        credential = result.scalar_one_or_none()
        
        if not credential:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credential not found"
            )
        
        if credential.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to credential"
            )
    
    # Create test run
    test_run = TestRun(
        organization_id=current_user.organization_id,
        credential_id=test_data.credential_id,
        test_type=test_data.test_type,
        status="pending",
        created_by=current_user.id,
        metadata=test_data.metadata
    )
    db.add(test_run)
    await db.commit()
    await db.refresh(test_run)
    
    # Execute test in background (creates its own DB session)
    background_tasks.add_task(execute_sip_test, test_run.id)
    
    return test_run


@router.get("/runs", response_model=list[TestRunResponse])
async def list_test_runs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List test runs for current user's organization."""
    result = await db.execute(
        select(TestRun)
        .where(TestRun.organization_id == current_user.organization_id)
        .order_by(TestRun.started_at.desc())
    )
    test_runs = result.scalars().all()
    return test_runs


@router.get("/runs/{test_run_id}", response_model=TestRunResponse)
async def get_test_run(
    test_run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get test run details."""
    result = await db.execute(select(TestRun).where(TestRun.id == test_run_id))
    test_run = result.scalar_one_or_none()
    
    if not test_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test run not found"
        )
    
    if test_run.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return test_run


@router.get("/results/{test_run_id}", response_model=list[TestResultResponse])
async def get_test_results(
    test_run_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get test results for a test run."""
    # First check access to test run
    result = await db.execute(select(TestRun).where(TestRun.id == test_run_id))
    test_run = result.scalar_one_or_none()
    
    if not test_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test run not found"
        )
    
    if test_run.organization_id != current_user.organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get results
    result = await db.execute(
        select(TestResult)
        .where(TestResult.test_run_id == test_run_id)
        .order_by(TestResult.timestamp)
    )
    results = result.scalars().all()
    
    return results
