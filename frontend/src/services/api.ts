import axiosInstance, { getErrorMessage } from '../lib/axios'
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
} from '../types/index'

// Auth API
export const authApi = {
  login: async (data: LoginRequest) => {
    try {
      const response = await axiosInstance.post<any>(
        '/auth/login',
        data
      )
      
      // Backend returns: { access_token, refresh_token, token_type, user }
      // Transform to frontend format: { token, refreshToken, user }
      const backendData = response.data
      
      if (!backendData.user) {
        throw new Error('Backend did not return user data')
      }
      
      // Transform backend user format to frontend format
      const user = {
        id: backendData.user.id,
        email: backendData.user.email,
        name: backendData.user.full_name, // backend: full_name → frontend: name
        role: backendData.user.role,
        organizationId: backendData.user.organization_id, // backend: organization_id → frontend: organizationId
        createdAt: backendData.user.created_at, // backend: created_at → frontend: createdAt
        updatedAt: backendData.user.created_at, // Use created_at as updatedAt for now
      }
      
      return {
        success: true,
        data: {
          user,
          token: backendData.access_token,
          refreshToken: backendData.refresh_token,
        } as AuthResponse
      }
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      }
    }
  },

  register: async (data: RegisterRequest) => {
    try {
      // Transform frontend camelCase to backend snake_case
      const backendPayload = {
        email: data.email,
        password: data.password,
        full_name: data.name,  // name → full_name
        organization_name: data.organizationName || 'My Organization'  // organizationName → organization_name
      }
      
      const response = await axiosInstance.post<any>(
        '/auth/register',
        backendPayload
      )
      
      // Backend returns: { access_token, refresh_token, token_type, user }
      // Transform to frontend format: { token, refreshToken, user }
      const backendData = response.data
      
      if (!backendData.user) {
        throw new Error('Backend did not return user data')
      }
      
      // Transform backend user format to frontend format
      const user = {
        id: backendData.user.id,
        email: backendData.user.email,
        name: backendData.user.full_name, // backend: full_name → frontend: name
        role: backendData.user.role,
        organizationId: backendData.user.organization_id, // backend: organization_id → frontend: organizationId
        createdAt: backendData.user.created_at, // backend: created_at → frontend: createdAt
        updatedAt: backendData.user.created_at, // Use created_at as updatedAt for now
      }
      
      return {
        success: true,
        data: {
          user,
          token: backendData.access_token,
          refreshToken: backendData.refresh_token,
        } as AuthResponse
      }
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      }
    }
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
