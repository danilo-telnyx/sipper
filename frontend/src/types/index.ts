// User & Auth Types
export type UserRole = 'user' | 'admin' | 'org-admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  organizationId: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  organizationName?: string
}

// Organization Types
export interface Organization {
  id: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  maxUsers: number
  maxCredentials: number
  createdAt: string
  settings: OrganizationSettings
}

export interface OrganizationSettings {
  allowPublicTests: boolean
  retentionDays: number
  notificationEmail: string
}

// SIP Credential Types
export interface SipCredential {
  id: string
  name: string
  username: string
  password: string
  domain: string
  proxy?: string
  port: number
  transport: 'UDP' | 'TCP' | 'TLS'
  organizationId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  lastTestedAt?: string
  isActive: boolean
}

export interface CreateCredentialRequest {
  name: string
  username: string
  password: string
  domain: string
  proxy?: string
  port: number
  transport: 'UDP' | 'TCP' | 'TLS'
}

// Test Types
export type TestType = 
  | 'basic-registration'
  | 'authentication'
  | 'call-flow'
  | 'codec-negotiation'
  | 'dtmf'
  | 'hold-resume'
  | 'transfer'
  | 'conference'
  | 'rfc-compliance'

export type TestStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface TestConfiguration {
  credentialId: string
  testType: TestType
  endpoint?: string
  duration?: number
  callCount?: number
  concurrentCalls?: number
  codec?: string[]
  customScenario?: string
}

export interface TestResult {
  id: string
  credentialId: string
  credentialName: string
  testType: TestType
  status: TestStatus
  startedAt: string
  completedAt?: string
  duration: number
  success: boolean
  score: number // 0-100
  details: TestDetails
  rfcCompliance: RfcComplianceResult[]
  timings: TestTiming[]
  logs: TestLog[]
  organizationId: string
  userId: string
}

export interface TestDetails {
  summary: string
  successRate: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageLatency: number
  maxLatency: number
  minLatency: number
  errors: TestError[]
  warnings: TestWarning[]
}

export interface RfcComplianceResult {
  rfc: string
  section: string
  requirement: string
  compliant: boolean
  details: string
  severity: 'critical' | 'warning' | 'info'
}

export interface TestTiming {
  timestamp: string
  event: string
  duration: number
  success: boolean
}

export interface TestLog {
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  sipMessage?: string
}

export interface TestError {
  code: string
  message: string
  timestamp: string
  sipResponse?: string
}

export interface TestWarning {
  code: string
  message: string
  timestamp: string
}

// Real-time test progress
export interface TestProgress {
  testId: string
  status: TestStatus
  progress: number // 0-100
  currentStep: string
  message: string
  timestamp: string
}

// Dashboard Stats
export interface DashboardStats {
  totalTests: number
  successfulTests: number
  failedTests: number
  averageScore: number
  activeCredentials: number
  recentTests: TestResult[]
  testsByType: Record<TestType, number>
  successRateHistory: {
    date: string
    successRate: number
  }[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Export formats
export type ExportFormat = 'json' | 'csv'

export interface ExportRequest {
  testIds?: string[]
  startDate?: string
  endDate?: string
  format: ExportFormat
  includeDetails?: boolean
}

// SIP Test Builder Types (Sprint 2)
export * from './sip'
