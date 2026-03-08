/**
 * SIP Test Builder Page
 * Sprint 2: Frontend UI (v0.4.0)
 * Enhanced SIP testing with method selection, validation, and RFC compliance
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { useToast } from '../hooks/use-toast'
import { ChevronRight, ArrowLeft, PlayCircle, Sparkles } from 'lucide-react'
import { SIPTestBuilder } from '../components/sip-test-builder'
import { testsApi } from '../services/api'
import type { SIPTestParams, SIPTestConfiguration } from '../types/sip'

export function SIPTestBuilderPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [sipParams, setSipParams] = useState<SIPTestParams | null>(null)
  const [isValid, setIsValid] = useState(false)

  const handleParamsChange = (params: SIPTestParams) => {
    setSipParams(params)
    setIsValid(true)
  }

  // Run test mutation
  const runTestMutation = useMutation({
    mutationFn: (config: SIPTestConfiguration) => {
      // For now, map to existing API structure
      // TODO: Update backend API to accept SIPTestConfiguration
      return testsApi.create({
        credentialId: config.credentialId,
        testType: 'rfc-compliance', // Map to RFC compliance test
        endpoint: config.endpoint,
        duration: config.timeout,
      })
    },
    onSuccess: (response) => {
      if (response.data) {
        toast({
          title: 'Test started',
          description: 'Your enhanced SIP test is now running...',
        })
        navigate(`/test-results/${response.data.id}`)
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to start test',
        description: error.message || 'Could not start the test',
        variant: 'destructive',
      })
    },
  })

  const handleRunTest = () => {
    if (!sipParams) {
      toast({
        title: 'Invalid configuration',
        description: 'Please complete all required fields',
        variant: 'destructive',
      })
      return
    }

    // TODO: Get credential ID from user selection
    // For now, this is a placeholder
    const config: SIPTestConfiguration = {
      credentialId: 'placeholder-credential-id',
      sipParams,
      timeout: 30,
    }

    runTestMutation.mutate(config)
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Enhanced SIP Testing</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              v0.4.0
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Advanced SIP protocol testing with method selection, parameter validation, and RFC compliance
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('/test-runner')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Classic Builder
        </Button>
      </div>

      {/* Feature Highlights */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Badge variant="default">NEW</Badge>
              </div>
              <div>
                <div className="font-semibold text-sm">Method Selection</div>
                <p className="text-xs text-muted-foreground">
                  INVITE, REGISTER, OPTIONS, REFER
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Badge variant="default">NEW</Badge>
              </div>
              <div>
                <div className="font-semibold text-sm">Auth Toggle</div>
                <p className="text-xs text-muted-foreground">
                  Test authenticated/unauthenticated flows
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Badge variant="default">NEW</Badge>
              </div>
              <div>
                <div className="font-semibold text-sm">Recording (RFC 7865)</div>
                <p className="text-xs text-muted-foreground">
                  Session recording metadata
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Badge variant="default">NEW</Badge>
              </div>
              <div>
                <div className="font-semibold text-sm">REFER (RFC 3515)</div>
                <p className="text-xs text-muted-foreground">
                  Call transfer testing
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SIP Test Builder */}
      <SIPTestBuilder
        onParamsChange={handleParamsChange}
        disabled={runTestMutation.isPending}
      />

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => navigate('/test-runner')}
        >
          Cancel
        </Button>

        <Button
          onClick={handleRunTest}
          disabled={!isValid || runTestMutation.isPending}
          size="lg"
          className="gap-2"
        >
          <PlayCircle className="h-5 w-5" />
          {runTestMutation.isPending ? 'Starting Test...' : 'Run SIP Test'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* RFC Compliance Note */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="text-sm text-muted-foreground">
            <strong>RFC Compliance:</strong> This builder validates against RFC 3261 (SIP), 
            RFC 3515 (REFER), RFC 7865 (Session Recording), RFC 2617 (Digest Auth), 
            and RFC 4566 (SDP). All mandatory parameters are enforced.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
