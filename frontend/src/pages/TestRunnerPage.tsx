import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/auth'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { credentialsApi, testsApi } from '../services/api'
import { wsService } from '../services/websocket'
import { useToast } from '../hooks/use-toast'
import { ChevronRight, Wifi, WifiOff, History } from 'lucide-react'
import { CredentialSelector } from '../components/test-runner/CredentialSelector'
import { TestTypeSelector } from '../components/test-runner/TestTypeSelector'
import { AdvancedOptions } from '../components/test-runner/AdvancedOptions'
import { TestTemplates } from '../components/test-runner/TestTemplates'
import { ProgressStepper } from '../components/test-runner/ProgressStepper'
import { TestExecutor } from '../components/test-runner/TestExecutor'
import type { TestConfiguration, TestProgress, TestType, TestLog } from '../types/index'

const WIZARD_STEPS = [
  { id: 'credential', label: 'Credential', description: 'Select SIP credential' },
  { id: 'test-type', label: 'Test Type', description: 'Choose test scenario' },
  { id: 'options', label: 'Options', description: 'Configure settings' },
  { id: 'execute', label: 'Execute', description: 'Run the test' },
]

export function TestRunnerPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCredential, setSelectedCredential] = useState('')
  const [adHocCredentials, setAdHocCredentials] = useState<any>(null)
  const [selectedTestType, setSelectedTestType] = useState<TestType>('basic-registration')
  const [advancedOptions, setAdvancedOptions] = useState({
    endpoint: '',
    timeout: 30,
    retries: 3,
    concurrentCalls: 1,
  })

  // Test execution state
  const [isRunning, setIsRunning] = useState(false)
  const [currentTestId, setCurrentTestId] = useState<string | null>(null)
  const [progress, setProgress] = useState<TestProgress | null>(null)
  const [logs, setLogs] = useState<TestLog[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'polling'>('disconnected')

  // Fetch credentials
  const { data: credentialsData } = useQuery({
    queryKey: ['credentials'],
    queryFn: () => credentialsApi.list(),
  })

  const credentials = credentialsData?.data || []

  // Run test mutation
  const runTestMutation = useMutation({
    mutationFn: (config: TestConfiguration) => testsApi.create(config),
    onSuccess: (response) => {
      if (response.data) {
        setCurrentTestId(response.data.id)
        setIsRunning(true)
        setTestCompleted(false)
        setTestSuccess(null)
        setLogs([])
        setElapsedTime(0)
        toast({
          title: 'Test started',
          description: 'Your SIP test is now running...',
        })
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to start test',
        description: error.message || 'Could not start the test',
        variant: 'destructive',
      })
      setIsRunning(false)
    },
  })

  // WebSocket setup
  useEffect(() => {
    wsService.connect()
    
    const checkConnection = setInterval(() => {
      setConnectionStatus(wsService.getConnectionStatus())
    }, 1000)

    return () => {
      clearInterval(checkConnection)
      wsService.disconnect()
    }
  }, [])

  // Test progress subscriptions
  useEffect(() => {
    if (!currentTestId) return

    const unsubscribeProgress = wsService.subscribeToTest(currentTestId, (data) => {
      setProgress(data)
    })

    const unsubscribeLogs = wsService.onTestLog((log) => {
      if (log.timestamp) {
        setLogs((prev) => [...prev, log])
      }
    })

    const unsubscribeCompleted = wsService.onTestCompleted((data) => {
      if (data.testId === currentTestId) {
        setIsRunning(false)
        setTestCompleted(true)
        setTestSuccess(true)
        toast({
          title: 'Test completed',
          description: 'Your test has finished successfully!',
        })
      }
    })

    const unsubscribeFailed = wsService.onTestFailed((data) => {
      if (data.testId === currentTestId) {
        setIsRunning(false)
        setTestCompleted(true)
        setTestSuccess(false)
        toast({
          title: 'Test failed',
          description: data.error,
          variant: 'destructive',
        })
      }
    })

    // FALLBACK: Poll test status if WebSocket isn't working
    const pollInterval = setInterval(async () => {
      if (!isRunning) return
      
      try {
        const token = useAuthStore.getState().token
        const response = await fetch(`/api/tests/runs/${currentTestId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const testRun = await response.json()
          
          if (testRun.status === 'completed') {
            setIsRunning(false)
            setTestCompleted(true)
            setTestSuccess(true)
            clearInterval(pollInterval)
            toast({
              title: 'Test completed',
              description: 'Your test has finished successfully!',
            })
          } else if (testRun.status === 'failed') {
            setIsRunning(false)
            setTestCompleted(true)
            setTestSuccess(false)
            clearInterval(pollInterval)
            toast({
              title: 'Test failed',
              description: 'Test execution failed',
              variant: 'destructive',
            })
          }
        }
      } catch (error) {
        console.error('Error polling test status:', error)
      }
    }, 2000) // Poll every 2 seconds

    return () => {
      unsubscribeProgress()
      unsubscribeLogs()
      unsubscribeCompleted()
      unsubscribeFailed()
      clearInterval(pollInterval)
    }
  }, [currentTestId, toast, isRunning])

  // Elapsed time counter
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC to cancel test
      if (e.key === 'Escape' && isRunning) {
        handleCancelTest()
      }
      
      // Enter to confirm/next step
      if (e.key === 'Enter' && !isRunning) {
        if (currentStep < WIZARD_STEPS.length - 1 && canProceed()) {
          setCurrentStep((prev) => prev + 1)
        } else if (currentStep === WIZARD_STEPS.length - 1 && canProceed()) {
          handleRunTest()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStep, isRunning, selectedCredential])

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedCredential !== '' || adHocCredentials !== null
      case 1:
        return !!selectedTestType
      case 2:
        return true
      case 3:
        return !isRunning
      default:
        return false
    }
  }

  const handleRunTest = () => {
    if (!selectedCredential && !adHocCredentials) {
      toast({
        title: 'No credential selected',
        description: 'Please select a SIP credential or provide ad-hoc credentials',
        variant: 'destructive',
      })
      return
    }

    const config: TestConfiguration = {
      credentialId: selectedCredential || undefined,
      adHocCredentials: adHocCredentials || undefined,
      testType: selectedTestType,
      endpoint: advancedOptions.endpoint || undefined,
      duration: advancedOptions.timeout,
      callCount: advancedOptions.retries,
      concurrentCalls: advancedOptions.concurrentCalls,
    }

    runTestMutation.mutate(config)
    setCurrentStep(3) // Move to execute step
  }

  const handleCancelTest = async () => {
    if (currentTestId) {
      try {
        await testsApi.cancel(currentTestId)
        setIsRunning(false)
        toast({
          title: 'Test cancelled',
          description: 'The test has been cancelled',
        })
      } catch (error) {
        console.error('Failed to cancel test:', error)
      }
    }
  }

  const handleRetry = () => {
    setCurrentStep(0)
    setTestCompleted(false)
    setTestSuccess(null)
    setProgress(null)
    setLogs([])
    setElapsedTime(0)
  }

  const handleViewResults = () => {
    if (currentTestId) {
      navigate(`/test-results/${currentTestId}`)
    }
  }

  const handleApplyTemplate = (template: any) => {
    setSelectedTestType(template.testType)
    setAdvancedOptions(template.options)
    setCurrentStep(2)
    toast({
      title: 'Template applied',
      description: `${template.name} template has been applied`,
    })
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Runner</h1>
          <p className="text-muted-foreground">
            Configure and run SIP protocol tests
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <Badge variant={connectionStatus === 'connected' ? 'success' : connectionStatus === 'polling' ? 'warning' : 'secondary'}>
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="h-3 w-3 mr-1" />
                Connected
              </>
            ) : connectionStatus === 'polling' ? (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Polling
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </>
            )}
          </Badge>

          {/* Test History */}
          <Button
            variant="outline"
            onClick={() => navigate('/test-results')}
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {/* Progress Stepper */}
      <Card>
        <CardContent className="pt-6">
          <ProgressStepper
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            completedSteps={Array.from({ length: currentStep }, (_, i) => i)}
          />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Credential Selection */}
        {currentStep === 0 && (
          <CredentialSelector
            credentials={credentials}
            selectedId={selectedCredential}
            onSelect={(id) => {
              setSelectedCredential(id)
              setAdHocCredentials(null)
            }}
            onAdHocSubmit={(creds) => {
              setAdHocCredentials(creds)
              setSelectedCredential('')
              setCurrentStep(1) // Auto-advance to next step
            }}
            disabled={isRunning}
          />
        )}

        {/* Step 2: Test Type Selection */}
        {currentStep === 1 && (
          <TestTypeSelector
            selectedType={selectedTestType}
            onSelect={setSelectedTestType}
            disabled={isRunning}
          />
        )}

        {/* Step 3: Advanced Options & Templates */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <TestTemplates
              onApplyTemplate={handleApplyTemplate}
              disabled={isRunning}
            />
            <AdvancedOptions
              options={advancedOptions}
              onChange={setAdvancedOptions}
              disabled={isRunning}
            />
          </div>
        )}

        {/* Step 4: Test Execution */}
        {currentStep === 3 && (
          <TestExecutor
            isRunning={isRunning}
            progress={progress}
            logs={logs}
            elapsedTime={elapsedTime}
            onCancel={handleCancelTest}
            onRetry={handleRetry}
            onViewResults={handleViewResults}
            testCompleted={testCompleted}
            testSuccess={testSuccess}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0 || isRunning}
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep < 2 ? (
              <Button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                disabled={!canProceed() || isRunning}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleRunTest}
                disabled={!canProceed() || isRunning || runTestMutation.isPending}
                size="lg"
              >
                {runTestMutation.isPending ? 'Starting...' : 'Run Test'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <Card className="bg-muted/50">
        <CardContent className="py-3 px-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Keyboard shortcuts:</span>
            <div className="flex gap-4">
              <span>
                <kbd className="px-2 py-1 bg-background rounded text-xs">Enter</kbd> {currentStep < 3 ? 'Next / Run' : 'Confirm'}
              </span>
              {isRunning && (
                <span>
                  <kbd className="px-2 py-1 bg-background rounded text-xs">ESC</kbd> Cancel
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
