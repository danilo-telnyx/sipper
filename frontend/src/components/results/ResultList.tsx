import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { TestResult, TestStatus } from '../../types/index'
import { formatDate, formatDuration, getStatusColor, getScoreColor } from '../../lib/utils'
import {
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import * as Select from '@radix-ui/react-select'
import * as Checkbox from '@radix-ui/react-checkbox'

interface ResultListProps {
  results: TestResult[]
  isLoading?: boolean
  onBulkExport?: (ids: string[]) => void
  onBulkDelete?: (ids: string[]) => void
}

type SortField = 'date' | 'duration' | 'score' | 'status'
type SortOrder = 'asc' | 'desc'

export function ResultList({ results, isLoading, onBulkExport, onBulkDelete }: ResultListProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all')
  const [testTypeFilter, setTestTypeFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Get unique test types for filter
  const testTypes = useMemo(() => {
    const types = new Set(results.map(r => r.testType))
    return Array.from(types)
  }, [results])

  // Filter and sort results
  const filteredAndSorted = useMemo(() => {
    let filtered = results

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.credentialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    // Test type filter
    if (testTypeFilter !== 'all') {
      filtered = filtered.filter(r => r.testType === testTypeFilter)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'date':
          comparison = new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()
          break
        case 'duration':
          comparison = a.duration - b.duration
          break
        case 'score':
          comparison = a.score - b.score
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [results, searchQuery, statusFilter, testTypeFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize)
  const paginatedResults = filteredAndSorted.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedResults.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedResults.map(r => r.id)))
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        <p className="mt-4 text-muted-foreground">Loading results...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by credential, test type, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <Select.Root value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <Select.Trigger className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Filter className="h-4 w-4" />
                <Select.Value placeholder="Status" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
                  <Select.Viewport>
                    <Select.Item value="all" className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 outline-none">
                      All Statuses
                    </Select.Item>
                    <Select.Item value="completed" className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 outline-none">
                      Completed
                    </Select.Item>
                    <Select.Item value="failed" className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 outline-none">
                      Failed
                    </Select.Item>
                    <Select.Item value="running" className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 outline-none">
                      Running
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>

            {/* Test Type Filter */}
            <Select.Root value={testTypeFilter} onValueChange={setTestTypeFilter}>
              <Select.Trigger className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Filter className="h-4 w-4" />
                <Select.Value placeholder="Test Type" />
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
                  <Select.Viewport>
                    <Select.Item value="all" className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 outline-none">
                      All Types
                    </Select.Item>
                    {testTypes.map(type => (
                      <Select.Item
                        key={type}
                        value={type}
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 outline-none"
                      >
                        {type.replace(/-/g, ' ')}
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.size} {selectedIds.size === 1 ? 'item' : 'items'} selected
              </span>
              <div className="flex gap-2">
                {onBulkExport && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBulkExport(Array.from(selectedIds))}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                )}
                {onBulkDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Delete ${selectedIds.size} test result(s)?`)) {
                        onBulkDelete(Array.from(selectedIds))
                        setSelectedIds(new Set())
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {paginatedResults.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              No test results found. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 rounded-t-lg border-b font-medium text-sm text-muted-foreground">
            <div className="col-span-1 flex items-center">
              <Checkbox.Root
                checked={selectedIds.size === paginatedResults.length}
                onCheckedChange={handleSelectAll}
                className="h-4 w-4 rounded border border-gray-300 bg-white flex items-center justify-center"
              >
                <Checkbox.Indicator>
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                </Checkbox.Indicator>
              </Checkbox.Root>
            </div>
            <div className="col-span-3">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Test
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('date')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Date
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('duration')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Duration
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </div>
            <div className="col-span-2">
              <button
                onClick={() => handleSort('score')}
                className="flex items-center gap-1 hover:text-gray-900"
              >
                Score
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Table Rows */}
          {paginatedResults.map((result) => (
            <Card
              key={result.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('[data-no-navigate]')) return
                navigate(`/test-results/${result.id}`)
              }}
            >
              <CardContent className="p-6">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1" data-no-navigate>
                    <Checkbox.Root
                      checked={selectedIds.has(result.id)}
                      onCheckedChange={() => handleToggleSelect(result.id)}
                      className="h-4 w-4 rounded border border-gray-300 bg-white flex items-center justify-center"
                    >
                      <Checkbox.Indicator>
                        <CheckCircle2 className="h-3 w-3 text-blue-600" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                  </div>

                  {/* Test Info */}
                  <div className="col-span-3 flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{result.credentialName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <span className="text-sm">{result.testType.replace(/-/g, ' ')}</span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {formatDate(result.startedAt)}
                  </div>

                  {/* Duration */}
                  <div className="col-span-2 text-sm font-medium">
                    {formatDuration(result.duration)}
                  </div>

                  {/* Score */}
                  <div className="col-span-2">
                    <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                      {result.score}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredAndSorted.length)} of{' '}
                {filteredAndSorted.length} results
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
