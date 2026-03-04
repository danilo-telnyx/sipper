import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { TestResult } from '../../types/index'
import { formatDate, formatDuration, getScoreColor } from '../../lib/utils'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Activity,
  FileText,
  BarChart3,
  Network,
  Share2,
  PlayCircle,
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import * as Tabs from '@radix-ui/react-tabs'
import { SipMessageViewer } from './SipMessageViewer'
import { TimingDiagram } from './TimingDiagram'
import { ExportButton } from './ExportButton'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface ResultDetailProps {
  testResult: TestResult
  onRerun?: () => void
  onShare?: () => void
}

// Mock SIP messages for demo (in production, these would come from the API)
const mockSipMessages = [
  {
    direction: 'sent' as const,
    timestamp: new Date().toISOString(),
    method: 'REGISTER',
    headers: {
      'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK-123456',
      'From': '<sip:user@domain.com>;tag=abc123',
      'To': '<sip:user@domain.com>',
      'Call-ID': 'call-id-123456@domain.com',
      'CSeq': '1 REGISTER',
      'Contact': '<sip:user@192.168.1.100:5060>',
      'Expires': '3600',
      'Max-Forwards': '70',
      'User-Agent': 'SIPPER Test Client/1.0',
      'Content-Length': '0',
    },
  },
  {
    direction: 'received' as const,
    timestamp: new Date(Date.now() + 150).toISOString(),
    statusCode: 401,
    statusText: 'Unauthorized',
    headers: {
      'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK-123456;received=203.0.113.1',
      'From': '<sip:user@domain.com>;tag=abc123',
      'To': '<sip:user@domain.com>;tag=xyz789',
      'Call-ID': 'call-id-123456@domain.com',
      'CSeq': '1 REGISTER',
      'WWW-Authenticate': 'Digest realm="domain.com", nonce="abc123nonce456"',
      'Server': 'SIP Server/1.0',
      'Content-Length': '0',
    },
  },
]

export function ResultDetail({ testResult, onRerun, onShare }: ResultDetailProps) {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="text-lg font-semibold">
                {testResult.success ? 'Passed' : 'Failed'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(testResult.score)}`}>
              {testResult.score}
            </div>
            <p className="text-xs text-muted-foreground mt-1">out of 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(testResult.duration)}</div>
            <p className="text-xs text-muted-foreground mt-1">Total test time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testResult.details.successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {testResult.details.successfulRequests}/{testResult.details.totalRequests} requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Test ID: <span className="font-mono font-medium">{testResult.id}</span>
            </div>
            <div className="flex gap-2">
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              )}
              {onRerun && (
                <Button variant="outline" size="sm" onClick={onRerun}>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Re-run Test
                </Button>
              )}
              <ExportButton testResult={testResult} size="sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-2 border-b mb-6">
          <Tabs.Trigger
            value="overview"
            className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="sip-messages"
            className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            <Network className="h-4 w-4 inline mr-2" />
            SIP Messages
          </Tabs.Trigger>
          <Tabs.Trigger
            value="timing"
            className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Timing
          </Tabs.Trigger>
          <Tabs.Trigger
            value="rfc-compliance"
            className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            <CheckCircle2 className="h-4 w-4 inline mr-2" />
            RFC Compliance
          </Tabs.Trigger>
          <Tabs.Trigger
            value="charts"
            className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Charts
          </Tabs.Trigger>
          <Tabs.Trigger
            value="logs"
            className="px-4 py-2 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Logs
          </Tabs.Trigger>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Content value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
              <CardDescription>
                {testResult.credentialName} • {formatDate(testResult.startedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-muted-foreground">Test Type</div>
                  <div className="font-medium">{testResult.testType.replace(/-/g, ' ')}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Average Latency</div>
                  <div className="font-medium">{testResult.details.averageLatency}ms</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Min Latency</div>
                  <div className="font-medium">{testResult.details.minLatency}ms</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Max Latency</div>
                  <div className="font-medium">{testResult.details.maxLatency}ms</div>
                </div>
              </div>

              {testResult.details.summary && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-2">Summary</div>
                  <p className="text-sm text-muted-foreground">{testResult.details.summary}</p>
                </div>
              )}

              {/* Errors */}
              {testResult.details.errors.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-3 text-red-600 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Errors ({testResult.details.errors.length})
                  </div>
                  <div className="space-y-2">
                    {testResult.details.errors.map((error, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm flex-1">
                          <div className="font-medium">{error.code}</div>
                          <div className="text-muted-foreground mt-1">{error.message}</div>
                          {error.sipResponse && (
                            <pre className="mt-2 p-2 bg-red-100 rounded text-xs font-mono overflow-x-auto">
                              {error.sipResponse}
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {testResult.details.warnings.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-sm font-medium mb-3 text-yellow-600 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings ({testResult.details.warnings.length})
                  </div>
                  <div className="space-y-2">
                    {testResult.details.warnings.map((warning, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm flex-1">
                          <div className="font-medium">{warning.code}</div>
                          <div className="text-muted-foreground mt-1">{warning.message}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* SIP Messages Tab */}
        <Tabs.Content value="sip-messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SIP Message Flow</CardTitle>
              <CardDescription>
                Complete SIP message exchange with syntax highlighting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockSipMessages.map((msg, i) => (
                <SipMessageViewer key={i} message={msg} index={i} />
              ))}
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Timing Tab */}
        <Tabs.Content value="timing">
          <TimingDiagram timings={testResult.timings} />
        </Tabs.Content>

        {/* RFC Compliance Tab */}
        <Tabs.Content value="rfc-compliance">
          <Card>
            <CardHeader>
              <CardTitle>RFC Compliance Results</CardTitle>
              <CardDescription>
                Validation against SIP protocol standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResult.rfcCompliance.map((item, i) => {
                  const Icon = item.compliant
                    ? CheckCircle2
                    : item.severity === 'critical'
                    ? XCircle
                    : item.severity === 'warning'
                    ? AlertTriangle
                    : Info

                  const colorClass = item.compliant
                    ? 'border-green-500 bg-green-50'
                    : item.severity === 'critical'
                    ? 'border-red-500 bg-red-50'
                    : item.severity === 'warning'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-blue-500 bg-blue-50'

                  const iconColor = item.compliant
                    ? 'text-green-600'
                    : item.severity === 'critical'
                    ? 'text-red-600'
                    : item.severity === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'

                  return (
                    <div key={i} className={`flex gap-3 p-4 rounded-md border-l-4 ${colorClass}`}>
                      <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                      <div className="flex-1">
                        <div className="font-medium">
                          RFC {item.rfc} §{item.section}
                        </div>
                        <div className="text-sm mt-1">{item.requirement}</div>
                        {item.details && (
                          <div className="text-sm mt-2 text-muted-foreground">{item.details}</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>

        {/* Charts Tab */}
        <Tabs.Content value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Distribution</CardTitle>
              <CardDescription>
                Latency over time for each request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {testResult.timings.length > 0 && (
                  <Line
                    data={{
                      labels: testResult.timings.map((_, i) => `${i + 1}`),
                      datasets: [
                        {
                          label: 'Duration (ms)',
                          data: testResult.timings.map((t) => t.duration),
                          borderColor: 'rgb(59, 130, 246)',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
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
                          title: {
                            display: true,
                            text: 'Duration (ms)',
                          },
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Request #',
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Successful Requests</span>
                    <span className="font-semibold text-green-600">
                      {testResult.details.successfulRequests}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-600 h-4 rounded-full transition-all"
                      style={{ width: `${testResult.details.successRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Failed: {testResult.details.failedRequests}</span>
                    <span>{testResult.details.successRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protocol Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compliant Rules</span>
                    <span className="font-semibold text-green-600">
                      {testResult.rfcCompliance.filter(r => r.compliant).length} /{' '}
                      {testResult.rfcCompliance.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full transition-all"
                      style={{
                        width: `${
                          (testResult.rfcCompliance.filter(r => r.compliant).length /
                            testResult.rfcCompliance.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground text-right">
                    {(
                      (testResult.rfcCompliance.filter(r => r.compliant).length /
                        testResult.rfcCompliance.length) *
                      100
                    ).toFixed(1)}%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Tabs.Content>

        {/* Logs Tab */}
        <Tabs.Content value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Test Execution Logs</CardTitle>
              <CardDescription>Detailed execution logs with timestamps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 font-mono text-xs bg-gray-50 p-4 rounded-md max-h-[600px] overflow-y-auto">
                {testResult.logs.map((log, i) => {
                  const levelColor = {
                    debug: 'text-gray-600',
                    info: 'text-blue-600',
                    warn: 'text-yellow-600',
                    error: 'text-red-600',
                  }[log.level]

                  return (
                    <div key={i} className="flex gap-3 py-1 hover:bg-gray-100">
                      <span className="text-muted-foreground w-24 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`font-semibold w-14 flex-shrink-0 ${levelColor}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
