# Dashboard Components

Production-ready dashboard components for SIPPER frontend with comprehensive analytics and real-time monitoring.

## Components

### StatsCard
Displays a single metric with optional trend indicator.

**Features:**
- Trend indicators (up/down/flat with percentage)
- Custom icons
- Skeleton loading state
- Hover effects

**Props:**
```typescript
interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  valueClassName?: string
  isLoading?: boolean
}
```

**Usage:**
```tsx
<StatsCard
  title="Total Tests"
  value={1234}
  icon={Activity}
  trend={{ value: 12.5, isPositive: true, label: 'vs last period' }}
/>
```

---

### RecentTests
Sortable and filterable table of recent test runs.

**Features:**
- Search by credential name or test type
- Filter by status (success/failed)
- Filter by test type
- Sort by date, score, status, or type
- Responsive layout
- Empty states
- Skeleton loading
- Click to view details

**Props:**
```typescript
interface RecentTestsProps {
  tests: TestResult[]
  isLoading?: boolean
  maxItems?: number
}
```

**Usage:**
```tsx
<RecentTests
  tests={recentTests}
  isLoading={false}
  maxItems={10}
/>
```

---

### TestChart
Multiple chart visualizations using Chart.js.

**Chart Types:**
1. **success-rate** - Pie chart showing successful vs failed tests
2. **test-types** - Doughnut chart showing distribution by test type
3. **timeline** - Line chart showing success rate over time
4. **score-distribution** - Bar chart showing score ranges

**Features:**
- Responsive charts
- Loading states
- Empty states
- Customizable height
- Color-coded by meaning

**Props:**
```typescript
interface TestChartProps {
  type: 'success-rate' | 'test-types' | 'timeline' | 'score-distribution'
  data: DashboardStats | TestResult[]
  title?: string
  height?: number
  isLoading?: boolean
}
```

**Usage:**
```tsx
<TestChart
  type="success-rate"
  data={dashboardStats}
  height={300}
/>
```

---

### ActivityTimeline
Visual timeline of recent test activities.

**Features:**
- Chronological event list
- Color-coded status icons
- Relative timestamps ("2 hours ago")
- Hover effects
- Empty states
- Skeleton loading

**Props:**
```typescript
interface ActivityTimelineProps {
  tests: TestResult[]
  isLoading?: boolean
  maxItems?: number
}
```

**Usage:**
```tsx
<ActivityTimeline
  tests={recentTests}
  maxItems={8}
/>
```

---

## DashboardPage

Main dashboard page integrating all components.

**Features:**
- ✅ Real-time updates (30s polling, toggleable)
- ✅ Manual refresh button
- ✅ Date range filters (7d, 30d, 90d, all time)
- ✅ Export functionality (JSON/CSV)
- ✅ Quick actions (Run Test, Add Credential)
- ✅ Organization health status
- ✅ Stats cards with trends
- ✅ Multiple chart visualizations
- ✅ Recent tests table (sortable, filterable)
- ✅ Activity timeline
- ✅ Empty states
- ✅ Error boundaries
- ✅ Skeleton loaders
- ✅ Responsive grid layout
- ✅ Auto-refresh toggle

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ Header (filters, actions, export)  │
├─────────────────────────────────────┤
│ Quick Actions                        │
├─────────────────────────────────────┤
│ Organization Health Status           │
├─────────────────────────────────────┤
│ Stats Cards (4 columns)              │
├─────────────────────────────────────┤
│ Success Rate Chart | Test Types     │
├─────────────────────────────────────┤
│ Timeline Chart (full width)          │
├─────────────────────────────────────┤
│ Recent Tests (2/3) | Activity (1/3) │
└─────────────────────────────────────┘
```

---

## Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `chart.js` + `react-chartjs-2` - Charts
- `lucide-react` - Icons
- `date-fns` - Date formatting (if needed)
- Tailwind CSS - Styling
- shadcn/ui components - Card, Button, Select, etc.

---

## API Integration

### Dashboard Stats Endpoint
```typescript
GET /dashboard/stats?dateRange=30d

Response:
{
  success: true,
  data: {
    totalTests: number
    successfulTests: number
    failedTests: number
    averageScore: number
    activeCredentials: number
    recentTests: TestResult[]
    testsByType: Record<TestType, number>
    successRateHistory: Array<{
      date: string
      successRate: number
    }>
  }
}
```

---

## Real-Time Updates

**Polling Strategy:**
- Default: 30 seconds when auto-refresh is enabled
- Stale time: 10 seconds
- Retry: 3 attempts on failure

**Manual Refresh:**
- Refresh button triggers immediate refetch
- Shows spinner during fetch
- Toast notification on success

**WebSocket (Future Enhancement):**
Currently using polling. For true real-time updates, integrate Socket.io:

```typescript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000')

socket.on('test-completed', (data) => {
  queryClient.invalidateQueries(['dashboard-stats'])
})
```

---

## Export Functionality

**Formats:**
- JSON - Full structured data
- CSV - Simplified metrics table

**File Naming:**
`sipper-dashboard-{dateRange}-{timestamp}.{format}`

**Export Content:**
- Dashboard statistics
- Date range
- Export timestamp

---

## Organization Health Logic

| Success Rate | Status | Color | Icon |
|-------------|--------|-------|------|
| ≥ 95% | Excellent | Green | CheckCircle2 |
| 80-94% | Good | Light Green | CheckCircle2 |
| 60-79% | Fair | Yellow | AlertTriangle |
| < 60% | Needs Attention | Red | AlertCircle |
| No tests | Getting Started | Gray | AlertCircle |

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout
- Stacked stats cards
- Collapsed filters
- Simplified table view

**Tablet (768px - 1024px):**
- 2 column grid
- Side-by-side charts
- Full table features

**Desktop (> 1024px):**
- 4 column stats grid
- 2-column chart layout
- 2/3 + 1/3 split for tests/timeline

---

## Performance Optimizations

1. **Memoization:** Charts and filtered data use `useMemo`
2. **Lazy Loading:** Components render only visible items
3. **Pagination:** Tables support pagination (future)
4. **Code Splitting:** Dashboard components are separate bundle
5. **Stale-While-Revalidate:** React Query caching strategy

---

## Testing

**Unit Tests (TODO):**
```bash
npm test -- dashboard
```

**Integration Tests (TODO):**
- Test real-time updates
- Test export functionality
- Test filters and sorting

**E2E Tests (TODO):**
- Full dashboard flow
- Error scenarios
- Loading states

---

## Accessibility

- ✅ Keyboard navigation
- ✅ ARIA labels on interactive elements
- ✅ Color contrast (WCAG AA)
- ✅ Screen reader friendly
- ✅ Focus indicators

---

## Future Enhancements

- [ ] WebSocket real-time updates
- [ ] Custom date range picker
- [ ] Downloadable reports (PDF)
- [ ] Scheduled email reports
- [ ] Comparison mode (periods)
- [ ] Custom dashboards (saved layouts)
- [ ] Widget-based layout (drag & drop)
- [ ] More chart types (radar, scatter)
- [ ] Anomaly detection alerts
- [ ] Predictive analytics

---

## Troubleshooting

**Charts not rendering:**
- Check if Chart.js is properly registered
- Verify data format matches expected structure
- Check console for errors

**Slow loading:**
- Reduce refetch interval
- Implement pagination
- Check API response times

**Export not working:**
- Check browser download permissions
- Verify data format is correct
- Check console for blob errors

---

## Credits

Built for SIPPER SIP testing platform.
Uses Chart.js, React Query, and shadcn/ui.
