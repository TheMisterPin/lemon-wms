import { cn } from '@/lib/utils'

type StatusVariant =
  | 'success'   // green  — complete, shipped, ok
  | 'active'    // blue   — receiving, picking, in-progress
  | 'warning'   // amber  — low-stock, normal priority
  | 'danger'    // red    — critical, high priority
  | 'neutral'   // gray   — pending, default

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: 'bg-dash-green-dim  text-dash-green-text',
  active:  'bg-dash-blue-dim   text-dash-blue-text',
  warning: 'bg-dash-amber-dim  text-dash-amber-text',
  danger:  'bg-dash-red-dim    text-dash-red-text',
  neutral: 'bg-dash-gray-dim   text-dash-gray-text',
}

interface StatusBadgeProps {
  label: string
  variant?: StatusVariant
  className?: string
}

/**
 * Pill badge for order/lot statuses, priorities, and stock levels.
 *
 * Usage:
 *   <StatusBadge label="complete"  variant="success" />
 *   <StatusBadge label="picking"   variant="active"  />
 *   <StatusBadge label="low stock" variant="warning" />
 *   <StatusBadge label="critical"  variant="danger"  />
 *   <StatusBadge label="pending"   variant="neutral" />
 */
export function StatusBadge({
  label,
  variant = 'neutral',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium',
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {label}
    </span>
  )
}
