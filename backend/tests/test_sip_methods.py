"""Tests for enhanced SIP methods (REFER, REC, unauthenticated)."""
import pytest
from app.schemas.test import TestRunCreate, REFERParams, RecordingSessionParams


def test_refer_params_validation():
    """Test REFER parameter validation."""
    # Valid REFER params
    refer = REFERParams(
        refer_to="sip:charlie@example.com",
        referred_by="sip:alice@example.com",
        replaces="call-id-123;to-tag=abc;from-tag=def"
    )
    assert refer.refer_to == "sip:charlie@example.com"
    assert refer.replaces is not None
    
    # Missing required refer_to
    with pytest.raises(ValueError):
        REFERParams(referred_by="sip:alice@example.com")


def test_recording_params_validation():
    """Test Recording Session parameter validation."""
    # Valid recording params
    rec = RecordingSessionParams(
        session_id="550e8400-e29b-41d4-a716-446655440000",
        reason="Legal",
        mode="always"
    )
    assert rec.reason == "Legal"
    assert rec.mode == "always"
    
    # Invalid reason
    with pytest.raises(ValueError):
        RecordingSessionParams(
            session_id="test-123",
            reason="InvalidReason"  # Not in allowed list
        )


def test_unauthenticated_test_run():
    """Test creating unauthenticated test run."""
    test_run = TestRunCreate(
        test_type="INVITE",
        authenticated=False,
        credential_id=None  # No credentials needed
    )
    assert test_run.authenticated is False
    assert test_run.credential_id is None


def test_authenticated_test_run():
    """Test creating authenticated test run."""
    from uuid import uuid4
    cred_id = uuid4()
    
    test_run = TestRunCreate(
        test_type="REGISTER",
        authenticated=True,
        credential_id=cred_id
    )
    assert test_run.authenticated is True
    assert test_run.credential_id == cred_id


def test_refer_test_run():
    """Test REFER test run creation."""
    test_run = TestRunCreate(
        test_type="REFER",
        authenticated=True,
        refer_params=REFERParams(
            refer_to="sip:transfertarget@example.com"
        )
    )
    assert test_run.test_type == "REFER"
    assert test_run.refer_params.refer_to == "sip:transfertarget@example.com"


def test_recording_test_run():
    """Test Recording INVITE test run creation."""
    test_run = TestRunCreate(
        test_type="RECORDING_INVITE",
        authenticated=True,
        recording_params=RecordingSessionParams(
            session_id="550e8400-e29b-41d4-a716-446655440000",
            reason="QualityAssurance",
            recording_uri="sip:srs@recording.example.com"
        )
    )
    assert test_run.test_type == "RECORDING_INVITE"
    assert test_run.recording_params.reason == "QualityAssurance"


def test_test_type_validation():
    """Test SIP method type validation."""
    valid_types = ["INVITE", "REGISTER", "OPTIONS", "REFER", "BYE", "CANCEL", "RECORDING_INVITE"]
    
    for test_type in valid_types:
        test_run = TestRunCreate(test_type=test_type, authenticated=False)
        assert test_run.test_type == test_type
    
    # Invalid type should fail
    with pytest.raises(ValueError):
        TestRunCreate(test_type="INVALID_METHOD", authenticated=False)
