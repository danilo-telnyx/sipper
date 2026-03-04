import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Loader2, Zap, CheckCircle2, XCircle } from 'lucide-react'
import { useToast } from '../../hooks/use-toast'
import type { SipCredential } from '../../types/index'

interface TestConnectionButtonProps {
  credential: SipCredential
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  showLatency?: boolean
}

interface TestResult {
  success: boolean
  latency: number
  message: string
  statusCode?: number
}

// Mock test function - replace with actual API call
const testConnection = async (credentialId: string): Promise<TestResult> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))
  
  // Simulate test result
  const success = Math.random() > 0.3
  const latency = Math.floor(50 + Math.random() * 200)
  
  if (success) {
    return {
      success: true,
      latency,
      message: 'Connection successful',
      statusCode: 200,
    }
  } else {
    throw new Error('Connection failed: Timeout or authentication error')
  }
}

export function TestConnectionButton({
  credential,
  variant = 'outline',
  size = 'sm',
  showLatency = true,
}: TestConnectionButtonProps) {
  const [lastResult, setLastResult] = useState<TestResult | null>(null)
  const { toast } = useToast()

  const testMutation = useMutation({
    mutationFn: () => testConnection(credential.id),
    onSuccess: (result) => {
      setLastResult(result)
      toast({
        title: 'Connection Test Successful',
        description: `Latency: ${result.latency}ms`,
      })
    },
    onError: (error: Error) => {
      setLastResult({
        success: false,
        latency: 0,
        message: error.message,
      })
      toast({
        title: 'Connection Test Failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={() => testMutation.mutate()}
        disabled={testMutation.isPending}
      >
        {testMutation.isPending ? (
          <>
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <Zap className="h-3 w-3 mr-1" />
            Test
          </>
        )}
      </Button>

      {showLatency && lastResult && (
        <Badge 
          variant={lastResult.success ? 'default' : 'destructive'} 
          className={`gap-1 ${lastResult.success ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
        >
          {lastResult.success ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          {lastResult.success ? `${lastResult.latency}ms` : 'Failed'}
        </Badge>
      )}
    </div>
  )
}
