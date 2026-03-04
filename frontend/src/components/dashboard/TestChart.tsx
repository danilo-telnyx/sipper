import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { TestResult, TestType, DashboardStats } from '../../types/index'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface TestChartProps {
  type: 'success-rate' | 'test-types' | 'timeline' | 'score-distribution'
  data: DashboardStats | TestResult[]
  title?: string
  height?: number
  isLoading?: boolean
}

export function TestChart({ type, data, title, height = 300, isLoading }: TestChartProps) {
  const chartData = useMemo(() => {
    if (!data) return null

    switch (type) {
      case 'success-rate':
        return generateSuccessRateChart(data as DashboardStats)
      case 'test-types':
        return generateTestTypesChart(data as DashboardStats)
      case 'timeline':
        return generateTimelineChart(data as DashboardStats)
      case 'score-distribution':
        return generateScoreDistributionChart(data as TestResult[])
      default:
        return null
    }
  }, [type, data])

  const getChartTitle = () => {
    if (title) return title
    switch (type) {
      case 'success-rate':
        return 'Success vs Failure'
      case 'test-types':
        return 'Tests by Type'
      case 'timeline':
        return 'Success Rate Over Time'
      case 'score-distribution':
        return 'Score Distribution'
      default:
        return 'Chart'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center bg-muted animate-pulse rounded-lg"
            style={{ height: `${height}px` }}
          >
            <span className="text-muted-foreground">Loading chart...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chartData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="flex items-center justify-center text-muted-foreground"
            style={{ height: `${height}px` }}
          >
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getChartTitle()}</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: `${height}px` }}>
          {type === 'success-rate' && (
            <Pie
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          )}
          {type === 'test-types' && (
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                },
              }}
            />
          )}
          {type === 'timeline' && (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: (value) => `${value}%`,
                    },
                  },
                },
              }}
            />
          )}
          {type === 'score-distribution' && (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function generateSuccessRateChart(stats: DashboardStats) {
  const successfulTests = stats.successfulTests || 0
  const failedTests = (stats.totalTests || 0) - successfulTests

  return {
    labels: ['Successful', 'Failed'],
    datasets: [
      {
        data: [successfulTests, failedTests],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // green-600
          'rgba(239, 68, 68, 0.8)', // red-600
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }
}

function generateTestTypesChart(stats: DashboardStats) {
  const testsByType = stats.testsByType || {}
  const labels = Object.keys(testsByType).map((type) =>
    type.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  )
  const data = Object.values(testsByType)

  const colors = [
    'rgba(59, 130, 246, 0.8)', // blue
    'rgba(168, 85, 247, 0.8)', // purple
    'rgba(236, 72, 153, 0.8)', // pink
    'rgba(249, 115, 22, 0.8)', // orange
    'rgba(34, 197, 94, 0.8)', // green
    'rgba(14, 165, 233, 0.8)', // sky
    'rgba(244, 63, 94, 0.8)', // rose
    'rgba(251, 191, 36, 0.8)', // amber
    'rgba(139, 92, 246, 0.8)', // violet
  ]

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors.slice(0, data.length),
        borderColor: colors.slice(0, data.length).map((c) => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  }
}

function generateTimelineChart(stats: DashboardStats) {
  const history = stats.successRateHistory || []

  return {
    labels: history.map((h) => new Date(h.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: history.map((h) => h.successRate),
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsl(var(--primary) / 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
}

function generateScoreDistributionChart(tests: TestResult[]) {
  const ranges = ['0-20', '21-40', '41-60', '61-80', '81-100']
  const distribution = ranges.map((range) => {
    const [min, max] = range.split('-').map(Number)
    return tests.filter((test) => test.score >= min && test.score <= max).length
  })

  return {
    labels: ranges,
    datasets: [
      {
        label: 'Number of Tests',
        data: distribution,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)', // red - poor
          'rgba(249, 115, 22, 0.8)', // orange - below average
          'rgba(251, 191, 36, 0.8)', // amber - average
          'rgba(132, 204, 22, 0.8)', // lime - good
          'rgba(34, 197, 94, 0.8)', // green - excellent
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(132, 204, 22, 1)',
          'rgba(34, 197, 94, 1)',
        ],
        borderWidth: 2,
      },
    ],
  }
}
