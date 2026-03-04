"""Test Run and Test Result schemas."""
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class TestRunBase(BaseModel):
    """Base test run schema."""
    test_type: str
    credential_id: UUID | None = None
    metadata: dict = {}


class TestRunCreate(TestRunBase):
    """Test run creation schema."""
    pass


class TestRunResponse(TestRunBase):
    """Test run response schema."""
    id: UUID
    organization_id: UUID
    status: str
    started_at: datetime
    completed_at: datetime | None
    created_by: UUID | None
    
    model_config = ConfigDict(from_attributes=True)


class TestResultResponse(BaseModel):
    """Test result response schema."""
    id: UUID
    test_run_id: UUID
    step_name: str
    status: str
    message: str | None
    details: dict
    timestamp: datetime
    
    model_config = ConfigDict(from_attributes=True)
