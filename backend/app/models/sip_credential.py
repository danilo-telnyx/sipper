"""SIP Credential model."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, LargeBinary
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class SIPCredential(Base):
    """SIP Credential model with encrypted password."""
    
    __tablename__ = "sip_credentials"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    sip_domain = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    password_encrypted = Column(LargeBinary, nullable=False)
    port = Column(Integer, default=5060, nullable=False)
    transport = Column(String(10), default="UDP", nullable=False)  # UDP, TCP, TLS
    outbound_proxy = Column(String(255), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="sip_credentials")
    creator = relationship("User", foreign_keys=[created_by], back_populates="created_credentials")
    test_runs = relationship("TestRun", back_populates="credential")
