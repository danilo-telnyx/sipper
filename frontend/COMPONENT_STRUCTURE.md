# SIPPER Frontend - Component Structure

## Architecture Overview

The SIPPER frontend follows a feature-based architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│           User Interface Layer          │
│  (Pages, Layouts, UI Components)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         State Management Layer          │
│  (Zustand Stores, React Query Cache)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Services Layer                 │
│  (API Client, WebSocket Manager)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Backend API                    │
│  (REST + WebSocket)                     │
└─────────────────────────────────────────┘
```

## Component Hierarchy

### 1. App Root (`App.tsx`)
```
App
├── BrowserRouter
│   └── Routes
│       ├── AuthLayout (Login/Register)
│       └── DashboardLayout (Protected Routes)
│           ├── Dashboard
│           ├── Credentials
│           ├── TestRunner
│           ├── TestResults
│           ├── Users (Admin only)
│           └── Organization (Org-Admin only)
└── Toaster (Global notifications)
```

### 2. Layouts

#### AuthLayout
- **Purpose**: Container for authentication pages
- **Features**:
  - Split-screen design (branding + form)
  - Responsive mobile view
  - Auto-redirect if authenticated
- **Children**: LoginPage, RegisterPage

#### DashboardLayout
- **Purpose**: Main app container with navigation
- **Features**:
  - Top navigation bar
  - Sidebar navigation (responsive)
  - WebSocket connection management
  - User info display
  - Version footer
- **Children**: All protected pages

### 3. Pages

#### DashboardPage
**Components Used**:
- Card (stats cards)
- Line chart (success rate trend)
- Links to recent tests

**Data Flow**:
```
useQuery('dashboard-stats')
  → dashboardApi.stats()
  → Render stats cards + chart + recent tests list
```

**Real-time**: Refetches every 30 seconds

#### CredentialsPage
**Components Used**:
- Card (credential cards)
- Dialog (add/edit modal)
- Button, Input, Label, Select

**Data Flow**:
```
useQuery('credentials') → credentialsApi.list()
  ↓
Display credential cards
  ↓
useMutation (create/update/delete)
  → Invalidate query
  → Re-fetch credentials
```

**Features**:
- CRUD operations
- Transport selection (UDP/TCP/TLS)
- Last tested timestamp
- Active/inactive status

#### TestRunnerPage
**Components Used**:
- Card (config + progress panels)
- Select (credential + test type)
- Button (run test)
- Progress bar (real-time)

**Data Flow**:
```
1. Select credential + test type
2. useMutation → testsApi.create(config)
3. Get testId from response
4. wsService.subscribeToTest(testId)
5. Receive progress updates
6. Navigate to results on completion
```

**WebSocket Events**:
- `test:progress` → Update progress state
- `test:completed` → Navigate to results
- `test:failed` → Show error toast

#### TestResultsPage
**Components Used**:
- Tabs (overview, RFC, timings, logs)
- Card (result cards)
- Line chart (timing analysis)
- Button (export)

**Data Flow**:
```
With testId:
  useQuery('test', testId) → testsApi.get(testId)
  → Display detailed results in tabs

Without testId:
  useQuery('test-results') → testsApi.list()
  → Display list of all tests
```

**Export Flow**:
```
Click Export
  → testsApi.export({ testIds, format })
  → Download blob as file
```

#### UsersPage (RBAC: admin, org-admin)
**Components Used**:
- Card (user list)
- Dialog (add/edit modal)
- Input (search)
- Badge (role display)

**Data Flow**:
```
useQuery('users', searchTerm)
  → usersApi.list({ search })
  → Display user list
  → useMutation (create/update/delete)
```

**Permissions**:
- Admins: Full CRUD
- Org-admins: Read + Edit (not delete)
- Users: No access

#### OrganizationPage (RBAC: org-admin)
**Components Used**:
- Card (org info + settings)
- Switch (toggles)
- Input (text fields)
- Progress bars (usage limits)

**Data Flow**:
```
useQuery('organization') → organizationApi.get()
  → Display org info + settings
  → useMutation → organizationApi.update(data)
```

### 4. Reusable UI Components (`components/ui/`)

All components follow Radix UI patterns for accessibility.

#### Button
**Variants**: default, destructive, outline, secondary, ghost, link
**Sizes**: default, sm, lg, icon
**Props**: All HTML button props + variant, size, asChild

#### Input
**Usage**: Form fields
**Features**: Built-in focus states, error states
**Accessibility**: Supports aria-invalid, aria-describedby

#### Card
**Sub-components**: CardHeader, CardTitle, CardDescription, CardContent, CardFooter
**Usage**: Content containers throughout the app

#### Dialog (Radix UI)
**Usage**: Modals for add/edit forms
**Features**: Focus trap, ESC to close, backdrop click to close
**Accessibility**: ARIA labels, keyboard navigation

#### Toast
**Usage**: Notifications
**Variants**: default, destructive
**Features**: Auto-dismiss, action buttons, swipe to dismiss

### 5. Services

#### api.ts
```typescript
// Structure
API_BASE_URL + endpoint
  → fetch with auth header
  → Handle 401 (redirect to login)
  → Return typed response

// API Modules
- authApi: login, register, logout, me
- usersApi: list, get, create, update, delete
- organizationApi: get, update
- credentialsApi: list, get, create, update, delete, test
- testsApi: list, get, create, cancel, export
- dashboardApi: stats
```

#### websocket.ts
```typescript
// WebSocket Service
class WebSocketService {
  connect()      // Connect with JWT auth
  disconnect()   // Clean up connection
  subscribe()    // Subscribe to events
  emit()         // Emit to subscribers
  
  // Helpers
  subscribeToTest(testId, callback)
  onTestCompleted(callback)
  onTestFailed(callback)
}
```

**Events**:
- `test:progress` → { testId, progress, currentStep, message }
- `test:completed` → { testId }
- `test:failed` → { testId, error }

### 6. State Management

#### Auth Store (Zustand + Persist)
```typescript
interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  
  setAuth(auth: AuthResponse): void
  clearAuth(): void
  updateUser(user: Partial<User>): void
}
```

**Persistence**: localStorage (key: `sipper-auth`)

#### React Query Cache
```typescript
// Query Keys
['dashboard-stats']
['credentials']
['test', testId]
['test-results', filters]
['users', searchTerm]
['organization']

// Cache Config
staleTime: 5 minutes
refetchOnWindowFocus: false
retry: 1
```

### 7. Routing

```typescript
// Public Routes
/login          → LoginPage
/register       → RegisterPage

// Protected Routes (require auth)
/               → Redirect to /dashboard
/dashboard      → DashboardPage
/credentials    → CredentialsPage
/test-runner    → TestRunnerPage
/test-results   → TestResultsPage (list)
/test-results/:testId → TestResultsPage (detail)

// Admin Routes (require role check)
/users          → UsersPage (admin, org-admin)
/organization   → OrganizationPage (org-admin)
```

### 8. Permission System

**Role Hierarchy**:
- `user`: Basic access (run tests, view own results)
- `org-admin`: User management + organization settings
- `admin`: Full access (all features + system-wide)

**Implementation**:
```typescript
// In components
const user = useAuthStore(state => state.user)

if (user?.role !== 'admin') {
  return <AccessDenied />
}

// In navigation
const navItems = [
  // ... common items
  ...(user?.role === 'admin' || user?.role === 'org-admin'
    ? [{ path: '/users', ... }]
    : []),
]
```

### 9. Real-time Flow

#### Test Execution Flow
```
1. User clicks "Run Test" → TestRunnerPage
2. POST /api/tests → Backend creates test
3. Backend starts test execution
4. Backend emits progress via WebSocket
5. Frontend receives updates → Update progress UI
6. Test completes → Navigate to results
7. TestResultsPage fetches full details
```

#### Progress Updates
```typescript
// Backend emits
socket.emit('test:progress', {
  testId: '...',
  status: 'running',
  progress: 45,
  currentStep: 'Sending REGISTER',
  message: 'Authentication in progress...',
  timestamp: '2026-03-04T...'
})

// Frontend receives
wsService.subscribe('test:progress', (data) => {
  if (data.testId === currentTestId) {
    setProgress(data)
  }
})
```

### 10. Error Handling

#### API Errors
```typescript
try {
  await api.someMethod()
} catch (error) {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive'
  })
}
```

#### 401 Handling
```typescript
// In api.ts
if (response.status === 401) {
  useAuthStore.getState().clearAuth()
  window.location.href = '/login'
}
```

#### WebSocket Disconnection
```typescript
socket.on('disconnect', () => {
  // Auto-reconnect enabled
  console.log('WebSocket disconnected, reconnecting...')
})
```

## Best Practices

1. **Component Composition**: Break down complex UIs into smaller components
2. **Type Safety**: Use TypeScript for all props and state
3. **Accessibility**: Always include ARIA labels, keyboard nav, focus management
4. **Performance**: Use React Query for caching, debounce search inputs
5. **Error Boundaries**: Wrap pages in error boundaries (future enhancement)
6. **Loading States**: Always show loading indicators for async operations
7. **Optimistic Updates**: Update UI immediately, rollback on error
8. **Code Splitting**: Use lazy loading for routes (future enhancement)

## Future Enhancements

- [ ] Dark mode toggle
- [ ] Error boundaries for each page
- [ ] Lazy-loaded routes
- [ ] PWA support (service worker)
- [ ] i18n (internationalization)
- [ ] Advanced filtering on test results
- [ ] Bulk operations (delete multiple tests)
- [ ] Test templates and saved configs
- [ ] Scheduled tests (cron-like)
- [ ] Webhook integrations
