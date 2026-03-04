import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { TestResult } from '../../types/index'
import { formatDate, formatDuration, getScoreColor } from '../../lib/utils'
import { CheckCircle2, XCircle, ArrowUpDown, X } from 'lucide-react'
import { Line } from 'react-chartjs-2'

interface ComparisonViewProps {
  results: TestResult[]
  onRemove?: (id: string) => void
  onClose?: () => void
}

export function ComparisonView({ results, onRemove, onClose }: ComparisonViewProps) {
  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Select 2 or more test results to compare
          </p>
        </CardContent>
      </Card>
    )
  }

  if (results.length === 1) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Select at least one more test result to enable comparison
          </p>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data for comparison
  const chartData = {
    labels: results[0].timings.map((_, i) => `Step ${i + 1}`),
    datasets: results.map((result, index) => ({
      label: `${result.credentialName} (${result.score})`,
      data: result.timings.map(t => t.duration),
      borderColor: `hsl(${(index * 360) / results.length}, 70%, 50%)`,
      backgroundColor: `hsla(${(index * 360) / results.length}, 70%, 50%, 0.1)`,
      tension: 0.4,
    })),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Test Result Comparison</CardTitle>
              <CardDescription>
                Comparing {results.length} test results side-by-side
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md"
              >
                {result.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">{result.credentialName}</span>
                <span className={`text-sm font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </span>
                {onRemove && (
                  <button
                    onClick={() => onRemove(result.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Metric</th>
                  {results.map((result) => (
                    <th key={result.id} className="text-left py-3 px-4 font-medium">
                      {result.credentialName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Status</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Score</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      <span className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Duration</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {formatDuration(result.duration)}
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Test Date</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {formatDate(result.startedAt)}
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Success Rate</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {result.details.successRate.toFixed(1)}%
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Avg Latency</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {result.details.averageLatency}ms
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Min Latency</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {result.details.minLatency}ms
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Max Latency</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {result.details.maxLatency}ms
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Total Requests</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {result.details.totalRequests}
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">Failed Requests</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      <span className={result.details.failedRequests > 0 ? 'text-red-600 font-semibold' : ''}>
                        {result.details.failedRequests}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">RFC Compliance</td>
                  {results.map((result) => (
                    <td key={result.id} className="py-3 px-4">
                      {result.rfcCompliance.filter(r => r.compliant).length} /{' '}
                      {result.rfcCompliance.length}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Timing Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Response Time Comparison</CardTitle>
          <CardDescription>
            Latency comparison across test steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: true,
                    position: 'top',
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Duration (ms)',
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Test Step',
                    },
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Winner/Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Highest Score</div>
              <div className="font-semibold text-lg">
                {results.reduce((prev, current) => 
                  current.score > prev.score ? current : prev
                ).credentialName}
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {Math.max(...results.map(r => r.score))}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Fastest</div>
              <div className="font-semibold text-lg">
                {results.reduce((prev, current) => 
                  current.duration < prev.duration ? current : prev
                ).credentialName}
              </div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {formatDuration(Math.min(...results.map(r => r.duration)))}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Most Reliable</div>
              <div className="font-semibold text-lg">
                {results.reduce((prev, current) => 
                  current.details.successRate > prev.details.successRate ? current : prev
                ).credentialName}
              </div>
              <div className="text-2xl font-bold text-purple-600 mt-1">
                {Math.max(...results.map(r => r.details.successRate)).toFixed(1)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
