/**
 * Error Display Component
 * Shows detailed SIP error information
 */

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { AlertTriangle, Info } from 'lucide-react'

interface ErrorDisplayProps {
  error: string
  statusCode?: number
  sipResponse?: any
}

export function ErrorDisplay({ error, statusCode, sipResponse }: ErrorDisplayProps) {
  // Parse common SIP errors
  const getErrorDetails = () => {
    if (statusCode === 400) {
      return {
        title: '400 Bad Request',
        description: 'The SIP server could not understand the request',
        suggestions: [
          'Check if the SIP message format is correct',
          'Verify Content-Length matches the message body',
          'Ensure all required headers are present',
        ]
      }
    }
    
    if (statusCode === 401 || statusCode === 407) {
      return {
        title: `${statusCode} Authentication Required`,
        description: 'The SIP server requires authentication',
        suggestions: [
          'Ensure credentials are correct',
          'Check username and password',
          'Verify SIP domain is correct',
        ]
      }
    }
    
    if (statusCode === 403) {
      return {
        title: '403 Forbidden',
        description: 'Authentication succeeded but access is denied',
        suggestions: [
          'Check if the account is active',
          'Verify permissions for this operation',
          'Contact your SIP provider',
        ]
      }
    }
    
    if (statusCode === 404) {
      return {
        title: '404 Not Found',
        description: 'The requested SIP resource was not found',
        suggestions: [
          'Verify the SIP URI is correct',
          'Check the domain name',
          'Ensure the user exists',
        ]
      }
    }
    
    if (statusCode === 408) {
      return {
        title: '408 Request Timeout',
        description: 'The server did not receive a complete request in time',
        suggestions: [
          'Check network connectivity',
          'Verify firewall settings',
          'Try again with a longer timeout',
        ]
      }
    }
    
    if (statusCode === 480) {
      return {
        title: '480 Temporarily Unavailable',
        description: 'The called party is temporarily unavailable',
        suggestions: [
          'The user may be offline',
          'Try again later',
          'Check if the device is registered',
        ]
      }
    }
    
    if (statusCode === 486) {
      return {
        title: '486 Busy Here',
        description: 'The called party is busy',
        suggestions: [
          'Try calling later',
          'The user is on another call',
        ]
      }
    }
    
    if (statusCode === 503) {
      return {
        title: '503 Service Unavailable',
        description: 'The SIP service is temporarily unavailable',
        suggestions: [
          'The server may be overloaded',
          'Try again in a few minutes',
          'Contact your SIP provider if this persists',
        ]
      }
    }
    
    return {
      title: `Error ${statusCode || 'Unknown'}`,
      description: error || 'An unknown error occurred',
      suggestions: ['Check the detailed error message below', 'Review server logs']
    }
  }

  const details = getErrorDetails()

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold">{details.title}</div>
          <div className="text-sm mt-1">{details.description}</div>
        </AlertDescription>
      </Alert>

      {details.suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {details.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {sipResponse && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">SIP Response Details</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
              {JSON.stringify(sipResponse, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
