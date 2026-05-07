'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-overview-primitives.md
 */

import type { MouseEventHandler, ReactNode } from 'react'

export const warehouseOverviewToneStyles = {
  success: { icon: 'var(--wh-status-available, #22c55e)' },
  warning: { icon: 'var(--wh-status-full, #eab308)' },
  danger: { icon: 'var(--wh-status-blocked, #ef4444)' },
  neutral: { icon: 'var(--wh-text-secondary, #cbd5e1)' }
} as const

export type WarehouseOverviewTone = keyof typeof warehouseOverviewToneStyles

export const warehouseOverviewRechartsTooltipProps = {
  contentStyle: {
    background: 'var(--wh-card-bg, #111827)',
    border: '1px solid var(--wh-border, rgba(148,163,184,0.16))',
    borderRadius: 8,
    color: 'var(--wh-text-primary, #f8fafc)',
    fontSize: 12
  },
  labelStyle: { color: 'var(--wh-text-secondary, #cbd5e1)' },
  itemStyle: { color: 'var(--wh-text-primary, #f8fafc)' }
} as const

type WarehouseOverviewButtonProps = {
  children: ReactNode
  variant?: 'default' | 'secondary' | 'ghost'
  size?: 'default' | 'sm'
  className?: string
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export function WarehouseOverviewButton({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  onClick
}: WarehouseOverviewButtonProps) {
  const sizing = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'

  const style =
    variant === 'secondary'
      ? {
        background: 'var(--wh-card-bg)',
        border: '1px solid var(--wh-border)',
        color: 'var(--wh-text-primary)'
      }
      : variant === 'ghost'
        ? {
          background: 'transparent',
          border: '1px solid var(--wh-border)',
          color: 'var(--wh-text-secondary)'
        }
        : {
          background: 'var(--wh-text-primary)',
          border: '1px solid var(--wh-text-primary)',
          color: 'var(--wh-page-bg)'
        }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl font-medium transition hover:opacity-90 ${sizing} ${className}`}
      style={style}
    >
      {children}
    </button>
  )
}

type WarehouseOverviewShellSectionProps = {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function WarehouseOverviewShellSection({
  title,
  action,
  children,
  className = ''
}: WarehouseOverviewShellSectionProps) {
  return (
    <section
      className={`rounded-2xl border ${className}`}
      style={{
        background: 'var(--wh-card-bg-soft, #171c24)',
        borderColor: 'var(--wh-border, rgba(148,163,184,0.16))'
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
        style={{ borderColor: 'var(--wh-border, rgba(148,163,184,0.16))' }}
      >
        <div
          className="min-w-0 text-sm font-semibold xl:text-base"
          style={{ color: 'var(--wh-text-primary, #f8fafc)' }}
        >
          {title}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

export function WarehouseOverviewChartPanel({ children }: { children: ReactNode }) {
  return <div>{children}</div>
}

type WarehouseOverviewStatusPillProps = {
  children: ReactNode
  tone?: WarehouseOverviewTone
}

export function WarehouseOverviewStatusPill({
  children,
  tone = 'neutral'
}: WarehouseOverviewStatusPillProps) {
  const color = warehouseOverviewToneStyles[tone].icon

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{
        background: 'var(--wh-card-bg, #111827)',
        borderColor: 'var(--wh-border, rgba(148,163,184,0.16))',
        color
      }}
    >
      {children}
    </span>
  )
}
