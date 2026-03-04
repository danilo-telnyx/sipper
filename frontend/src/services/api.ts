import axiosInstance from '@/lib/axios'
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

// Auth API
export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    )
    return response.data
  },

  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    )
    return response.data
  },

  logout: async () => {
    const response = await axiosInstance.post<ApiResponse<void>>('/auth/logout')
    return response.data
  },

  refreshToken: async (refreshToken: string) => {
    const response = await axiosInstance.post<
      ApiResponse<{ token: string }>
    >('/auth/refresh', { refreshToken })
    return response.data
  },

  me: async () => {
    const response = await axiosInstance.get<ApiResponse<User>>('/auth/me')
    return response.data
  },
}

// Users API
export const usersApi = {
  list: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }) => {
    const response = await axiosInstance.get<PaginatedResponse<User>>(
      '/users',
      { params }
    )
    return response.data
  },

  get: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  create: async (data: Partial<User>) => {
    const response = await axiosInstance.post<ApiResponse<User>>(
      '/users',
      data
    )
    return response.data
  },

  update: async (id: string, data: Partial<User>) => {
    const response = await axiosInstance.put<ApiResponse<User>>(
      `/users/${id}`,
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/users/${id}`
    )
    return response.data
  },
}

// Organization API
export const organizationApi = {
  get: async () => {
    const response = await axiosInstance.get<ApiResponse<Organization>>(
      '/organization'
    )
    return response.data
  },

  update: async (data: Partial<Organization>) => {
    const response = await axiosInstance.put<ApiResponse<Organization>>(
      '/organization',
      data
    )
    return response.data
  },
}

// Credentials API
export const credentialsApi = {
  list: async () => {
    const response = await axiosInstance.get<ApiResponse<SipCredential[]>>(
      '/credentials'
    )
    return response.data
  },

  get: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<SipCredential>>(
      `/credentials/${id}`
    )
    return response.data
  },

  create: async (data: CreateCredentialRequest) => {
    const response = await axiosInstance.post<ApiResponse<SipCredential>>(
      '/credentials',
      data
    )
    return response.data
  },

  update: async (id: string, data: Partial<CreateCredentialRequest>) => {
    const response = await axiosInstance.put<ApiResponse<SipCredential>>(
      `/credentials/${id}`,
      data
    )
    return response.data
  },

  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(
      `/credentials/${id}`
    )
    return response.data
  },

  test: async (id: string) => {
    const response = await axiosInstance.post<
      ApiResponse<{ status: string }>
    >(`/credentials/${id}/test`)
    return response.data
  },
}

// Tests API
export const testsApi = {
  list: async (params?: {
    page?: number
    pageSize?: number
    status?: string
    credentialId?: string
  }) => {
    const response = await axiosInstance.get<PaginatedResponse<TestResult>>(
      '/tests',
      { params }
    )
    return response.data
  },

  get: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<TestResult>>(
      `/tests/${id}`
    )
    return response.data
  },

  create: async (config: TestConfiguration) => {
    const response = await axiosInstance.post<ApiResponse<TestResult>>(
      '/tests',
      config
    )
    return response.data
  },

  cancel: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse<void>>(
      `/tests/${id}/cancel`
    )
    return response.data
  },

  export: async (params: ExportRequest) => {
    const response = await axiosInstance.post<Blob>(
      '/tests/export',
      params,
      {
        responseType: 'blob',
      }
    )
    return response.data
  },

  getProgress: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<any>>(
      `/tests/${id}/progress`
    )
    return response.data
  },
}

// Dashboard API
export const dashboardApi = {
  stats: async (params?: { dateRange?: string }) => {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>(
      '/dashboard/stats',
      { params }
    )
    return response.data
  },
}
