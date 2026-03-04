import { z } from 'zod'

// Password validation schema with strength requirements
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

// Login form validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register form validation
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    organizationName: z
      .string()
      .min(2, 'Organization name must be at least 2 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Password strength calculation
export function calculatePasswordStrength(password: string): {
  score: number
  label: 'weak' | 'fair' | 'good' | 'strong'
  color: string
} {
  let score = 0
  
  if (!password) return { score: 0, label: 'weak', color: 'bg-gray-300' }
  
  // Length score
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  
  // Character variety
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/[0-9]/.test(password)) score += 15
  if (/[^a-zA-Z0-9]/.test(password)) score += 15
  
  // Bonus for high variety
  const variety = [
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length
  
  if (variety === 4) score += 10
  
  // Cap at 100
  score = Math.min(100, score)
  
  let label: 'weak' | 'fair' | 'good' | 'strong'
  let color: string
  
  if (score < 40) {
    label = 'weak'
    color = 'bg-red-500'
  } else if (score < 60) {
    label = 'fair'
    color = 'bg-orange-500'
  } else if (score < 80) {
    label = 'good'
    color = 'bg-yellow-500'
  } else {
    label = 'strong'
    color = 'bg-green-500'
  }
  
  return { score, label, color }
}
