import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { cn } from '../../lib/utils'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  valueClassName?: string
  isLoading?: boolean
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  valueClassName,
  isLoading,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          {Icon && <div className="h-4 w-4 bg-muted animate-pulse rounded" />}
        </CardHeader>
        <CardContent>
          <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
          <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = () => {
    if (!trend) return null
    if (Math.abs(trend.value) < 0.01) return <Minus className="h-3 w-3" />
    return trend.isPositive ? (
      <ArrowUp className="h-3 w-3" />
    ) : (
      <ArrowDown className="h-3 w-3" />
    )
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (Math.abs(trend.value) < 0.01) return 'text-muted-foreground'
    return trend.isPositive ? 'text-green-600' : 'text-red-600'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', valueClassName)}>{value}</div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs mt-1', getTrendColor())}>
            {getTrendIcon()}
            <span className="font-medium">
              {Math.abs(trend.value).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">{trend.label}</span>
          </div>
        )}
        {subtitle && !trend && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-4 w-4 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  )
}
