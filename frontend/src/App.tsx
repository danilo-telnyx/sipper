import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ELearningProvider } from './contexts/ELearningContext'
import { ELearningAdminProvider } from './contexts/ELearningAdminContext'
import { Toaster } from './components/ui/toaster'
import { AuthLayout } from './components/layouts/AuthLayout'
import { DashboardLayout } from './components/layouts/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Spinner } from './components/ui/spinner'

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const CredentialsPage = lazy(() => import('./pages/CredentialsPage').then(m => ({ default: m.CredentialsPage })))
const TestRunnerPage = lazy(() => import('./pages/TestRunnerPage').then(m => ({ default: m.TestRunnerPage })))
const SIPTestBuilderPage = lazy(() => import('./pages/SIPTestBuilderPage').then(m => ({ default: m.SIPTestBuilderPage })))
const FlowVisualizationDemoPage = lazy(() => import('./pages/FlowVisualizationDemoPage').then(m => ({ default: m.FlowVisualizationDemoPage })))
const DocumentationPage = lazy(() => import('./pages/docs/DocumentationPage').then(m => ({ default: m.DocumentationPage })))
const TestResultsPage = lazy(() => import('./pages/TestResultsPage').then(m => ({ default: m.TestResultsPage })))
const TestResultDetailPage = lazy(() => import('./pages/TestResultDetailPage').then(m => ({ default: m.TestResultDetailPage })))
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })))
const OrganizationPage = lazy(() => import('./pages/OrganizationPage').then(m => ({ default: m.OrganizationPage })))

// E-Learning pages (new dual-persona architecture)
const RoleSelection = lazy(() => import('./pages/elearning/RoleSelection'))
const AdminShell = lazy(() => import('./pages/elearning/AdminShell'))
const LearnerShell = lazy(() => import('./pages/elearning/LearnerShell'))

// E-Learning pages (old - kept for backward compatibility)
const CoursesListPage = lazy(() => import('./pages/elearning/CoursesListPage'))
const CourseContentPage = lazy(() => import('./pages/elearning/CourseContentPage'))
const ExamPage = lazy(() => import('./pages/elearning/ExamPage'))
const CertificatesPage = lazy(() => import('./pages/elearning/CertificatesPage'))
const AdminPage = lazy(() => import('./pages/elearning/AdminPage'))

import './App.css'

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ELearningProvider>
          <ELearningAdminProvider>
            <Routes>
              {/* Root redirect to dashboard or login */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />

              {/* Auth Routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
                <Route path="/register" element={<Suspense fallback={<PageLoader />}><RegisterPage /></Suspense>} />
              </Route>

              {/* Protected Dashboard Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><DashboardPage /></Suspense>} />
                <Route path="/credentials" element={<Suspense fallback={<PageLoader />}><CredentialsPage /></Suspense>} />
                <Route path="/test-runner" element={<Suspense fallback={<PageLoader />}><TestRunnerPage /></Suspense>} />
                <Route path="/sip-test-builder" element={<Suspense fallback={<PageLoader />}><SIPTestBuilderPage /></Suspense>} />
                <Route path="/flow-visualization" element={<Suspense fallback={<PageLoader />}><FlowVisualizationDemoPage /></Suspense>} />
                <Route path="/documentation" element={<Suspense fallback={<PageLoader />}><DocumentationPage /></Suspense>} />
                <Route path="/test-results" element={<Suspense fallback={<PageLoader />}><TestResultsPage /></Suspense>} />
                <Route path="/test-results/:id" element={<Suspense fallback={<PageLoader />}><TestResultDetailPage /></Suspense>} />
                
                {/* E-Learning Routes (NEW dual-persona architecture) */}
                <Route path="/elearning" element={<Suspense fallback={<PageLoader />}><RoleSelection /></Suspense>} />
                <Route path="/elearning/admin" element={<Suspense fallback={<PageLoader />}><AdminShell /></Suspense>} />
                <Route path="/elearning/learner" element={<Suspense fallback={<PageLoader />}><LearnerShell /></Suspense>} />
                
                {/* E-Learning Routes (OLD - kept for backward compatibility) */}
                <Route path="/elearning/courses" element={<Suspense fallback={<PageLoader />}><CoursesListPage /></Suspense>} />
                <Route path="/elearning/courses/:courseId" element={<Suspense fallback={<PageLoader />}><CourseContentPage /></Suspense>} />
                <Route path="/elearning/exam/:courseId" element={<Suspense fallback={<PageLoader />}><ExamPage /></Suspense>} />
                <Route path="/elearning/certificates" element={<Suspense fallback={<PageLoader />}><CertificatesPage /></Suspense>} />
                <Route path="/elearning/admin-old" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
                
                {/* Admin Routes */}
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requireRole={['admin', 'org-admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <UsersPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
                
                {/* Org Admin Routes */}
                <Route
                  path="/organization"
                  element={
                    <ProtectedRoute requireRole={['org-admin']}>
                      <Suspense fallback={<PageLoader />}>
                        <OrganizationPage />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 - Catch all */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
                      <p className="text-muted-foreground mb-4">Page not found</p>
                      <a
                        href="/dashboard"
                        className="text-primary hover:underline"
                      >
                        Go to Dashboard
                      </a>
                    </div>
                  </div>
                }
              />
            </Routes>

            {/* Global Toast Notifications */}
            <Toaster />
          </ELearningAdminProvider>
        </ELearningProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
