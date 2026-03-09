/**
 * Backend API response types (snake_case from Python/FastAPI)
 * These match what the backend actually returns.
 */

export interface BackendTestRun {
  id: string
  organization_id: string
  test_type: string
  credential_id: string | null
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at: string | null
  created_by: string | null
  test_metadata: Record<string, any>
}

export interface BackendTestResult {
  id: string
  test_run_id: string
  step_name: string
  status: string
  message: string | null
  details: Record<string, any>
  timestamp: string
}

/**
 * Transform backend test run to frontend TestResult format
 */
export function transformTestRun(backendRun: BackendTestRun): any {
  const startTime = new Date(backendRun.started_at).getTime()
  const endTime = backendRun.completed_at 
    ? new Date(backendRun.completed_at).getTime()
    : Date.now()
  const duration = Math.round((endTime - startTime) / 1000) // seconds
  
  return {
    id: backendRun.id,
    organizationId: backendRun.organization_id,
    testType: backendRun.test_type,
    credentialId: backendRun.credential_id || '',
    credentialName: backendRun.test_metadata?.credential_name || 'Ad-hoc Test',
    status: backendRun.status,
    startedAt: backendRun.started_at,
    completedAt: backendRun.completed_at,
    duration,
    success: backendRun.status === 'completed',
    score: calculateScore(backendRun),
    details: {
      summary: backendRun.test_metadata?.summary || '',
      successRate: backendRun.status === 'completed' ? 100 : 0,
      totalRequests: 1,
      successfulRequests: backendRun.status === 'completed' ? 1 : 0,
      failedRequests: backendRun.status === 'failed' ? 1 : 0,
      averageLatency: 0,
      maxLatency: 0,
      minLatency: 0,
      errors: [],
      warnings: []
    },
    rfcCompliance: [],
    timings: [],
    logs: [],
    userId: backendRun.created_by || ''
  }
}

function calculateScore(run: BackendTestRun): number {
  if (run.status === 'completed') return 100
  if (run.status === 'failed') return 0
  if (run.status === 'cancelled') return 0
  return 50 // running/pending
}
