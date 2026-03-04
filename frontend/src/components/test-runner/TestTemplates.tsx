import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Bookmark, ChevronDown, ChevronUp } from 'lucide-react'
import type { TestType } from '../../types/index'

interface TestTemplate {
  id: string
  name: string
  description: string
  testType: TestType
  options: {
    timeout?: number
    retries?: number
    concurrentCalls?: number
  }
}

const TEMPLATES: TestTemplate[] = [
  {
    id: 'quick-check',
    name: 'Quick Check',
    description: 'Fast basic registration test with default settings',
    testType: 'basic-registration',
    options: {
      timeout: 15,
      retries: 1,
      concurrentCalls: 1,
    },
  },
  {
    id: 'full-validation',
    name: 'Full Validation',
    description: 'Comprehensive call flow test with retries',
    testType: 'call-flow',
    options: {
      timeout: 60,
      retries: 3,
      concurrentCalls: 1,
    },
  },
  {
    id: 'load-test',
    name: 'Load Test',
    description: 'Multiple concurrent calls to test capacity',
    testType: 'call-flow',
    options: {
      timeout: 120,
      retries: 2,
      concurrentCalls: 5,
    },
  },
  {
    id: 'compliance-check',
    name: 'RFC Compliance',
    description: 'Full RFC compliance validation suite',
    testType: 'rfc-compliance',
    options: {
      timeout: 300,
      retries: 1,
      concurrentCalls: 1,
    },
  },
]

interface TestTemplatesProps {
  onApplyTemplate: (template: TestTemplate) => void
  disabled?: boolean
}

export function TestTemplates({ onApplyTemplate, disabled = false }: TestTemplatesProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Test Templates
            </CardTitle>
            <CardDescription>
              Quick presets for common test scenarios
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="p-3 border rounded-lg hover:border-primary/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {template.testType}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onApplyTemplate(template)}
                    disabled={disabled}
                    className="ml-auto"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
