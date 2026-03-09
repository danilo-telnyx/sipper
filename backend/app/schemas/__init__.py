"""Pydantic schemas for request/response validation."""
from app.schemas.auth import TokenResponse, LoginRequest, RegisterRequest, RefreshRequest, UserData
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.organization import OrganizationCreate, OrganizationUpdate, OrganizationResponse
from app.schemas.role import RoleCreate, RoleResponse, PermissionResponse
from app.schemas.credential import SIPCredentialCreate, SIPCredentialUpdate, SIPCredentialResponse
from app.schemas.test import TestRunCreate, TestRunResponse, TestResultResponse
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse, CourseWithSections, CourseProgress,
    SectionCreate, SectionUpdate, SectionResponse
)
from app.schemas.question import (
    QuestionCreate, QuestionUpdate, QuestionResponse, QuestionForUser, 
    QuizQuestion, ExamQuestion
)
from app.schemas.progress import (
    ProgressMarkComplete, ProgressResponse,
    QuizSubmission, QuizResult, QuizAttemptResponse,
    ExamSubmission, ExamResult, ExamAttemptResponse,
    UserDashboard
)
from app.schemas.certificate import CertificateResponse, CertificateWithDetails, CertificateVerify

__all__ = [
    "TokenResponse",
    "LoginRequest",
    "RegisterRequest",
    "RefreshRequest",
    "UserData",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "OrganizationCreate",
    "OrganizationUpdate",
    "OrganizationResponse",
    "RoleCreate",
    "RoleResponse",
    "PermissionResponse",
    "SIPCredentialCreate",
    "SIPCredentialUpdate",
    "SIPCredentialResponse",
    "TestRunCreate",
    "TestRunResponse",
    "TestResultResponse",
    # E-Learning schemas
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "CourseWithSections",
    "CourseProgress",
    "SectionCreate",
    "SectionUpdate",
    "SectionResponse",
    "QuestionCreate",
    "QuestionUpdate",
    "QuestionResponse",
    "QuestionForUser",
    "QuizQuestion",
    "ExamQuestion",
    "ProgressMarkComplete",
    "ProgressResponse",
    "QuizSubmission",
    "QuizResult",
    "QuizAttemptResponse",
    "ExamSubmission",
    "ExamResult",
    "ExamAttemptResponse",
    "UserDashboard",
    "CertificateResponse",
    "CertificateWithDetails",
    "CertificateVerify",
]
