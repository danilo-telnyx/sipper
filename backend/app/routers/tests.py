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
    Background task to execute SIP test via Node.js SIP Engine.
    Creates its own DB session to avoid lifecycle issues.
    """
    from app.database import AsyncSessionLocal
    from app.sip_engine_client import get_sip_engine_client
    
    # Create new session for background task
    async with AsyncSessionLocal() as db:
        try:
            # Fetch test run and credential
            result = await db.execute(
                select(TestRun, SIPCredential)
                .outerjoin(SIPCredential, TestRun.credential_id == SIPCredential.id)
                .where(TestRun.id == test_run_id)
            )
            row = result.first()
            
            if not row:
                return
            
            test_run, credential = row
            
            # Update status to running
            test_run.status = "running"
            await db.commit()
            
            # Prepare SIP engine client
            sip_client = get_sip_engine_client()
            
            # Build credentials payload
            credentials = None
            if credential:
                credentials = {
                    "username": credential.username,
                    "password": credential.password,
                    "host": credential.domain,
                    "domain": credential.domain,
                    "port": credential.port or 5060
                }
            
            # Get test config from metadata
            config = test_run.metadata or {}
            
            # Map test type to SIP engine test type
            test_type_map = {
                "registration": "register",
                "call": "call",
                "message": "options"  # Using OPTIONS as message placeholder
            }
            sip_test_type = test_type_map.get(test_run.test_type, test_run.test_type)
            
            # Execute test via SIP engine
            result = await sip_client.run_test(
                test_type=sip_test_type,
                credentials=credentials,
                config=config
            )
            
            # Store test messages as results
            for msg in result.get("messages", []):
                direction = msg.get("direction", "unknown")
                method = msg.get("method") or msg.get("statusCode", "unknown")
                
                test_result = TestResult(
                    test_run_id=test_run_id,
                    step_name=f"{direction}_{method}",
                    status="success" if result.get("success") else "warning",
                    message=str(msg),
                    details={"message": msg}
                )
                db.add(test_result)
            
            # Store errors
            for error in result.get("errors", []):
                test_result = TestResult(
                    test_run_id=test_run_id,
                    step_name="error",
                    status="error",
                    message=error,
                    details={}
                )
                db.add(test_result)
            
            # Store RFC violations
            for violation in result.get("violations", []):
                test_result = TestResult(
                    test_run_id=test_run_id,
                    step_name="rfc_violation",
                    status="warning",
                    message=violation,
                    details={}
                )
                db.add(test_result)
            
            # Store summary
            summary_result = TestResult(
                test_run_id=test_run_id,
                step_name="summary",
                status="success" if result.get("success") else "failed",
                message=f"Test {result.get('testName')} completed in {result.get('duration')}ms",
                details={
                    "metrics": result.get("metrics", {}),
                    "duration": result.get("duration"),
                    "passed": result.get("success")
                }
            )
            db.add(summary_result)
            
            # Update test run status
            test_run.status = "completed" if result.get("success") else "failed"
            test_run.completed_at = datetime.now(timezone.utc)
            
            await db.commit()
            
        except Exception as e:
            # Log error and mark test as failed
            print(f"Test execution error: {str(e)}")
            await db.rollback()
            
            # Try to mark as failed
            try:
                result = await db.execute(select(TestRun).where(TestRun.id == test_run_id))
                test_run = result.scalar_one_or_none()
                if test_run:
                    test_run.status = "failed"
                    
                    # Add error result
                    error_result = TestResult(
                        test_run_id=test_run_id,
                        step_name="execution_error",
                        status="error",
                        message=str(e),
                        details={"exception": str(e)}
                    )
                    db.add(error_result)
                    
                    await db.commit()
            except Exception:
                pass  # Best effort


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
