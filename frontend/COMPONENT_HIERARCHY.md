# Test Runner Component Hierarchy

## Visual Structure

```
TestRunnerPage (Main Container)
│
├── Header Section
│   ├── Title + Description
│   └── Action Bar
│       ├── Connection Status Badge (🟢 Connected / 🟡 Polling / ⚪ Offline)
│       └── History Button → Navigate to /test-results
│
├── Progress Stepper Card
│   └── ProgressStepper Component
│       ├── Step 1: Credential (○ → ◉ → ●)
│       ├── Step 2: Test Type
│       ├── Step 3: Options
│       └── Step 4: Execute
│
├── Step Content Area (Conditional Rendering)
│   │
│   ├── [Step 0] CredentialSelector
│   │   ├── Search Input (with 🔍 icon)
│   │   └── Credential Cards Grid
│   │       └── Card (clickable, selected state)
│   │           ├── Name + Active/Inactive Badge
│   │           ├── username@domain
│   │           └── Transport, Port, Last Tested
│   │
│   ├── [Step 1] TestTypeSelector
│   │   └── Test Type Grid (3 columns)
│   │       └── Test Card (9 types)
│   │           ├── Icon + Label
│   │           ├── Complexity Badge (basic/intermediate/advanced)
│   │           ├── Duration Badge (~30s to ~10min)
│   │           └── Description
│   │
│   ├── [Step 2] Advanced Options & Templates
│   │   ├── TestTemplates (collapsible)
│   │   │   └── Template Cards (2 columns)
│   │   │       ├── Quick Check
│   │   │       ├── Full Validation
│   │   │       ├── Load Test
│   │   │       └── RFC Compliance
│   │   │
│   │   └── AdvancedOptions (collapsible)
│   │       ├── Endpoint Override Input
│   │       └── Grid (3 columns)
│   │           ├── Timeout Input
│   │           ├── Retries Input
│   │           └── Concurrent Calls Input
│   │
│   └── [Step 3] TestExecutor
│       ├── Header
│       │   ├── Title + Status Description
│       │   └── Elapsed Time (🕐 MM:SS)
│       │
│       ├── Success/Failure Animation (conditional)
│       │   ├── ✅ Large animated checkmark (success)
│       │   └── ❌ Large animated X (failure)
│       │
│       ├── Progress Section (while running)
│       │   ├── Current Step Label + Progress %
│       │   ├── Progress Bar
│       │   ├── Status Message
│       │   └── Status Badge (running/completed/failed)
│       │
│       ├── LiveLog Component
│       │   ├── Terminal Header (dark bg)
│       │   │   ├── 💻 Terminal icon + "Test Execution Log"
│       │   │   └── Running indicator (🟢 pulsing dot)
│       │   │
│       │   ├── Log Content (scrollable)
│       │   │   └── Log Lines (auto-scroll)
│       │   │       ├── Timestamp (HH:MM:SS)
│       │   │       ├── Level Icon (ℹ️ 🐛 ⚠️ ❌)
│       │   │       └── Message (color-coded)
│       │   │
│       │   └── Footer Stats
│       │       ├── Line count
│       │       └── Error/Warning counts
│       │
│       ├── Action Buttons
│       │   ├── [Running] Cancel Test (red, destructive)
│       │   └── [Completed]
│       │       ├── Retry Test (outline)
│       │       └── View Full Results (primary)
│       │
│       └── Keyboard Hints
│           └── "Press ESC to cancel"
│
├── Navigation Buttons (Steps 0-2 only)
│   ├── Previous Button (left)
│   └── Next / Run Test Button (right)
│
└── Keyboard Shortcuts Info Card
    └── "Enter: Next/Run | ESC: Cancel"
```

## Component Props Flow

### CredentialSelector
```typescript
{
  credentials: SipCredential[]      // From API
  selectedId: string                // Controlled state
  onSelect: (id: string) => void    // Update parent state
  disabled?: boolean                // During test run
}
```

### TestTypeSelector
```typescript
{
  selectedType: TestType            // Controlled state
  onSelect: (type: TestType) => void
  disabled?: boolean
}
```

### AdvancedOptions
```typescript
{
  options: {
    endpoint?: string
    timeout?: number
    retries?: number
    concurrentCalls?: number
  }
  onChange: (options) => void
  disabled?: boolean
}
```

### TestTemplates
```typescript
{
  onApplyTemplate: (template: {
    testType: TestType
    options: {...}
  }) => void
  disabled?: boolean
}
```

### ProgressStepper
```typescript
{
  steps: Step[]                     // Step definitions
  currentStep: number               // 0-3
  completedSteps?: number[]         // Array of completed indices
}
```

### LiveLog
```typescript
{
  logs: TestLog[]                   // Real-time log array
  isRunning: boolean                // Show pulsing indicator
  maxHeight?: string                // Scrollable container height
}
```

### TestExecutor
```typescript
{
  isRunning: boolean
  progress: TestProgress | null     // Real-time progress
  logs: TestLog[]                   // Passed to LiveLog
  elapsedTime: number               // Seconds counter
  onCancel: () => void
  onRetry: () => void
  onViewResults: () => void
  testCompleted: boolean
  testSuccess: boolean | null
}
```

## State Management

### Page-Level State
```typescript
// Wizard navigation
currentStep: 0-3

// Configuration
selectedCredential: string
selectedTestType: TestType
advancedOptions: { endpoint, timeout, retries, concurrentCalls }

// Execution
isRunning: boolean
currentTestId: string | null
progress: TestProgress | null
logs: TestLog[]
elapsedTime: number
testCompleted: boolean
testSuccess: boolean | null
connectionStatus: 'connected' | 'polling' | 'disconnected'
```

### WebSocket Events
```typescript
// Subscribed events
'test:progress'   → Update progress state
'test:log'        → Append to logs array
'test:completed'  → Set testCompleted=true, testSuccess=true
'test:failed'     → Set testCompleted=true, testSuccess=false
```

## User Flow

```
START
  │
  ├─→ [Step 0] Select Credential
  │   - Search/browse credentials
  │   - Click to select
  │   - Press Enter or "Next" button
  │
  ├─→ [Step 1] Choose Test Type
  │   - Browse 9 test types
  │   - See complexity/duration
  │   - Click to select
  │   - Press Enter or "Next" button
  │
  ├─→ [Step 2] Configure Options
  │   - Optional: Apply template
  │   - Optional: Adjust advanced settings
  │   - Press "Run Test" button
  │
  ├─→ [Step 3] Test Execution
  │   ├─→ Test starts
  │   │   - Progress bar animates
  │   │   - Logs stream in real-time
  │   │   - Timer counts up
  │   │   - Can press ESC or Cancel button
  │   │
  │   ├─→ Test completes successfully
  │   │   - ✅ Success animation
  │   │   - "Retry" or "View Results" buttons
  │   │
  │   └─→ Test fails
  │       - ❌ Failure animation
  │       - "Retry" or "View Results" buttons
  │
END (or loop back with Retry)
```

## Responsive Breakpoints

- **Mobile (< 640px)**
  - Single column layout
  - Stacked stepper
  - Full-width cards
  - Collapsible sections

- **Tablet (640px - 1024px)**
  - 2-column grids
  - Horizontal stepper
  - Wider cards

- **Desktop (> 1024px)**
  - 3-column grids
  - Full horizontal stepper
  - Optimal spacing

## Interaction States

### Credential/Test Cards
- **Default**: Border + hover effect
- **Hover**: Highlighted border
- **Selected**: Primary border + ring + background tint
- **Disabled**: Reduced opacity + no pointer

### Buttons
- **Default**: Enabled, clickable
- **Hover**: Slight scale/shadow
- **Active**: Pressed state
- **Disabled**: Opacity 50%, no hover, cursor not-allowed
- **Loading**: Spinner icon

### Progress Stepper
- **Completed**: ✅ Filled circle, primary color
- **Current**: 🔄 Spinning loader, primary color
- **Pending**: ○ Empty circle, muted color

## Animation Details

### Success Animation
- **Duration**: 3 seconds
- **Effect**: Zoom-in-50, fade-in
- **Element**: Large checkmark icon (h-20 w-20)
- **Color**: Green-600
- **Additional**: Pulsing animation

### Failure Animation
- **Duration**: 3 seconds
- **Effect**: Zoom-in-50, fade-in
- **Element**: Large X icon (h-20 w-20)
- **Color**: Red-600
- **Additional**: Pulsing animation

### Progress Bar
- **Transition**: All 300ms
- **Effect**: Smooth width change
- **Color**: Primary gradient

### Log Auto-Scroll
- **Behavior**: Smooth scroll
- **Trigger**: New log entry
- **Target**: Bottom of container

---

**Legend:**
- ○ = Pending step
- ◉ = Current step (with spinner)
- ● = Completed step (with checkmark)
- 🟢 = Active/Connected
- 🟡 = Warning/Polling
- ⚪ = Inactive/Offline
