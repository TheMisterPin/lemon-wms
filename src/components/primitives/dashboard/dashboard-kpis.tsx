'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/_dashboard-standardization-plan.md
 */

import type { ReactNode } from 'react'
import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'

type DashboardKpiGridProps = {
  children: ReactNode
  className?: string
}

export function DashboardKpiGrid({ children, className }: DashboardKpiGridProps) {
  return (
    <div className={['grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export type DashboardKpiCardMetric = {
  label: string
  value: ReactNode
  tone?: 'available' | 'reserved' | 'blocked' | 'neutral'
}

type DashboardKpiCardProps = {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
  href?: string
  metrics?: DashboardKpiCardMetric[]
}

function metricColor(tone: DashboardKpiCardMetric['tone']) {
  if (tone === 'available') {
    return 'var(--wh-status-available)'
  }
  if (tone === 'reserved') {
    return 'var(--wh-status-full)'
  }
  if (tone === 'blocked') {
    return 'var(--wh-status-blocked)'
  }

  return 'var(--wh-text-secondary)'
}

export function DashboardKpiCard({
  label,
  value,
  description,
  href,
  metrics
}: DashboardKpiCardProps) {
  const content = (
    <Card
      className="h-full border transition-opacity hover:opacity-90"
      style={{
        background: 'var(--wh-card-bg-soft)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div>
          <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
            {label}
          </div>
          <div className="mt-1 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
            {value}
          </div>
          {description ? (
            <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
              {description}
            </div>
          ) : null}
        </div>

        {metrics && metrics.length > 0 ? (
          <div className="mt-auto flex justify-between gap-3 text-xs">
            {metrics.map((metric) => (
              <span key={metric.label} style={{ color: metricColor(metric.tone) }}>
                {metric.value} {metric.label}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    )
  }

  return content
}

type DashboardItemTotalsCardProps = {
  totalOnHand: number
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
}

export function DashboardItemTotalsCard({
  totalOnHand,
  totalAvailable,
  totalReserved,
  totalBlocked
}: DashboardItemTotalsCardProps) {
  return (
    <DashboardKpiCard
      label="Item totals"
      value={totalOnHand.toLocaleString()}
      description="On hand units"
      metrics={[
        { label: 'avail', value: totalAvailable.toLocaleString(), tone: 'available' },
        { label: 'res', value: totalReserved.toLocaleString(), tone: 'reserved' },
        { label: 'blk', value: totalBlocked.toLocaleString(), tone: 'blocked' }
      ]}
    />
  )
}
