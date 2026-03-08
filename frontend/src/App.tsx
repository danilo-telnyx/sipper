import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import { AuthLayout } from './components/layouts/AuthLayout'
import { DashboardLayout } from './components/layouts/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

// Dashboard Pages
import { DashboardPage } from './pages/DashboardPage'
import { CredentialsPage } from './pages/CredentialsPage'
import { TestRunnerPage } from './pages/TestRunnerPage'
import { SIPTestBuilderPage } from './pages/SIPTestBuilderPage'
import { TestResultsPage } from './pages/TestResultsPage'
import { TestResultDetailPage } from './pages/TestResultDetailPage'
import { UsersPage } from './pages/UsersPage'
import { OrganizationPage } from './pages/OrganizationPage'

import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/test-runner" element={<TestRunnerPage />} />
            <Route path="/sip-test-builder" element={<SIPTestBuilderPage />} />
            <Route path="/test-results" element={<TestResultsPage />} />
            <Route path="/test-results/:id" element={<TestResultDetailPage />} />
            
            {/* Admin Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute requireRole={['admin', 'org-admin']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            
            {/* Org Admin Routes */}
            <Route
              path="/organization"
              element={
                <ProtectedRoute requireRole={['org-admin']}>
                  <OrganizationPage />
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
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
