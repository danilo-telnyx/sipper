import { 
  Phone, 
  Shield, 
  MessageSquare, 
  Music, 
  Hash, 
  Pause, 
  ArrowRightLeft, 
  Users, 
  CheckCircle2 
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TestType } from '@/types'

interface TestTypeOption {
  value: TestType
  label: string
  description: string
  icon: React.ElementType
  duration: string
  complexity: 'basic' | 'intermediate' | 'advanced'
}

const TEST_TYPE_OPTIONS: TestTypeOption[] = [
  {
    value: 'basic-registration',
    label: 'Basic Registration',
    description: 'Test SIP REGISTER and authentication. Verifies basic connectivity and credential validity.',
    icon: Phone,
    duration: '~30s',
    complexity: 'basic',
  },
  {
    value: 'authentication',
    label: 'Authentication Flow',
    description: 'Test digest authentication flow with challenge-response. Validates security implementation.',
    icon: Shield,
    duration: '~45s',
    complexity: 'basic',
  },
  {
    value: 'call-flow',
    label: 'Call Flow (INVITE/ACK/BYE)',
    description: 'Complete call flow test including INVITE, ACK, and BYE messages. Tests basic call setup.',
    icon: MessageSquare,
    duration: '~2min',
    complexity: 'intermediate',
  },
  {
    value: 'codec-negotiation',
    label: 'Codec Negotiation',
    description: 'Test SDP codec negotiation capabilities. Verifies media handling and codec compatibility.',
    icon: Music,
    duration: '~1min',
    complexity: 'intermediate',
  },
  {
    value: 'dtmf',
    label: 'DTMF Tones',
    description: 'Test DTMF tone sending via SIP INFO or RFC 2833. Validates interactive features.',
    icon: Hash,
    duration: '~1min',
    complexity: 'intermediate',
  },
  {
    value: 'hold-resume',
    label: 'Hold/Resume',
    description: 'Test call hold and resume using re-INVITE. Validates media manipulation capabilities.',
    icon: Pause,
    duration: '~2min',
    complexity: 'intermediate',
  },
  {
    value: 'transfer',
    label: 'Call Transfer',
    description: 'Test blind and attended transfer mechanisms. Validates advanced call control.',
    icon: ArrowRightLeft,
    duration: '~3min',
    complexity: 'advanced',
  },
  {
    value: 'conference',
    label: 'Conference',
    description: 'Test multi-party conferencing capabilities. Validates complex call scenarios.',
    icon: Users,
    duration: '~4min',
    complexity: 'advanced',
  },
  {
    value: 'rfc-compliance',
    label: 'RFC Compliance',
    description: 'Comprehensive RFC compliance check covering multiple specifications. Full protocol validation.',
    icon: CheckCircle2,
    duration: '~10min',
    complexity: 'advanced',
  },
]

interface TestTypeSelectorProps {
  selectedType: TestType
  onSelect: (type: TestType) => void
  disabled?: boolean
}

export function TestTypeSelector({
  selectedType,
  onSelect,
  disabled = false,
}: TestTypeSelectorProps) {
  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic':
        return 'success'
      case 'intermediate':
        return 'warning'
      case 'advanced':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Choose Test Type</CardTitle>
        <CardDescription>
          Select the type of SIP test to run
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TEST_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = selectedType === option.value

            return (
              <div
                key={option.value}
                onClick={() => !disabled && onSelect(option.value)}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all
                  ${isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary'
                    : 'hover:border-primary/50 hover:bg-accent'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    p-2 rounded-md
                    ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">{option.label}</div>
                    <div className="flex gap-2 mb-2">
                      <Badge variant={getComplexityColor(option.complexity)} className="text-xs">
                        {option.complexity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {option.duration}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
