"""Test Run and Test Result models."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class TestRun(Base):
    """Test Run model."""
    
    __tablename__ = "test_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    credential_id = Column(UUID(as_uuid=True), ForeignKey("sip_credentials.id", ondelete="SET NULL"))
    test_type = Column(String(50), nullable=False)  # e.g., 'registration', 'call', 'message'
    status = Column(String(50), default="pending", nullable=False)  # pending, running, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    metadata = Column(JSONB, default={}, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="test_runs")
    credential = relationship("SIPCredential", back_populates="test_runs")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_test_runs")
    results = relationship("TestResult", back_populates="test_run", cascade="all, delete-orphan")


class TestResult(Base):
    """Test Result model."""
    
    __tablename__ = "test_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id = Column(UUID(as_uuid=True), ForeignKey("test_runs.id", ondelete="CASCADE"), nullable=False)
    step_name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)  # success, failure, warning
    message = Column(Text)
    details = Column(JSONB, default={}, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    test_run = relationship("TestRun", back_populates="results")
