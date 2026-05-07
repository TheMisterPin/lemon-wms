/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/metric-card.md
 */

import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  /** Tailwind text colour class — defaults to amber accent */
  valueColor?: string
  className?: string
}

/**
 * Small stat tile used inside dashboard summary rows.
 * Uses the secondary card surface (dash-card2) so it recedes
 * slightly when placed inside a parent Card.
 */
export function MetricCard({
  label,
  value,
  sub,
  valueColor = 'text-dash-amber',
  className
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'flex min-w-[100px] flex-1 flex-col rounded-lg border border-dash-border bg-dash-card2 px-4 py-3',
        className
      )}
    >
      <span className="mb-1 text-xs text-dash-muted">{label}</span>
      <span className={cn('text-[22px] font-medium leading-none', valueColor)}>
        {value}
      </span>
      {sub && <span className="mt-1 text-[11px] text-dash-muted">{sub}</span>}
    </div>
  )
}
