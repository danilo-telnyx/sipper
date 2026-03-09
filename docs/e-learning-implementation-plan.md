# E-Learning Platform Implementation Plan

## Overview
Add comprehensive SIP training and certification system to Sipper with 3-level courses, quizzes, exams, and certificate generation.

## Architecture

### Data Model

#### 1. Course Level
- **Course**: Basic, Intermediate, Advanced (3 levels)
  - id (UUID, PK)
  - level (enum: basic, intermediate, advanced)
  - title (string)
  - description (text)
  - order (int)
  - is_active (boolean)
  - created_at, updated_at

#### 2. Course Content
- **Section**: Content pages/sections within a course
  - id (UUID, PK)
  - course_id (UUID, FK → Course)
  - title (string)
  - content (text/markdown)
  - order (int)
  - created_at, updated_at

#### 3. Assessment
- **Question**: Quiz and exam questions
  - id (UUID, PK)
  - course_id (UUID, FK → Course)
  - question_text (text)
  - question_type (enum: multiple_choice, true_false)
  - options (JSON array)
  - correct_answer (string)
  - explanation (text, optional)
  - is_exam_question (boolean)
  - order (int)
  - created_at, updated_at

- **Quiz**: Auto-generated every 3 sections
  - id (UUID, PK)
  - course_id (UUID, FK → Course)
  - title (string)
  - section_order (int) - appears after section N
  - question_count (int = 5)

#### 4. User Progress
- **UserProgress**: Track section completion
  - id (UUID, PK)
  - user_id (UUID, FK → User)
  - course_id (UUID, FK → Course)
  - section_id (UUID, FK → Section)
  - completed (boolean)
  - completed_at (datetime)

- **QuizAttempt**: User quiz attempts
  - id (UUID, PK)
  - user_id (UUID, FK → User)
  - course_id (UUID, FK → Course)
  - quiz_number (int)
  - answers (JSON)
  - score (int)
  - passed (boolean)
  - attempted_at (datetime)

- **ExamAttempt**: User exam attempts
  - id (UUID, PK)
  - user_id (UUID, FK → User)
  - course_id (UUID, FK → Course)
  - answers (JSON)
  - score (int)
  - passed (boolean) - 70% threshold
  - attempted_at (datetime)

#### 5. Certification
- **Certificate**: Generated certificates
  - id (UUID, PK)
  - user_id (UUID, FK → User)
  - course_id (UUID, FK → Course)
  - certificate_number (string, unique)
  - issued_at (datetime)
  - pdf_path (string, optional)

## Backend Implementation

### Models (~/backend/app/models/)
1. `course.py` - Course model
2. `section.py` - Section model
3. `question.py` - Question model
4. `user_progress.py` - UserProgress, QuizAttempt, ExamAttempt models
5. `certificate.py` - Certificate model

### Schemas (~/backend/app/schemas/)
1. `course.py` - Course schemas (Create, Update, Response)
2. `section.py` - Section schemas
3. `question.py` - Question schemas
4. `progress.py` - Progress and attempt schemas
5. `certificate.py` - Certificate schemas

### Routers (~/backend/app/routers/)
1. `elearning/courses.py` - Course CRUD, listing
2. `elearning/sections.py` - Section CRUD
3. `elearning/questions.py` - Question CRUD (admin only)
4. `elearning/progress.py` - User progress tracking
5. `elearning/quiz.py` - Quiz submission and grading
6. `elearning/exam.py` - Exam submission and grading
7. `elearning/certificates.py` - Certificate generation and download
8. `elearning/admin.py` - Admin dashboard (stats, user results, management)

### Utilities
1. `utils/certificate_generator.py` - PDF certificate generation (ReportLab)
2. `utils/quiz_builder.py` - Auto-generate quizzes every 3 sections

## Frontend Implementation

### Pages (~/frontend/src/pages/elearning/)
1. `CoursesListPage.tsx` - List all 3 levels, progress indicators
2. `CourseContentPage.tsx` - Display sections, track progress, show quizzes
3. `QuizPage.tsx` - Quiz interface (5 questions)
4. `ExamPage.tsx` - Exam interface (15 questions)
5. `CertificatesPage.tsx` - View/download certificates
6. `AdminDashboardPage.tsx` - Course management, user stats, question organizer
7. `AdminStatsPage.tsx` - Analytics and reporting

### Components (~/frontend/src/components/elearning/)
1. `CourseCard.tsx` - Course level card with progress
2. `SectionViewer.tsx` - Markdown content viewer
3. `QuizQuestion.tsx` - Question component (multiple choice/true-false)
4. `ProgressBar.tsx` - Visual progress indicator
5. `QuizResults.tsx` - Results display with feedback
6. `ExamResults.tsx` - Exam results with pass/fail
7. `CertificateCard.tsx` - Certificate display/download
8. `AdminQuestionOrganizer.tsx` - Drag-drop question organization
9. `AdminUserStats.tsx` - User results table

### Services (~/frontend/src/services/)
1. `elearningService.ts` - API calls for courses, progress, quizzes, exams, certificates

## Features Breakdown

### User Features
✅ Course browsing (3 levels)
✅ Section reading with progress tracking
✅ Automatic quizzes every 3 sections (5 questions)
✅ Final exam per level (15 questions)
✅ 70% pass threshold
✅ Certificate generation on pass
✅ Certificate download (PDF)
✅ Personal learning dashboard

### Admin Features (danilo@telnyx.com + admin role)
✅ Course organizer (create/edit courses and sections)
✅ Question bank management
✅ Branched question flows (organize by course level)
✅ View all user results
✅ Analytics dashboard
✅ Preview outcomes
✅ Full course management

## Implementation Steps

### Phase 1: Data Model & Backend Core (Today)
1. ✅ Create all models
2. ✅ Create Alembic migration
3. ✅ Create all schemas
4. ✅ Build core CRUD routers
5. ✅ Test with sample data

### Phase 2: User Learning Flow (Today)
1. ✅ Progress tracking endpoints
2. ✅ Quiz submission & grading
3. ✅ Exam submission & grading
4. ✅ Certificate generation
5. ✅ Frontend course list page
6. ✅ Frontend course content viewer
7. ✅ Frontend quiz/exam interface

### Phase 3: Admin Dashboard (Today)
1. ✅ Admin endpoints (stats, user results)
2. ✅ Question organizer endpoints
3. ✅ Frontend admin dashboard
4. ✅ Frontend question management
5. ✅ Frontend analytics

### Phase 4: Polish & Testing (Today)
1. ✅ PDF certificate styling
2. ✅ Email notifications (optional)
3. ✅ E2E testing
4. ✅ Documentation
5. ✅ Deployment

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy (async), Alembic
- **Frontend**: React, TypeScript, TailwindCSS
- **Database**: PostgreSQL
- **PDF Generation**: ReportLab or WeasyPrint
- **Auth**: Existing JWT + RBAC

## Security Considerations
- Quiz/exam answers encrypted in DB
- Rate limiting on quiz/exam submissions
- Admin-only endpoints protected by RBAC
- Certificate verification (unique certificate numbers)

## Success Criteria
✅ 3-level course structure working
✅ Automatic quiz generation every 3 sections
✅ Exam grading with 70% threshold
✅ Certificate PDF generation
✅ Admin can manage all content
✅ Admin can view all user results
✅ Full progress tracking
✅ Production-ready code quality
