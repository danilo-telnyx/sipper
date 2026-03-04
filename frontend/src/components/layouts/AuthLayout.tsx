import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">SIPPER</h1>
          <p className="text-muted-foreground">
            Professional SIP Testing Platform
          </p>
        </div>

        {/* Auth Form */}
        <Outlet />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Secure • Reliable • Compliant
          </p>
        </footer>
      </div>
    </div>
  )
}
