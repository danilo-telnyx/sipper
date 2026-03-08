/**
 * Flow Visualization Demo Page
 * Sprint 4: Flow Visualization (v0.6.0)
 * Demonstrates the SIP flow diagram component
 */

import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { SIPFlowDiagram } from '../components/flow-visualization'
import type { SIPFlowData } from '../components/flow-visualization'
import { Play, RotateCcw } from 'lucide-react'

// Mock SIP flow data
const mockFlowData: SIPFlowData = {
  testId: 'demo-test-001',
  startTime: Date.now() - 10000,
  endTime: Date.now(),
  clientLabel: 'SIP Client (192.168.1.100:5060)',
  serverLabel: 'SIP Server (sip.example.com:5060)',
  messages: [
    {
      id: 'msg-1',
      timestamp: Date.now() - 9000,
      method: 'INVITE',
      direction: 'client-to-server',
      headers: {
        'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK74bf9',
        'From': 'Alice <sip:alice@example.com>;tag=9fxced76sl',
        'To': 'Bob <sip:bob@example.com>',
        'Call-ID': '3848276298220188511@example.com',
        'CSeq': '1 INVITE',
        'Contact': '<sip:alice@192.168.1.100>',
        'Max-Forwards': '70',
        'Content-Type': 'application/sdp',
      },
      body: `v=0
o=alice 2890844526 2890844526 IN IP4 192.168.1.100
s=Session
c=IN IP4 192.168.1.100
t=0 0
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000`,
    },
    {
      id: 'msg-2',
      timestamp: Date.now() - 8500,
      statusCode: 100,
      statusText: 'Trying',
      direction: 'server-to-client',
      headers: {
        'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK74bf9',
        'From': 'Alice <sip:alice@example.com>;tag=9fxced76sl',
        'To': 'Bob <sip:bob@example.com>',
        'Call-ID': '3848276298220188511@example.com',
        'CSeq': '1 INVITE',
      },
    },
    {
      id: 'msg-3',
      timestamp: Date.now() - 7500,
      statusCode: 180,
      statusText: 'Ringing',
      direction: 'server-to-client',
      headers: {
        'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK74bf9',
        'From': 'Alice <sip:alice@example.com>;tag=9fxced76sl',
        'To': 'Bob <sip:bob@example.com>;tag=314159',
        'Call-ID': '3848276298220188511@example.com',
        'CSeq': '1 INVITE',
        'Contact': '<sip:bob@sip.example.com>',
      },
    },
    {
      id: 'msg-4',
      timestamp: Date.now() - 5000,
      statusCode: 200,
      statusText: 'OK',
      direction: 'server-to-client',
      headers: {
        'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK74bf9',
        'From': 'Alice <sip:alice@example.com>;tag=9fxced76sl',
        'To': 'Bob <sip:bob@example.com>;tag=314159',
        'Call-ID': '3848276298220188511@example.com',
        'CSeq': '1 INVITE',
        'Contact': '<sip:bob@sip.example.com>',
        'Content-Type': 'application/sdp',
      },
      body: `v=0
o=bob 2890844527 2890844527 IN IP4 sip.example.com
s=Session
c=IN IP4 sip.example.com
t=0 0
m=audio 49172 RTP/AVP 0
a=rtpmap:0 PCMU/8000`,
    },
    {
      id: 'msg-5',
      timestamp: Date.now() - 4500,
      method: 'ACK',
      direction: 'client-to-server',
      headers: {
        'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK74bf0',
        'From': 'Alice <sip:alice@example.com>;tag=9fxced76sl',
        'To': 'Bob <sip:bob@example.com>;tag=314159',
        'Call-ID': '3848276298220188511@example.com',
        'CSeq': '1 ACK',
        'Max-Forwards': '70',
      },
    },
    {
      id: 'msg-6',
      timestamp: Date.now() - 1000,
      method: 'BYE',
      direction: 'client-to-server',
      headers: {
        'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK74bf1',
        'From': 'Alice <sip:alice@example.com>;tag=9fxced76sl',
        'To': 'Bob <sip:bob@example.com>;tag=314159',
        'Call-ID': '3848276298220188511@example.com',
        'CSeq': '2 BYE',
        'Max-Forwards': '70',
      },
    },
    {
      id: 'msg-7',
      timestamp: Date.now() - 500,
      statusCode: 200,
      statusText: 'OK',
      direction: 'server-to-client',
      headers: {
        'Via': 'SIP/2.0/UDP 192.168.1.100:5060;branch=z9hG4bK74bf1',
        'From': 'Alice <sip:alice@example.com>;tag=9fxced76sl',
        'To': 'Bob <sip:bob@example.com>;tag=314159',
        'Call-ID': '3848276298220188511@example.com',
        'CSeq': '2 BYE',
      },
    },
  ],
}

export function FlowVisualizationDemoPage() {
  const [flowData, setFlowData] = useState<SIPFlowData>(mockFlowData)
  const [isRealTime, setIsRealTime] = useState(false)

  const handleReset = () => {
    setFlowData({
      ...mockFlowData,
      startTime: Date.now() - 10000,
      endTime: Date.now(),
      messages: mockFlowData.messages.map((msg, idx) => ({
        ...msg,
        timestamp: Date.now() - (9000 - idx * 1000),
      })),
    })
  }

  const handleSimulateRealTime = () => {
    setIsRealTime(true)
    setFlowData({
      ...mockFlowData,
      startTime: Date.now(),
      endTime: undefined,
      messages: [],
    })

    // Simulate messages arriving over time
    mockFlowData.messages.forEach((msg, idx) => {
      setTimeout(() => {
        setFlowData((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              ...msg,
              timestamp: Date.now(),
            },
          ],
        }))

        if (idx === mockFlowData.messages.length - 1) {
          setFlowData((prev) => ({
            ...prev,
            endTime: Date.now(),
          }))
          setIsRealTime(false)
        }
      }, idx * 1500)
    })
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Flow Visualization Demo</h1>
            <Badge variant="outline" className="text-xs">
              Sprint 4 - v0.6.0
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Interactive SIP message sequence diagram with color-coded responses
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSimulateRealTime}
            disabled={isRealTime}
          >
            <Play className="h-4 w-4 mr-2" />
            Simulate Real-Time
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isRealTime}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>Comprehensive flow visualization capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div>
              ✅ <strong>Color-coded responses</strong>
              <p className="text-xs text-muted-foreground ml-5">1xx, 2xx, 3xx, 4xx, 5xx</p>
            </div>
            <div>
              ✅ <strong>Expandable messages</strong>
              <p className="text-xs text-muted-foreground ml-5">View headers and body</p>
            </div>
            <div>
              ✅ <strong>Zoom controls</strong>
              <p className="text-xs text-muted-foreground ml-5">50% to 200%</p>
            </div>
            <div>
              ✅ <strong>Fullscreen mode</strong>
              <p className="text-xs text-muted-foreground ml-5">Maximize for details</p>
            </div>
            <div>
              ✅ <strong>JSON export</strong>
              <p className="text-xs text-muted-foreground ml-5">PNG/SVG coming soon</p>
            </div>
            <div>
              ✅ <strong>Real-time updates</strong>
              <p className="text-xs text-muted-foreground ml-5">Auto-scroll on new messages</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flow Diagram */}
      <SIPFlowDiagram
        data={flowData}
        realTime={isRealTime}
      />

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Response Class Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-primary"></div>
              <span>Request</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-blue-500"></div>
              <span>1xx Informational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-green-500"></div>
              <span>2xx Success</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-yellow-500"></div>
              <span>3xx Redirection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-orange-500"></div>
              <span>4xx Client Error</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-red-500"></div>
              <span>5xx Server Error</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
