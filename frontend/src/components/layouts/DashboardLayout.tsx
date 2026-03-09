import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  LayoutDashboard,
  Key,
  Play,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  User,
  Building2,
  X,
  HelpCircle,
  BookOpen,
  GraduationCap,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { wsService } from '../../services/websocket'
import { useToast } from '../../hooks/use-toast'
import { ContextualHelpPanel } from '../help-system'

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0'

export function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [helpPanelOpen, setHelpPanelOpen] = useState(false)

  useEffect(() => {
    // Connect WebSocket on mount
    wsService.connect()
    return () => {
      wsService.disconnect()
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Keyboard shortcuts for help panel
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ? to toggle help (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setHelpPanelOpen((prev) => !prev)
      }
      // ESC to close help
      if (e.key === 'Escape' && helpPanelOpen) {
        e.preventDefault()
        setHelpPanelOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [helpPanelOpen])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      wsService.disconnect()
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'An error occurred while logging out.',
        variant: 'destructive',
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/credentials', icon: Key, label: 'Credentials' },
    { path: '/test-runner', icon: Play, label: 'Test Runner' },
    { path: '/test-results', icon: FileText, label: 'Test Results' },
    { path: '/elearning', icon: GraduationCap, label: 'SIP Training' },
    ...(user?.role === 'admin' || user?.role === 'org-admin'
      ? [{ path: '/users', icon: Users, label: 'Users' }]
      : []),
    ...(user?.role === 'org-admin'
      ? [{ path: '/organization', icon: Settings, label: 'Organization' }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-accent rounded-md transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <h1 className="text-xl font-bold text-primary">SIPPER</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Help Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpPanelOpen(!helpPanelOpen)}
              aria-label="Toggle help panel"
              title="Help & Documentation (Press ?)"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* User Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2"
                  aria-label="User menu"
                >
                  <div className="hidden sm:flex flex-col items-end text-sm">
                    <span className="font-medium">{user?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Organization Info */}
                {user?.role === 'org-admin' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate('/organization')}
                      className="cursor-pointer"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Organization Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar Navigation - Desktop */}
        <aside className="hidden lg:block w-64 space-y-2">
          <nav className="space-y-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Sidebar Footer with Documentation and Versions */}
          <div className="mt-auto pt-6 border-t">
            <Link
              to="/documentation"
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm ${
                location.pathname === '/documentation'
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Documentation</span>
            </Link>

            <div className="px-4 py-3 text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Frontend:</span>
                <span className="font-mono">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Backend:</span>
                <span className="font-mono">v1.0.0</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Sidebar */}
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r shadow-lg p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-accent rounded-md transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="space-y-1" aria-label="Main navigation">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          SIPPER v{APP_VERSION} - SIP Testing Platform
        </div>
      </footer>

      {/* Help Panel */}
      <ContextualHelpPanel
        isOpen={helpPanelOpen}
        onClose={() => setHelpPanelOpen(false)}
      />
    </div>
  )
}
