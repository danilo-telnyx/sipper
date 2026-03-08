"""Dashboard statistics endpoints."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.database import get_db
from app.models import User, TestRun, TestResult, SIPCredential
from app.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    date_range: str = Query("30d", regex="^(7d|30d|90d|all)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get dashboard statistics for current user's organization."""
    
    # Calculate date filter
    now = datetime.now(timezone.utc)
    date_filters = {
        "7d": now - timedelta(days=7),
        "30d": now - timedelta(days=30),
        "90d": now - timedelta(days=90),
        "all": datetime(2000, 1, 1, tzinfo=timezone.utc),
    }
    start_date = date_filters.get(date_range, date_filters["30d"])
    
    org_id = current_user.organization_id
    
    # Total tests
    total_tests_query = select(func.count(TestRun.id)).where(
        and_(
            TestRun.organization_id == org_id,
            TestRun.started_at >= start_date
        )
    )
    total_tests_result = await db.execute(total_tests_query)
    total_tests = total_tests_result.scalar() or 0
    
    # Completed tests
    completed_tests_query = select(func.count(TestRun.id)).where(
        and_(
            TestRun.organization_id == org_id,
            TestRun.started_at >= start_date,
            TestRun.status == "completed"
        )
    )
    completed_tests_result = await db.execute(completed_tests_query)
    completed_tests = completed_tests_result.scalar() or 0
    
    # Failed tests
    failed_tests_query = select(func.count(TestRun.id)).where(
        and_(
            TestRun.organization_id == org_id,
            TestRun.started_at >= start_date,
            TestRun.status == "failed"
        )
    )
    failed_tests_result = await db.execute(failed_tests_query)
    failed_tests = failed_tests_result.scalar() or 0
    
    # Success rate
    success_rate = (completed_tests / total_tests * 100) if total_tests > 0 else 0
    
    # Active credentials
    active_credentials_query = select(func.count(SIPCredential.id)).where(
        SIPCredential.organization_id == org_id
    )
    active_credentials_result = await db.execute(active_credentials_query)
    active_credentials = active_credentials_result.scalar() or 0
    
    # RFC compliance score (average from test results)
    # This is a placeholder - would need to calculate from actual RFC validation
    avg_score = 0
    if total_tests > 0:
        # Count successful test results vs total
        successful_results_query = select(func.count(TestResult.id)).join(
            TestRun, TestResult.test_run_id == TestRun.id
        ).where(
            and_(
                TestRun.organization_id == org_id,
                TestRun.started_at >= start_date,
                TestResult.status == "success"
            )
        )
        successful_results_result = await db.execute(successful_results_query)
        successful_results = successful_results_result.scalar() or 0
        
        total_results_query = select(func.count(TestResult.id)).join(
            TestRun, TestResult.test_run_id == TestRun.id
        ).where(
            and_(
                TestRun.organization_id == org_id,
                TestRun.started_at >= start_date
            )
        )
        total_results_result = await db.execute(total_results_query)
        total_results = total_results_result.scalar() or 0
        
        avg_score = (successful_results / total_results * 100) if total_results > 0 else 0
    
    # Recent tests (last 10)
    recent_tests_query = select(TestRun).where(
        TestRun.organization_id == org_id
    ).order_by(TestRun.started_at.desc()).limit(10)
    recent_tests_result = await db.execute(recent_tests_query)
    recent_tests_raw = recent_tests_result.scalars().all()
    
    # Format recent tests
    recent_tests = []
    for test in recent_tests_raw:
        # Get credential name if exists
        credential_name = None
        if test.credential_id:
            cred_query = select(SIPCredential.name).where(SIPCredential.id == test.credential_id)
            cred_result = await db.execute(cred_query)
            credential_name = cred_result.scalar()
        
        recent_tests.append({
            "id": str(test.id),
            "testType": test.test_type,
            "status": test.status,
            "credentialName": credential_name or "Ad-hoc",
            "startedAt": test.started_at.isoformat(),
            "completedAt": test.completed_at.isoformat() if test.completed_at else None,
            "duration": int((test.completed_at - test.started_at).total_seconds()) if test.completed_at else None
        })
    
    # Test activity by day (last 30 days for chart)
    chart_start = now - timedelta(days=30)
    activity_query = select(
        func.date(TestRun.started_at).label("date"),
        func.count(TestRun.id).label("count")
    ).where(
        and_(
            TestRun.organization_id == org_id,
            TestRun.started_at >= chart_start
        )
    ).group_by(func.date(TestRun.started_at)).order_by(func.date(TestRun.started_at))
    
    activity_result = await db.execute(activity_query)
    activity_data = activity_result.all()
    
    chart_data = [
        {
            "date": str(row.date),
            "tests": row.count
        }
        for row in activity_data
    ]
    
    return {
        "totalTests": total_tests,
        "successRate": round(success_rate, 1),
        "avgScore": round(avg_score, 1),
        "activeCredentials": active_credentials,
        "failedTests": failed_tests,
        "completedTests": completed_tests,
        "recentTests": recent_tests,
        "chartData": chart_data,
        "dateRange": date_range,
        "generatedAt": now.isoformat()
    }
