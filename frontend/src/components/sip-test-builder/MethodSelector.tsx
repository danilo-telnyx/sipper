/**
 * Method Selector Component
 * Dropdown with icons for SIP method selection
 */

import { Phone, UserPlus, Info, ArrowRightLeft, PhoneOff, XCircle, Check } from 'lucide-react'
import { Badge } from '../ui/badge'
import type { SIPMethod, MethodMetadata } from '../../types/sip'

const METHOD_OPTIONS: MethodMetadata[] = [
  {
    value: 'INVITE',
    label: 'INVITE',
    description: 'Initiate a SIP session (call setup). Tests INVITE → 200 OK → ACK flow.',
    icon: 'Phone',
    complexity: 'intermediate',
    rfcs: ['RFC 3261'],
    requiresAuth: false,
    supportsRecording: true,
  },
  {
    value: 'REGISTER',
    label: 'REGISTER',
    description: 'Register a SIP endpoint. Tests registration and authentication flow.',
    icon: 'UserPlus',
    complexity: 'basic',
    rfcs: ['RFC 3261'],
    requiresAuth: false,
    supportsRecording: false,
  },
  {
    value: 'OPTIONS',
    label: 'OPTIONS',
    description: 'Query server capabilities. Tests basic connectivity without authentication.',
    icon: 'Info',
    complexity: 'basic',
    rfcs: ['RFC 3261'],
    requiresAuth: false,
    supportsRecording: false,
  },
  {
    value: 'REFER',
    label: 'REFER',
    description: 'Transfer a call (blind or attended). Tests call transfer mechanisms.',
    icon: 'ArrowRightLeft',
    complexity: 'advanced',
    rfcs: ['RFC 3515', 'RFC 3891'],
    requiresAuth: true,
    supportsRecording: false,
  },
]

const ICON_MAP: Record<string, React.ElementType> = {
  Phone,
  UserPlus,
  Info,
  ArrowRightLeft,
  PhoneOff,
  XCircle,
  Check,
}

interface MethodSelectorProps {
  selectedMethod: SIPMethod
  onSelect: (method: SIPMethod) => void
  disabled?: boolean
}

export function MethodSelector({
  selectedMethod,
  onSelect,
  disabled = false,
}: MethodSelectorProps) {
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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {METHOD_OPTIONS.map((option) => {
        const Icon = ICON_MAP[option.icon] || Phone
        const isSelected = selectedMethod === option.value

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
                <div className="font-semibold text-sm mb-1">{option.label}</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant={getComplexityColor(option.complexity)} className="text-xs">
                    {option.complexity}
                  </Badge>
                  {option.requiresAuth && (
                    <Badge variant="outline" className="text-xs">
                      Auth
                    </Badge>
                  )}
                  {option.supportsRecording && (
                    <Badge variant="outline" className="text-xs">
                      REC
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {option.description}
                </p>
                <div className="text-xs text-muted-foreground">
                  {option.rfcs.join(', ')}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
