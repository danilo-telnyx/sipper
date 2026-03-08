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

// Helper to transform backend credential to frontend format
const transformCredential = (backendCred: any): SipCredential => ({
  id: backendCred.id,
  name: backendCred.name,
  username: backendCred.username,
  password: backendCred.password || '',
  domain: backendCred.sip_domain,  // sip_domain → domain
  proxy: backendCred.outbound_proxy || undefined,  // outbound_proxy → proxy
  port: backendCred.port,
  transport: backendCred.transport,
  organizationId: backendCred.organization_id,
  createdBy: backendCred.created_by,
  createdAt: backendCred.created_at,
  updatedAt: backendCred.updated_at,
  lastTestedAt: backendCred.last_tested_at,
  isActive: backendCred.is_active ?? true,
})

// Credentials API
export const credentialsApi = {
  list: async () => {
    const response = await axiosInstance.get<any>('/credentials')
    // Transform backend array to frontend format
    if (response.data && Array.isArray(response.data)) {
      return {
        success: true,
        data: response.data.map(transformCredential)
      }
    }
    return { success: true, data: [] }
  },

  get: async (id: string) => {
    const response = await axiosInstance.get<any>(`/credentials/${id}`)
    return {
      success: true,
      data: transformCredential(response.data)
    }
  },

  create: async (data: CreateCredentialRequest) => {
    // Transform frontend field names to backend snake_case
    const backendPayload = {
      name: data.name,
      sip_domain: data.domain,  // domain → sip_domain
      username: data.username,
      password: data.password,
      port: data.port,
      transport: data.transport,
      outbound_proxy: data.proxy || null,  // proxy → outbound_proxy
    }
    
    const response = await axiosInstance.post<any>(
      '/credentials',
      backendPayload
    )
    return {
      success: true,
      data: transformCredential(response.data)
    }
  },

  update: async (id: string, data: Partial<CreateCredentialRequest>) => {
    // Transform frontend field names to backend snake_case
    const backendPayload: any = {}
    if (data.name !== undefined) backendPayload.name = data.name
    if (data.domain !== undefined) backendPayload.sip_domain = data.domain
    if (data.username !== undefined) backendPayload.username = data.username
    if (data.password !== undefined) backendPayload.password = data.password
    if (data.port !== undefined) backendPayload.port = data.port
    if (data.transport !== undefined) backendPayload.transport = data.transport
    if (data.proxy !== undefined) backendPayload.outbound_proxy = data.proxy || null
    
    const response = await axiosInstance.put<any>(
      `/credentials/${id}`,
      backendPayload
    )
    return {
      success: true,
      data: transformCredential(response.data)
    }
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
      '/tests/runs',
      { params }
    )
    return response.data
  },

  get: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<TestResult>>(
      `/tests/runs/${id}`
    )
    return response.data
  },

  create: async (config: TestConfiguration) => {
    // Map frontend test types to backend SIP methods
    const testTypeMap: Record<string, string> = {
      'basic-registration': 'REGISTER',
      'invite-call': 'INVITE',
      'options-ping': 'OPTIONS',
      'refer-transfer': 'REFER',
      'bye-disconnect': 'BYE',
      'cancel-call': 'CANCEL',
      'recording-invite': 'RECORDING_INVITE',
    }
    
    // Transform frontend camelCase to backend snake_case
    const backendPayload = {
      test_type: testTypeMap[config.testType] || 'REGISTER',
      credential_id: config.credentialId || null,
      ad_hoc_credentials: config.adHocCredentials ? {
        domain: config.adHocCredentials.domain,
        username: config.adHocCredentials.username,
        password: config.adHocCredentials.password,
        port: config.adHocCredentials.port || 5060,
        transport: config.adHocCredentials.transport || 'UDP',
      } : null,
      authenticated: !!(config.credentialId || config.adHocCredentials),
      sdp_body: null,
      expires: 3600,
      metadata: {
        endpoint: config.endpoint,
        duration: config.duration,
        callCount: config.callCount,
        concurrentCalls: config.concurrentCalls,
        codec: config.codec,
        customScenario: config.customScenario,
      }
    }
    
    const response = await axiosInstance.post<ApiResponse<TestResult>>(
      '/tests/run',
      backendPayload
    )
    return response.data
  },

  cancel: async (id: string) => {
    const response = await axiosInstance.post<ApiResponse<void>>(
      `/tests/runs/${id}/cancel`
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
      `/tests/runs/${id}/progress`
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
