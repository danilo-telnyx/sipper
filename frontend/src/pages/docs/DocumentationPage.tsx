/**
 * Interactive Documentation Page
 * Sprint 6: Documentation System
 * Comprehensive SIPPER documentation with interactive flows
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { 
  BookOpen, 
  Workflow, 
  Code, 
  Settings, 
  Shield,
  Zap,
  GitBranch,
  ExternalLink,
} from 'lucide-react'

const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.6.0'
const BACKEND_VERSION = '0.6.0' // This should come from API in production
const FRONTEND_VERSION = '0.6.0'

export function DocumentationPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <Badge variant="outline" className="text-xs">
            Interactive Guide
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Comprehensive guide to SIPPER features, workflows, and best practices
        </p>
      </div>

      {/* Version Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Version Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Application</div>
              <div className="text-2xl font-bold">{APP_VERSION}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Frontend</div>
              <div className="text-2xl font-bold text-primary">{FRONTEND_VERSION}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Backend</div>
              <div className="text-2xl font-bold text-primary">{BACKEND_VERSION}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Documentation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <BookOpen className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflows">
            <Workflow className="h-4 w-4 mr-2" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
          <TabsTrigger value="api">
            <Code className="h-4 w-4 mr-2" />
            API
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewSection />
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <WorkflowsSection />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <FeaturesSection />
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <APISection />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecuritySection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OverviewSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>What is SIPPER?</CardTitle>
          <CardDescription>SIP Testing Platform for RFC-compliant protocol validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            SIPPER is a production-ready web application for executing RFC3261-compliant SIP protocol tests. 
            It provides comprehensive testing capabilities for SIP implementations, including authentication, 
            call flows, codec negotiation, and advanced features like call transfer (REFER) and session recording.
          </p>
          
          <div className="border-l-4 border-primary pl-4 space-y-2">
            <p className="text-sm font-semibold">Key Capabilities</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>RFC3261 (SIP Core) compliance testing</li>
              <li>RFC3515 (REFER Method) call transfer testing</li>
              <li>RFC7865 (Session Recording) metadata support</li>
              <li>Multi-tenant organization isolation</li>
              <li>Role-based access control (RBAC)</li>
              <li>Real-time test monitoring via WebSocket</li>
              <li>Encrypted credential storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" />
                Frontend
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>React 18 + TypeScript</li>
                <li>Vite build system</li>
                <li>Tailwind CSS styling</li>
                <li>TanStack Query (data fetching)</li>
                <li>React Router (routing)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-semibold text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" />
                Backend
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>FastAPI (Python)</li>
                <li>PostgreSQL 16</li>
                <li>Node.js SIP Engine</li>
                <li>JWT authentication</li>
                <li>WebSocket real-time updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href="https://github.com/danilo-telnyx/sipper"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <Code className="h-4 w-4" />
            GitHub Repository
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://datatracker.ietf.org/doc/html/rfc3261"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            RFC 3261 - SIP Protocol
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href="https://datatracker.ietf.org/doc/html/rfc3515"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            RFC 3515 - REFER Method
            <ExternalLink className="h-3 w-3" />
          </a>
        </CardContent>
      </Card>
    </>
  )
}

function WorkflowsSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Basic Registration Flow</CardTitle>
          <CardDescription>Simplest SIP workflow - register a client with the server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-md font-mono text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">1.</span>
                <span className="text-primary">Client</span>
                <span>→</span>
                <span>REGISTER</span>
                <span>→</span>
                <span className="text-blue-600">Server</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">2.</span>
                <span className="text-blue-600">Server</span>
                <span>→</span>
                <span className="text-orange-600">401 Unauthorized</span>
                <span>→</span>
                <span className="text-primary">Client</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">3.</span>
                <span className="text-primary">Client</span>
                <span>→</span>
                <span>REGISTER (with auth)</span>
                <span>→</span>
                <span className="text-blue-600">Server</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">4.</span>
                <span className="text-blue-600">Server</span>
                <span>→</span>
                <span className="text-green-600">200 OK</span>
                <span>→</span>
                <span className="text-primary">Client</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              The client sends a REGISTER request, the server challenges with 401 and a nonce, 
              the client responds with digest authentication, and the server accepts with 200 OK.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call Setup Flow (INVITE)</CardTitle>
          <CardDescription>Establishing a SIP call session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-md font-mono text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">1.</span>
                <span className="text-primary">Alice</span>
                <span>→</span>
                <span>INVITE (with SDP)</span>
                <span>→</span>
                <span className="text-blue-600">Server</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">2.</span>
                <span className="text-blue-600">Server</span>
                <span>→</span>
                <span className="text-blue-500">100 Trying</span>
                <span>→</span>
                <span className="text-primary">Alice</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">3.</span>
                <span className="text-blue-600">Server</span>
                <span>→</span>
                <span className="text-blue-500">180 Ringing</span>
                <span>→</span>
                <span className="text-primary">Alice</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">4.</span>
                <span className="text-blue-600">Server</span>
                <span>→</span>
                <span className="text-green-600">200 OK (with SDP)</span>
                <span>→</span>
                <span className="text-primary">Alice</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">5.</span>
                <span className="text-primary">Alice</span>
                <span>→</span>
                <span>ACK</span>
                <span>→</span>
                <span className="text-blue-600">Server</span>
              </div>
              <div className="text-muted-foreground text-center py-2">[ RTP Media Session ]</div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">6.</span>
                <span className="text-primary">Alice</span>
                <span>→</span>
                <span>BYE</span>
                <span>→</span>
                <span className="text-blue-600">Server</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">7.</span>
                <span className="text-blue-600">Server</span>
                <span>→</span>
                <span className="text-green-600">200 OK</span>
                <span>→</span>
                <span className="text-primary">Alice</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Complete call flow: INVITE with SDP offer, provisional responses (100, 180), 
              200 OK with SDP answer, ACK to complete the three-way handshake, media session, 
              then BYE to terminate.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call Transfer Flow (REFER)</CardTitle>
          <CardDescription>Transferring a call to another party (RFC 3515)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-md font-mono text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">1.</span>
                <span className="text-primary">Alice</span>
                <span>→</span>
                <span>REFER (Refer-To: Carol)</span>
                <span>→</span>
                <span className="text-blue-600">Bob</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">2.</span>
                <span className="text-blue-600">Bob</span>
                <span>→</span>
                <span className="text-green-600">202 Accepted</span>
                <span>→</span>
                <span className="text-primary">Alice</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">3.</span>
                <span className="text-blue-600">Bob</span>
                <span>→</span>
                <span>NOTIFY (sipfrag: trying)</span>
                <span>→</span>
                <span className="text-primary">Alice</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">4.</span>
                <span className="text-blue-600">Bob</span>
                <span>→</span>
                <span>INVITE</span>
                <span>→</span>
                <span className="text-purple-600">Carol</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">5.</span>
                <span className="text-purple-600">Carol</span>
                <span>→</span>
                <span className="text-green-600">200 OK</span>
                <span>→</span>
                <span className="text-blue-600">Bob</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">6.</span>
                <span className="text-blue-600">Bob</span>
                <span>→</span>
                <span>NOTIFY (sipfrag: 200 OK)</span>
                <span>→</span>
                <span className="text-primary">Alice</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Alice transfers Bob to Carol. Bob accepts the transfer (202), sends NOTIFY updates 
              to Alice about the transfer progress, initiates a new call to Carol, and reports 
              success via NOTIFY.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function FeaturesSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Sprint History</CardTitle>
          <CardDescription>Feature development timeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <FeatureSprint
              version="0.3.0"
              title="Sprint 1: Backend SIP Core"
              features={[
                'REFER method support (RFC 3515)',
                'Session Recording metadata (RFC 7865)',
                'Unauthenticated message builders',
                'Parameter validation framework',
                '25+ comprehensive tests',
              ]}
            />
            <FeatureSprint
              version="0.4.0"
              title="Sprint 2: Frontend SIP Test Builder UI"
              features={[
                'Method selector (INVITE, REGISTER, OPTIONS, REFER)',
                'Authentication toggle',
                'Real-time RFC validation',
                'SDP editor with templates',
                'Recording metadata form',
              ]}
            />
            <FeatureSprint
              version="0.5.0"
              title="Sprint 3: Help System"
              features={[
                'Contextual help panel',
                'Tabbed interface (Guide, Examples, RFCs, Troubleshooting)',
                '7 page contexts with content',
                'Code sample library with copy',
                'Keyboard shortcuts (? and ESC)',
              ]}
            />
            <FeatureSprint
              version="0.6.0"
              title="Sprint 4: Flow Visualization"
              features={[
                'SIP flow sequence diagrams',
                'Color-coded response classes',
                'Expandable message details',
                'Zoom controls and fullscreen',
                'JSON export capability',
              ]}
              current
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Telnyx Integration</CardTitle>
          <CardDescription>Auto-import SIP credentials from Telnyx</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              SIPPER can automatically import SIP credentials from your Telnyx account using the 
              Telnyx API. This eliminates manual entry and reduces configuration errors.
            </p>
            <div className="border-l-4 border-primary pl-4">
              <p className="text-sm font-semibold mb-2">How it works:</p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Toggle "Telnyx Integration" in the credential form</li>
                <li>Enter your Connection ID and API Key</li>
                <li>Wait ~1 second for auto-population</li>
                <li>Review and save the imported credential</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function FeatureSprint({ 
  version, 
  title, 
  features, 
  current = false 
}: { 
  version: string
  title: string
  features: string[]
  current?: boolean
}) {
  return (
    <div className="border-l-2 border-primary pl-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={current ? 'default' : 'outline'}>v{version}</Badge>
        <span className="font-semibold text-sm">{title}</span>
        {current && <Badge className="text-xs">Current</Badge>}
      </div>
      <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
        {features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>
    </div>
  )
}

function APISection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>RESTful API for SIP testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <APIEndpoint
              method="POST"
              path="/api/auth/login"
              description="Authenticate user and obtain JWT token"
            />
            <APIEndpoint
              method="POST"
              path="/api/auth/register"
              description="Register new user and organization"
            />
            <APIEndpoint
              method="GET"
              path="/api/credentials"
              description="List SIP credentials for organization"
            />
            <APIEndpoint
              method="POST"
              path="/api/credentials"
              description="Create new SIP credential (encrypted)"
            />
            <APIEndpoint
              method="POST"
              path="/api/telnyx/fetch-credentials"
              description="Auto-import credentials from Telnyx API"
            />
            <APIEndpoint
              method="POST"
              path="/api/tests"
              description="Create and start new SIP test"
            />
            <APIEndpoint
              method="GET"
              path="/api/tests"
              description="List test results with filtering"
            />
            <APIEndpoint
              method="GET"
              path="/api/tests/:id"
              description="Get detailed test result"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WebSocket Events</CardTitle>
          <CardDescription>Real-time test monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <WebSocketEvent
              event="test:progress"
              description="Test progress updates (0-100%)"
            />
            <WebSocketEvent
              event="test:log"
              description="Real-time test execution logs"
            />
            <WebSocketEvent
              event="test:completed"
              description="Test finished successfully"
            />
            <WebSocketEvent
              event="test:failed"
              description="Test failed with error details"
            />
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function APIEndpoint({ 
  method, 
  path, 
  description 
}: { 
  method: string
  path: string
  description: string
}) {
  const methodColors: Record<string, string> = {
    GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  }

  return (
    <div className="flex items-start gap-3">
      <Badge className={`${methodColors[method]} text-xs font-mono min-w-[4rem] justify-center`}>
        {method}
      </Badge>
      <div className="flex-1">
        <code className="text-sm font-mono">{path}</code>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}

function WebSocketEvent({ 
  event, 
  description 
}: { 
  event: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Badge variant="outline" className="text-xs font-mono min-w-[10rem] justify-center">
        {event}
      </Badge>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function SecuritySection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Authentication & Authorization</CardTitle>
          <CardDescription>Secure access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">JWT Token-Based Authentication</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>Access tokens (15 minutes expiry)</li>
              <li>Refresh tokens (7 days expiry)</li>
              <li>Secure HTTP-only cookies</li>
              <li>Token rotation on refresh</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Role-Based Access Control (RBAC)</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li><strong>User:</strong> Run tests, view own results</li>
              <li><strong>Manager:</strong> Manage credentials, view all org tests</li>
              <li><strong>Admin:</strong> Full system access, user management</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Multi-Tenant Isolation</p>
            <p className="text-sm text-muted-foreground">
              Each organization's data is isolated at the database level. Users can only access 
              resources within their own organization.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Protection</CardTitle>
          <CardDescription>Encryption and secure storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Credential Encryption</p>
            <p className="text-sm text-muted-foreground mb-2">
              All SIP credentials (passwords) are encrypted using Fernet (symmetric encryption) 
              before storage. Encryption keys are stored securely in environment variables.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Password Hashing</p>
            <p className="text-sm text-muted-foreground mb-2">
              User passwords are hashed using bcrypt with automatic salt generation. 
              Passwords are never stored in plaintext.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Environment Secrets</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li>JWT_SECRET: Token signing</li>
              <li>SECRET_KEY: Session security</li>
              <li>ENCRYPTION_KEY: Credential encryption</li>
              <li>DB_PASSWORD: Database access</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
            <li>Always use strong, randomly generated secrets in production</li>
            <li>Rotate secrets regularly (recommended: every 90 days)</li>
            <li>Enable HTTPS in production (use reverse proxy like Nginx)</li>
            <li>Keep dependencies updated (npm audit, pip audit)</li>
            <li>Review and audit user permissions regularly</li>
            <li>Monitor logs for suspicious activity</li>
            <li>Backup database regularly</li>
          </ul>
        </CardContent>
      </Card>
    </>
  )
}
