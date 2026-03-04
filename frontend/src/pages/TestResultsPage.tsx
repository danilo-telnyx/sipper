import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { testsApi } from '../services/api'
import { ResultList } from '../components/results/ResultList'
import { PlayCircle, FileText } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

export function TestResultsPage() {
  const { toast } = useToast()

  const { data: resultsData, isLoading, refetch } = useQuery({
    queryKey: ['test-results'],
    queryFn: () => testsApi.list({ pageSize: 100 }),
  })

  const tests = resultsData?.data || []

  const handleBulkExport = async (ids: string[]) => {
    try {
      const blob = await testsApi.export({
        testIds: ids,
        format: 'json',
        includeDetails: true,
      })

      const filename = `test-results-bulk-${Date.now()}.json`
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Export successful',
        description: `${ids.length} test result(s) exported successfully`,
      })
    } catch (error) {
      console.error('Bulk export failed:', error)
      toast({
        title: 'Export failed',
        description: 'Failed to export test results. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      // In production, implement bulk delete API endpoint
      // For now, we'll show a toast
      toast({
        title: 'Delete not implemented',
        description: 'Bulk delete functionality will be implemented in the backend.',
      })
      
      // After implementing API:
      // await Promise.all(ids.map(id => testsApi.delete(id)))
      // refetch()
      // toast({ title: 'Success', description: `${ids.length} test(s) deleted` })
    } catch (error) {
      console.error('Bulk delete failed:', error)
      toast({
        title: 'Delete failed',
        description: 'Failed to delete test results. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Test Results
          </h1>
          <p className="text-muted-foreground mt-1">
            View, analyze, and export your SIP test results
          </p>
        </div>
        <Link to="/test-runner">
          <Button>
            <PlayCircle className="h-4 w-4 mr-2" />
            Run New Test
          </Button>
        </Link>
      </div>

      {/* Results List or Empty State */}
      {!isLoading && tests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No test results yet</h3>
            <p className="text-muted-foreground mb-6">
              Run your first SIP test to see results here
            </p>
            <Link to="/test-runner">
              <Button>
                <PlayCircle className="h-4 w-4 mr-2" />
                Run Your First Test
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ResultList
          results={tests}
          isLoading={isLoading}
          onBulkExport={handleBulkExport}
          onBulkDelete={handleBulkDelete}
        />
      )}
    </div>
  )
}
