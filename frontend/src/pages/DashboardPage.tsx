import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { dashboardApi } from '../services/api'
import { DashboardStats } from '../types/index'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { useToast } from '../hooks/use-toast'
import {
  StatsCard,
  StatsCardSkeleton,
  RecentTests,
  TestChart,
  ActivityTimeline,
  withDashboardErrorBoundary,
} from '../components/dashboard/index'
import {
  Activity,
  Key,
  TrendingUp,
  RefreshCw,
  Download,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, getScoreColor } from '../lib/utils'

type DateRange = '7d' | '30d' | '90d' | 'all'

function DashboardPageComponent() {
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    data: statsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: () => dashboardApi.stats({ dateRange }),
    refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30s if enabled
    retry: 3,
    staleTime: 10000,
  })

  const stats = statsData?.data

  // Calculate trends (mock - would come from API in production)
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  // Manual refresh
  const handleRefresh = async () => {
    await refetch()
    toast({
      title: 'Dashboard refreshed',
      description: 'Latest data has been loaded.',
    })
  }

  // Export data
  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true)
    try {
      // Mock export - would call API in production
      const exportData = {
        stats,
        exportedAt: new Date().toISOString(),
        dateRange,
      }

      const blob = new Blob(
        [format === 'json' ? JSON.stringify(exportData, null, 2) : convertToCSV(exportData)],
        { type: format === 'json' ? 'application/json' : 'text/csv' }
      )

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sipper-dashboard-${dateRange}-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `Dashboard data exported as ${format.toUpperCase()}.`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export dashboard data.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'Unknown error occurred'}
        </p>
        <Button onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  // Calculate stats values
  const successRate = stats?.totalTests
    ? ((stats.successfulTests / stats.totalTests) * 100).toFixed(1)
    : '0'

  const organizationHealth = getOrganizationHealth(stats)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your SIP testing activities
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Date Range Filter */}
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          {/* Auto-refresh Toggle */}
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="icon"
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
          </Button>

          {/* Manual Refresh */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isFetching}
            title="Refresh now"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>

          {/* Export Menu */}
          <Select onValueChange={(v) => handleExport(v as 'json' | 'csv')}>
            <SelectTrigger className="w-[120px]" disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">Export JSON</SelectItem>
              <SelectItem value="csv">Export CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button asChild>
          <Link to="/test-runner">
            <Play className="mr-2 h-4 w-4" />
            Run Test
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/credentials">
            <Plus className="mr-2 h-4 w-4" />
            Add Credential
          </Link>
        </Button>
      </div>

      {/* Organization Health Status */}
      {stats && (
        <Card className={`border-l-4 ${organizationHealth.color}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Organization Health
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {organizationHealth.icon}
              <div>
                <div className="text-lg font-bold">{organizationHealth.status}</div>
                <p className="text-sm text-muted-foreground">
                  {organizationHealth.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Tests"
              value={stats?.totalTests || 0}
              subtitle="All time"
              icon={Activity}
              trend={{
                value: 12.5,
                isPositive: true,
                label: 'vs last period',
              }}
            />
            <StatsCard
              title="Success Rate"
              value={`${successRate}%`}
              subtitle={`${stats?.successfulTests || 0} / ${stats?.totalTests || 0} tests`}
              icon={TrendingUp}
              valueClassName={getScoreColor(parseFloat(successRate))}
              trend={{
                value: 3.2,
                isPositive: true,
                label: 'vs last period',
              }}
            />
            <StatsCard
              title="Average Score"
              value={stats?.averageScore?.toFixed(1) || '0'}
              subtitle="Out of 100"
              icon={CheckCircle2}
              valueClassName={getScoreColor(stats?.averageScore || 0)}
              trend={{
                value: 5.1,
                isPositive: true,
                label: 'vs last period',
              }}
            />
            <Link to="/credentials">
              <StatsCard
                title="Active Credentials"
                value={stats?.activeCredentials || 0}
                subtitle="Click to manage"
                icon={Key}
              />
            </Link>
          </>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <TestChart
          type="success-rate"
          data={stats!}
          isLoading={isLoading}
          height={300}
        />
        <TestChart
          type="test-types"
          data={stats!}
          isLoading={isLoading}
          height={300}
        />
      </div>

      {/* Timeline Chart */}
      <TestChart
        type="timeline"
        data={stats!}
        isLoading={isLoading}
        height={300}
      />

      {/* Recent Tests & Activity Timeline */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentTests
            tests={stats?.recentTests || []}
            isLoading={isLoading}
            maxItems={8}
          />
        </div>
        <div className="lg:col-span-1">
          <ActivityTimeline
            tests={stats?.recentTests || []}
            isLoading={isLoading}
            maxItems={8}
          />
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && stats?.totalTests === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Activity className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No tests yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Get started by adding a SIP credential and running your first test.
              We'll show you comprehensive analytics once you have some data.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link to="/credentials">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Credential
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/test-runner">
                  <Play className="mr-2 h-4 w-4" />
                  Run Test
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Helper functions
function convertToCSV(data: any): string {
  // Simple CSV conversion for dashboard stats
  const rows = [
    ['Metric', 'Value'],
    ['Total Tests', data.stats?.totalTests || 0],
    ['Successful Tests', data.stats?.successfulTests || 0],
    ['Failed Tests', (data.stats?.totalTests || 0) - (data.stats?.successfulTests || 0)],
    ['Average Score', data.stats?.averageScore || 0],
    ['Active Credentials', data.stats?.activeCredentials || 0],
    ['Date Range', data.dateRange],
    ['Exported At', data.exportedAt],
  ]
  return rows.map((row) => row.join(',')).join('\n')
}

function getOrganizationHealth(stats?: DashboardStats) {
  if (!stats || stats.totalTests === 0) {
    return {
      status: 'Getting Started',
      message: 'No tests run yet. Add credentials and run your first test.',
      icon: <AlertCircle className="h-5 w-5 text-muted-foreground" />,
      color: 'border-l-gray-400',
    }
  }

  const successRate = (stats.successfulTests / stats.totalTests) * 100

  if (successRate >= 95) {
    return {
      status: 'Excellent',
      message: 'All systems performing optimally.',
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
      color: 'border-l-green-600',
    }
  } else if (successRate >= 80) {
    return {
      status: 'Good',
      message: 'Most tests passing. Minor issues detected.',
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      color: 'border-l-green-500',
    }
  } else if (successRate >= 60) {
    return {
      status: 'Fair',
      message: 'Some issues detected. Review failed tests.',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
      color: 'border-l-yellow-600',
    }
  } else {
    return {
      status: 'Needs Attention',
      message: 'High failure rate. Immediate action required.',
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      color: 'border-l-red-600',
    }
  }
}

// Export wrapped with error boundary
export const DashboardPage = withDashboardErrorBoundary(DashboardPageComponent)
