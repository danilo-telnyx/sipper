import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TestResult, TestType, TestStatus } from '../../types/index'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Button } from '../ui/button'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ArrowUpDown,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { formatDate, getScoreColor } from '../../lib/utils'

interface RecentTestsProps {
  tests: TestResult[]
  isLoading?: boolean
  maxItems?: number
}

type SortField = 'date' | 'score' | 'status' | 'type'
type SortOrder = 'asc' | 'desc'

export function RecentTests({ tests, isLoading, maxItems = 10 }: RecentTestsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const filteredAndSortedTests = useMemo(() => {
    let filtered = tests.filter((test) => {
      const matchesSearch =
        test.credentialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.testType.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'success' && test.success) ||
        (statusFilter === 'failed' && !test.success)
      const matchesType = typeFilter === 'all' || test.testType === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
          break
        case 'score':
          comparison = a.score - b.score
          break
        case 'status':
          comparison = (a.success ? 1 : 0) - (b.success ? 1 : 0)
          break
        case 'type':
          comparison = a.testType.localeCompare(b.testType)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered.slice(0, maxItems)
  }, [tests, searchQuery, statusFilter, typeFilter, sortField, sortOrder, maxItems])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getStatusIcon = (test: TestResult) => {
    if (test.status === 'running' || test.status === 'pending') {
      return <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />
    }
    return test.success ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="h-5 w-5 bg-muted animate-pulse rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Recent Tests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Test Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="basic-registration">Basic Registration</SelectItem>
              <SelectItem value="authentication">Authentication</SelectItem>
              <SelectItem value="call-flow">Call Flow</SelectItem>
              <SelectItem value="codec-negotiation">Codec Negotiation</SelectItem>
              <SelectItem value="dtmf">DTMF</SelectItem>
              <SelectItem value="hold-resume">Hold/Resume</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="rfc-compliance">RFC Compliance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Buttons */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={sortField === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('date')}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Date
          </Button>
          <Button
            variant={sortField === 'score' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('score')}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Score
          </Button>
          <Button
            variant={sortField === 'status' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('status')}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Status
          </Button>
          <Button
            variant={sortField === 'type' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('type')}
          >
            <ArrowUpDown className="h-3 w-3 mr-1" />
            Type
          </Button>
        </div>

        {/* Tests List */}
        {filteredAndSortedTests.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {tests.length === 0 ? (
              <>
                No tests yet. Start by{' '}
                <Link to="/test-runner" className="text-primary hover:underline">
                  running a test
                </Link>
                .
              </>
            ) : (
              'No tests match your filters.'
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedTests.map((test) => (
              <Link
                key={test.id}
                to={`/test-results/${test.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(test)}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{test.credentialName}</div>
                    <div className="text-sm text-muted-foreground">
                      {test.testType.replace(/-/g, ' ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`font-semibold ${getScoreColor(test.score)}`}>
                      Score: {test.score}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(test.startedAt)}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredAndSortedTests.length < tests.length && (
          <div className="mt-4 text-center">
            <Link
              to="/test-results"
              className="text-sm text-primary hover:underline"
            >
              View all {tests.length} tests →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
