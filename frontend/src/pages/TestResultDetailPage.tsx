import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '../components/ui/button'
import { testsApi } from '../services/api'
import { ResultDetail } from '../components/results/ResultDetail'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { Card, CardContent } from '../components/ui/card'

export function TestResultDetailPage() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: testData, isLoading, error } = useQuery({
    queryKey: ['test', testId],
    queryFn: () => testsApi.get(testId!),
    enabled: !!testId,
  })

  const rerunMutation = useMutation({
    mutationFn: async () => {
      if (!testData?.data) return
      
      // Create a new test with the same configuration
      return testsApi.create({
        credentialId: testData.data.credentialId,
        testType: testData.data.testType,
      })
    },
    onSuccess: (data) => {
      if (data?.data) {
        toast({
          title: 'Test started',
          description: 'The test has been queued and will start shortly.',
        })
        navigate(`/test-results/${data.data.id}`)
        queryClient.invalidateQueries({ queryKey: ['test-results'] })
      }
    },
    onError: (error) => {
      console.error('Re-run failed:', error)
      toast({
        title: 'Failed to start test',
        description: 'Could not start the test. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const handleRerun = () => {
    if (confirm('Re-run this test with the same configuration?')) {
      rerunMutation.mutate()
    }
  }

  const handleShare = () => {
    // Generate a shareable link
    const shareUrl = `${window.location.origin}/test-results/${testId}/public`
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: 'Link copied',
        description: 'Shareable link copied to clipboard. Note: Public sharing requires backend implementation.',
      })
    }).catch(() => {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      })
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading test result...</p>
        </div>
      </div>
    )
  }

  if (error || !testData?.data) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/test-results')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Results
        </Button>
        <Card>
          <CardContent className="text-center py-16">
            <h3 className="text-xl font-semibold mb-2 text-red-600">
              Test Result Not Found
            </h3>
            <p className="text-muted-foreground mb-6">
              The requested test result could not be found or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/test-results')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const test = testData.data

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/test-results')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Test Result</h1>
          <p className="text-muted-foreground">
            {test.credentialName} • {test.testType.replace(/-/g, ' ')}
          </p>
        </div>
      </div>

      {/* Result Detail Component */}
      <ResultDetail
        testResult={test}
        onRerun={handleRerun}
        onShare={handleShare}
      />
    </div>
  )
}
