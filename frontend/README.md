# SIPPER Frontend

Modern, responsive web interface for the SIPPER SIP Testing Platform.

## Features

- 🔐 **Authentication**: Login/Register with JWT token management
- 📊 **Dashboard**: Real-time test statistics and history
- 🔑 **SIP Credentials Manager**: Add, edit, delete multiple SIP accounts
- 🧪 **Test Runner**: Configure and execute SIP protocol tests
- 📈 **Test Results Viewer**: Detailed results with RFC compliance, timing charts, and logs
- 👥 **User Management**: Admin and org-admin role-based access control
- ⚙️ **Organization Settings**: Configure org-wide preferences
- 🔄 **Real-time Updates**: WebSocket-powered live test progress
- 📤 **Export**: JSON and CSV test result exports
- 📱 **Mobile-Friendly**: Fully responsive design
- ♿ **Accessible**: WCAG compliant UI components

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (accessible primitives)
- **State Management**: Zustand
- **API Client**: TanStack Query (React Query)
- **WebSocket**: Socket.io Client
- **Charts**: Chart.js + react-chartjs-2
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, cards, etc.)
│   │   └── layouts/        # Layout components (Auth, Dashboard)
│   ├── pages/              # Page components
│   │   ├── auth/           # Login, Register
│   │   ├── DashboardPage.tsx
│   │   ├── CredentialsPage.tsx
│   │   ├── TestRunnerPage.tsx
│   │   ├── TestResultsPage.tsx
│   │   ├── UsersPage.tsx
│   │   └── OrganizationPage.tsx
│   ├── services/           # API and WebSocket services
│   │   ├── api.ts          # REST API client
│   │   └── websocket.ts    # WebSocket connection manager
│   ├── store/              # Zustand state stores
│   │   └── auth.ts         # Authentication state
│   ├── hooks/              # Custom React hooks
│   │   └── use-toast.ts    # Toast notification hook
│   ├── lib/                # Utilities
│   │   └── utils.ts        # Helper functions
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # All app types
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # App entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (default: `http://localhost:8080`)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
VITE_APP_VERSION=0.1.0
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Component Documentation

### Pages

#### DashboardPage
- Displays test statistics and recent activity
- Real-time updates every 30 seconds
- Success rate trending chart
- Quick links to recent test results

#### CredentialsPage
- CRUD operations for SIP credentials
- Supports UDP, TCP, and TLS transports
- Test connection button
- Last tested timestamp tracking

#### TestRunnerPage
- Select credential and test type
- Configure test parameters
- Real-time progress tracking via WebSocket
- Multiple test types available:
  - Basic Registration
  - Authentication
  - Call Flow
  - Codec Negotiation
  - DTMF
  - Hold/Resume
  - Call Transfer
  - Conference
  - RFC Compliance

#### TestResultsPage
- List view of all tests
- Detailed test result viewer with tabs:
  - Overview: Summary and errors
  - RFC Compliance: Standards validation
  - Timings: Latency analysis with charts
  - Logs: Detailed execution logs
- Export to JSON/CSV

#### UsersPage (Admin/Org-Admin only)
- User management interface
- Role-based access control (user, org-admin, admin)
- Search functionality
- Create, edit, delete users

#### OrganizationPage (Org-Admin only)
- Organization settings management
- Configure retention policies
- Set notification email
- Toggle public test sharing
- View plan limits

### Authentication

The app uses JWT token authentication:
- Tokens stored in localStorage via Zustand persist
- Automatic token refresh
- 401 handling redirects to login
- Protected routes require authentication

### Real-time Updates

WebSocket connection managed by `wsService`:
- Connects on dashboard mount
- Subscribes to test progress events
- Handles reconnection automatically
- Emits events to React components

### Accessibility

All components follow WCAG 2.1 AA standards:
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

## API Integration

### REST API

All API calls use the `services/api.ts` client:

```typescript
import { authApi, testsApi, credentialsApi } from '@/services/api'

// Login
const response = await authApi.login({ email, password })

// Run test
const test = await testsApi.create(config)

// List credentials
const creds = await credentialsApi.list()
```

### WebSocket Events

Subscribe to real-time events:

```typescript
import { wsService } from '@/services/websocket'

// Subscribe to test progress
const unsubscribe = wsService.subscribeToTest(testId, (progress) => {
  console.log(progress.currentStep, progress.progress)
})

// Cleanup
unsubscribe()
```

## Theming

The app supports light and dark themes via CSS variables. Colors are defined in `src/index.css` using HSL values.

To add dark mode toggle:
1. Add theme state to Zustand store
2. Toggle `dark` class on `<html>` element
3. CSS variables automatically switch

## Performance

- Code splitting via React Router lazy loading
- Optimistic UI updates
- Debounced search inputs
- Query caching with TanStack Query
- Memoized chart data

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Development Tips

### Adding a New Page

1. Create page component in `src/pages/`
2. Add route to `App.tsx`
3. Add navigation link to `DashboardLayout.tsx`
4. Implement permission checks if needed

### Adding a New API Endpoint

1. Add TypeScript types to `src/types/index.ts`
2. Add API function to `src/services/api.ts`
3. Use with TanStack Query in components

### Creating a New UI Component

1. Add to `src/components/ui/`
2. Follow Radix UI patterns for accessibility
3. Use Tailwind classes with `cn()` utility
4. Export from index file

## License

Proprietary - All rights reserved
