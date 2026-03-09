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
    const response = await axiosInstance.get<any>(
      '/tests/runs',
      { params }
    )
    
    console.log('[testsApi] list response:', response.data)
    
    // Transform backend response to frontend format
    const transformedData = (response.data || []).map((test: any) => {
      const startedAt = new Date(test.started_at)
      const completedAt = test.completed_at ? new Date(test.completed_at) : null
      const duration = completedAt ? completedAt.getTime() - startedAt.getTime() : 0
      
      return {
        id: test.id,
        testType: test.test_type,
        credentialName: 'SIP Credential', // TODO: Fetch credential name from credential_id
        credentialId: test.credential_id,
        status: test.status,
        startedAt: test.started_at,
        completedAt: test.completed_at,
        duration: Math.round(duration / 1000), // Convert to seconds
        score: test.status === 'completed' ? 100 : 0, // TODO: Calculate actual score from results
        organizationId: test.organization_id,
        metadata: test.test_metadata || {}
      }
    })
    
    console.log('[testsApi] transformed data:', transformedData)
    
    return {
      success: true,
      data: transformedData
    }
  },

  get: async (id: string) => {
    console.log('[testsApi] get called for test:', id)
    
    // Fetch test run
    const testResponse = await axiosInstance.get<any>(`/tests/runs/${id}`)
    const test = testResponse.data
    
    // Fetch test results (detailed SIP messages)
    const resultsResponse = await axiosInstance.get<any>(`/tests/results/${id}`)
    const results = resultsResponse.data || []
    
    console.log('[testsApi] test data:', test)
    console.log('[testsApi] test results:', results)
    
    // Transform test run data
    const startedAt = new Date(test.started_at)
    const completedAt = test.completed_at ? new Date(test.completed_at) : null
    const duration = completedAt ? completedAt.getTime() - startedAt.getTime() : 0
    
    // Transform test results into SIP messages
    const sipMessages = results
      .filter((r: any) => r.step_name.startsWith('out_') || r.step_name.startsWith('in_'))
      .map((r: any) => {
        try {
          const details = typeof r.details === 'string' ? JSON.parse(r.details) : r.details
          const message = details.message || {}
          
          if (r.step_name.startsWith('out_')) {
            return {
              direction: 'sent',
              timestamp: r.timestamp,
              method: r.step_name.replace('out_', ''),
              rawMessage: message.message || '',
              headers: {},
            }
          } else {
            return {
              direction: 'received',
              timestamp: r.timestamp,
              statusCode: message.statusCode || 0,
              statusText: message.reasonPhrase || message.message?.reasonPhrase || '',
              rawMessage: message.message || '',
              headers: message.message?.headers || message.headers || {},
            }
          }
        } catch (e) {
          console.error('[testsApi] Failed to parse result:', r, e)
          return null
        }
      })
      .filter((m: any) => m !== null)
    
    console.log('[testsApi] transformed SIP messages:', sipMessages)
    
    return {
      success: true,
      data: {
        id: test.id,
        testType: test.test_type,
        credentialName: 'SIP Credential',
        credentialId: test.credential_id,
        status: test.status,
        startedAt: test.started_at,
        completedAt: test.completed_at,
        duration: Math.round(duration / 1000),
        score: test.status === 'completed' ? 100 : 0,
        organizationId: test.organization_id,
        userId: test.created_by || '',
        metadata: test.test_metadata || {},
        sipMessages, // Add SIP messages
        testResults: results, // Add raw test results
        // Add missing fields from TestResult type
        success: test.status === 'completed',
        logs: results.map((r: any) => ({
          timestamp: r.timestamp,
          level: r.status === 'error' ? 'error' : r.status === 'warning' ? 'warn' : 'info',
          message: r.message || r.step_name,
          source: r.step_name
        })),
        details: results.find((r: any) => r.step_name === 'summary')?.details || {},
        rfcCompliance: {
          passed: [],
          warnings: [],
          errors: results.filter((r: any) => r.status === 'error').map((r: any) => r.message)
        },
        timings: {
          dns: 0,
          connect: 0,
          tls: 0,
          total: Math.round(duration / 1000)
        },
        networkStats: {
          packetsSent: sipMessages.filter((m: any) => m.direction === 'sent').length,
          packetsReceived: sipMessages.filter((m: any) => m.direction === 'received').length,
          bytesReceived: 0,
          bytesSent: 0
        }
      }
    }
  },

  create: async (config: TestConfiguration) => {
    console.log('[testsApi] create called with config:', config)
    
    // Map frontend test types to backend SIP methods
    const testTypeMap: Record<string, string> = {
      'basic-registration': 'REGISTER',
      'authentication': 'REGISTER',
      'call-flow': 'INVITE',
      'codec-negotiation': 'INVITE',
      'dtmf': 'INVITE',
      'hold-resume': 'INVITE',
      'transfer': 'REFER',
      'conference': 'INVITE',
      'rfc-compliance': 'OPTIONS',
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
      test_metadata: {
        endpoint: config.endpoint,
        duration: config.duration,
        callCount: config.callCount,
        concurrentCalls: config.concurrentCalls,
        codec: config.codec,
        customScenario: config.customScenario,
      }
    }
    
    console.log('[testsApi] Backend payload:', backendPayload)
    
    try {
      const response = await axiosInstance.post<ApiResponse<TestResult>>(
        '/tests/run',
        backendPayload
      )
      console.log('[testsApi] API response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('[testsApi] API error:', error)
      console.error('[testsApi] Error response:', error.response?.data)
      throw error
    }
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
