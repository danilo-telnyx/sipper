"""Test Run and Test Result schemas."""
from datetime import datetime
from uuid import UUID
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


# Supported SIP test types
SIPTestType = Literal[
    "INVITE",
    "REGISTER",
    "OPTIONS",
    "REFER",
    "BYE",
    "CANCEL",
    "RECORDING_INVITE"
]


class RecordingSessionParams(BaseModel):
    """Recording session parameters (RFC 7865)."""
    session_id: str = Field(..., description="UUID for recording session")
    reason: Literal["Legal", "QualityAssurance", "Training", "CustomerApproval"] = "QualityAssurance"
    recording_uri: str | None = Field(None, description="SIP URI of Session Recording Server (SRS)")
    mode: Literal["always", "never", "on-demand"] = "always"


class REFERParams(BaseModel):
    """REFER method parameters (RFC 3515)."""
    refer_to: str = Field(..., description="Target URI for transfer")
    referred_by: str | None = Field(None, description="URI of referrer")
    replaces: str | None = Field(None, description="Call-ID for attended transfer (RFC 3891)")


class AdHocCredentials(BaseModel):
    """Ad-hoc SIP credentials (not saved)."""
    domain: str = Field(..., description="SIP domain")
    username: str = Field(..., description="SIP username")
    password: str = Field(..., description="SIP password")
    port: int = Field(5060, description="SIP port")
    transport: Literal["UDP", "TCP", "TLS"] = Field("UDP", description="Transport protocol")


class TestRunBase(BaseModel):
    """Base test run schema."""
    test_type: SIPTestType = Field(..., description="SIP method to test")
    credential_id: UUID | None = Field(None, description="Optional SIP credentials (null for unauthenticated)")
    ad_hoc_credentials: AdHocCredentials | None = Field(None, description="Ad-hoc credentials (not saved)")
    authenticated: bool = Field(False, description="Use authentication (requires credential_id or ad_hoc_credentials)")
    
    # Method-specific parameters
    refer_params: REFERParams | None = Field(None, description="Required for REFER tests")
    recording_params: RecordingSessionParams | None = Field(None, description="Required for RECORDING_INVITE tests")
    
    # Optional SIP parameters
    sdp_body: str | None = Field(None, description="Custom SDP body for INVITE")
    expires: int | None = Field(3600, description="Expiration time for REGISTER (seconds)")
    
    # Generic metadata
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
