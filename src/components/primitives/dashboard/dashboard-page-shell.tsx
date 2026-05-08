'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/_dashboard-standardization-plan.md
 */

import type { ReactNode } from 'react'

import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type DashboardPageShellProps = {
  title?: ReactNode
  subtitle?: ReactNode
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  children?: ReactNode
  className?: string
}

export function DashboardPageShell({
  title,
  subtitle,
  isLoading = false,
  error,
  onRetry,
  children,
  className
}: DashboardPageShellProps) {
  if (error) {
    return (
      <main className="min-h-screen p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-8 text-center"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--wh-text-muted)' }}>
            {error}
          </p>
          {onRetry ? (
            <Button type="button" variant="outline" className="mt-6" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      </main>
    )
  }

  return (
    <main
      className={['mx-auto min-h-screen max-w-7xl p-4 text-wh-text-primary xl:p-6', className]
        .filter(Boolean)
        .join(' ')}
      style={{ background: 'var(--wh-page-bg)' }}
    >
      {title || subtitle || isLoading ? (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 xl:mb-10">
          <div>
            {title ? <h1 className="text-3xl font-bold">{title}</h1> : null}
            {subtitle ? (
              <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                {subtitle}
              </p>
            ) : null}
          </div>
          {isLoading ? (
            <Loader2 className="size-5 shrink-0 animate-spin" style={{ color: 'var(--wh-text-muted)' }} />
          ) : null}
        </div>
      ) : null}
      {children}
    </main>
  )
}
