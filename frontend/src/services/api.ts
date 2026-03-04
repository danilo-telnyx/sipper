import { useAuthStore } from '@/store/auth'
import type {
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Organization,
  SipCredential,
  CreateCredentialRequest,
  TestConfiguration,
  TestResult,
  DashboardStats,
  ExportRequest,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = useAuthStore.getState().token

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    useAuthStore.getState().clearAuth()
    window.location.href = '/login'
    throw new ApiError(401, 'Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }))
    throw new ApiError(response.status, error.error || error.message || 'An error occurred')
  }

  return response.json()
}

// Auth API
export const authApi = {
  login: (data: LoginRequest) =>
    request<ApiResponse<AuthResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: RegisterRequest) =>
    request<ApiResponse<AuthResponse>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<ApiResponse<void>>('/auth/logout', {
      method: 'POST',
    }),

  refreshToken: (refreshToken: string) =>
    request<ApiResponse<{ token: string }>>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  me: () => request<ApiResponse<User>>('/auth/me'),
}

// Users API
export const usersApi = {
  list: (params?: { page?: number; pageSize?: number; search?: string }) =>
    request<PaginatedResponse<User>>(
      `/users?${new URLSearchParams(params as any).toString()}`
    ),

  get: (id: string) => request<ApiResponse<User>>(`/users/${id}`),

  create: (data: Partial<User>) =>
    request<ApiResponse<User>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<User>) =>
    request<ApiResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<ApiResponse<void>>(`/users/${id}`, {
      method: 'DELETE',
    }),
}

// Organization API
export const organizationApi = {
  get: () => request<ApiResponse<Organization>>('/organization'),

  update: (data: Partial<Organization>) =>
    request<ApiResponse<Organization>>('/organization', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
}

// Credentials API
export const credentialsApi = {
  list: () => request<ApiResponse<SipCredential[]>>('/credentials'),

  get: (id: string) => request<ApiResponse<SipCredential>>(`/credentials/${id}`),

  create: (data: CreateCredentialRequest) =>
    request<ApiResponse<SipCredential>>('/credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateCredentialRequest>) =>
    request<ApiResponse<SipCredential>>(`/credentials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<ApiResponse<void>>(`/credentials/${id}`, {
      method: 'DELETE',
    }),

  test: (id: string) =>
    request<ApiResponse<{ status: string }>>(`/credentials/${id}/test`, {
      method: 'POST',
    }),
}

// Tests API
export const testsApi = {
  list: (params?: {
    page?: number
    pageSize?: number
    status?: string
    credentialId?: string
  }) =>
    request<PaginatedResponse<TestResult>>(
      `/tests?${new URLSearchParams(params as any).toString()}`
    ),

  get: (id: string) => request<ApiResponse<TestResult>>(`/tests/${id}`),

  create: (config: TestConfiguration) =>
    request<ApiResponse<TestResult>>('/tests', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  cancel: (id: string) =>
    request<ApiResponse<void>>(`/tests/${id}/cancel`, {
      method: 'POST',
    }),

  export: (params: ExportRequest) =>
    request<Blob>('/tests/export', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
}

// Dashboard API
export const dashboardApi = {
  stats: () => request<ApiResponse<DashboardStats>>('/dashboard/stats'),
}

export { ApiError }
