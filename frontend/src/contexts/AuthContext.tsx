import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useAuthStore } from '../store/auth'
import { authApi } from '../services/api'
import type { User, LoginRequest, RegisterRequest } from '../types/index'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  updateUser: (user: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auto-refresh token interval (15 minutes)
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000
// Session timeout (30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const authStore = useAuthStore()
  const refreshIntervalRef = useRef<NodeJS.Timeout>()
  const sessionTimeoutRef = useRef<NodeJS.Timeout>()
  const lastActivityRef = useRef<number>(Date.now())

  // Reset session timeout on user activity
  const resetSessionTimeout = () => {
    lastActivityRef.current = Date.now()
    
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current)
    }
    
    if (authStore.isAuthenticated) {
      sessionTimeoutRef.current = setTimeout(() => {
        const inactiveTime = Date.now() - lastActivityRef.current
        
        if (inactiveTime >= SESSION_TIMEOUT) {
          logout()
        }
      }, SESSION_TIMEOUT)
    }
  }

  // Setup activity listeners
  useEffect(() => {
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    
    const handleActivity = () => {
      resetSessionTimeout()
    }
    
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })
    
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [authStore.isAuthenticated])

  // Auto-refresh token
  const refreshToken = async () => {
    try {
      if (!authStore.refreshToken) return
      
      const response = await authApi.refreshToken(authStore.refreshToken)
      
      if (response.success && response.data) {
        // Update only the token, keep user and refreshToken
        if (authStore.user && authStore.refreshToken) {
          authStore.setAuth({
            user: authStore.user,
            token: response.data.token,
            refreshToken: authStore.refreshToken,
          })
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Don't logout on refresh failure - the interceptor will handle it
    }
  }

  // Setup auto-refresh interval
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.refreshToken) {
      // Refresh immediately on mount if we have a token
      refreshToken()
      
      // Setup interval
      refreshIntervalRef.current = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL)
      
      // Setup session timeout
      resetSessionTimeout()
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }
    }
  }, [authStore.isAuthenticated])

  const login = async (credentials: LoginRequest) => {
    console.log('🔐 Login attempt:', { email: credentials.email })
    
    const response = await authApi.login(credentials)
    console.log('✅ Login API response:', response)
    
    if (response.success && response.data) {
      console.log('✅ Setting auth state:', {
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        hasRefreshToken: !!response.data.refreshToken,
        userName: response.data.user?.name,
        userEmail: response.data.user?.email,
      })
      
      authStore.setAuth(response.data)
      console.log('✅ Auth state set successfully')
    } else {
      console.error('❌ Login failed:', response.error)
      throw new Error(response.error || 'Login failed')
    }
  }

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    
    if (response.success && response.data) {
      authStore.setAuth(response.data)
    } else {
      throw new Error(response.error || 'Registration failed')
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      authStore.clearAuth()
      
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }
    }
  }

  const value: AuthContextType = {
    user: authStore.user,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateUser: authStore.updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}
