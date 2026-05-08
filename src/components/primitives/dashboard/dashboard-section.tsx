'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/_dashboard-standardization-plan.md
 */

import type { ReactNode } from 'react'

type DashboardSectionProps = {
  title: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardSection({
  title,
  action,
  children,
  className
}: DashboardSectionProps) {
  return (
    <section
      className={['rounded-2xl', className].filter(Boolean).join(' ')}
      style={{
        background: 'var(--wh-card-bg-soft)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
        style={{ borderColor: 'var(--wh-border)' }}
      >
        <div
          className="min-w-0 text-sm font-semibold xl:text-base"
          style={{ color: 'var(--wh-text-primary)' }}
        >
          {title}
        </div>
        {action ? (
          <div className="flex shrink-0 items-center gap-2">
            {typeof action === 'string' ? (
              <span className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                {action}
              </span>
            ) : action}
          </div>
        ) : null}
      </div>

      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

type DashboardChartPanelProps = {
  children: ReactNode
  className?: string
}

export function DashboardChartPanel({ children, className }: DashboardChartPanelProps) {
  return (
    <div
      className={['rounded-2xl p-3 xl:p-4', className].filter(Boolean).join(' ')}
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      {children}
    </div>
  )
}
