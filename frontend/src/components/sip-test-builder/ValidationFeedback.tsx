/**
 * Validation Feedback Component
 * Real-time validation feedback with RFC references
 */

import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Alert } from '../ui/alert'
import { Badge } from '../ui/badge'
import type { ValidationResult } from '../../types/sip'

interface ValidationFeedbackProps {
  validation: ValidationResult
}

export function ValidationFeedback({ validation }: ValidationFeedbackProps) {
  if (validation.errors.length === 0 && validation.warnings.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Errors */}
      {validation.errors.map((error, idx) => (
        <Alert key={`error-${idx}`} variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-2 flex-1">
            <div className="font-semibold">Validation Error: {error.field}</div>
            <div className="text-sm mt-1">{error.message}</div>
            {error.rfc && (
              <Badge variant="outline" className="mt-2 text-xs">
                {error.rfc}
              </Badge>
            )}
          </div>
        </Alert>
      ))}

      {/* Warnings */}
      {validation.warnings.map((warning, idx) => (
        <Alert key={`warning-${idx}`} className="border-yellow-500 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <div className="ml-2 flex-1">
            <div className="font-semibold text-yellow-900">Warning: {warning.field}</div>
            <div className="text-sm text-yellow-800 mt-1">{warning.message}</div>
            {warning.rfc && (
              <Badge variant="outline" className="mt-2 text-xs border-yellow-600 text-yellow-800">
                {warning.rfc}
              </Badge>
            )}
          </div>
        </Alert>
      ))}
    </div>
  )
}
