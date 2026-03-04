import { useMemo } from 'react'
import { calculatePasswordStrength } from '../../lib/validations/auth'

interface PasswordStrengthProps {
  password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = useMemo(
    () => calculatePasswordStrength(password),
    [password]
  )

  if (!password) return null

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[25, 50, 75, 100].map((threshold) => (
          <div
            key={threshold}
            className={`h-1 flex-1 rounded-full transition-all ${
              strength.score >= threshold
                ? strength.color
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            role="presentation"
          />
        ))}
      </div>
      <p
        className="text-xs text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        Password strength:{' '}
        <span
          className={`font-medium ${
            strength.label === 'weak'
              ? 'text-red-600 dark:text-red-400'
              : strength.label === 'fair'
              ? 'text-orange-600 dark:text-orange-400'
              : strength.label === 'good'
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-green-600 dark:text-green-400'
          }`}
        >
          {strength.label}
        </span>
      </p>
    </div>
  )
}
