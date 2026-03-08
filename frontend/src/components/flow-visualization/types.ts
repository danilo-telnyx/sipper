/**
 * Flow Visualization Types
 * Sprint 4: Flow Visualization (v0.6.0)
 */

export type SIPMessageDirection = 'client-to-server' | 'server-to-client'

export type SIPResponseClass = '1xx' | '2xx' | '3xx' | '4xx' | '5xx' | 'request'

export interface SIPFlowMessage {
  id: string
  timestamp: number
  method?: string // For requests (INVITE, REGISTER, etc.)
  statusCode?: number // For responses (200, 401, etc.)
  statusText?: string // For responses (OK, Unauthorized, etc.)
  direction: SIPMessageDirection
  headers: Record<string, string>
  body?: string
  raw?: string
}

export interface SIPFlowData {
  testId: string
  startTime: number
  endTime?: number
  messages: SIPFlowMessage[]
  clientLabel: string
  serverLabel: string
}

export interface FlowVisualizationProps {
  data: SIPFlowData
  onExport?: (format: 'png' | 'svg') => void
  realTime?: boolean
}
