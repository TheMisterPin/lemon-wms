'use client'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading placeholder aligned with {@link WarehouseHomePageView} (header, KPI strip, orders shell).
 */
export function WarehouseHomePageSkeleton() {
  return (
    <main
      className="min-h-full p-3 pb-20 md:h-full md:overflow-hidden md:p-4 xl:p-5"
      style={{ background: 'var(--wh-page-bg)' }}
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col gap-3 md:gap-4">
        <div className="flex shrink-0 items-center gap-3">
          <Skeleton className="size-11 shrink-0 rounded-xl" style={{ background: 'var(--wh-card-bg-soft)' }} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-24 rounded-md" style={{ background: 'var(--wh-card-bg-soft)' }} />
            <Skeleton className="h-8 w-[min(100%,12rem)] rounded-md" style={{ background: 'var(--wh-card-bg-soft)' }} />
          </div>
        </div>

        <section className="grid shrink-0 gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.58fr)]">
          <div className="rounded-xl border px-4 py-4" style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg-soft)' }}>
            <Skeleton className="h-3 w-28 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <Skeleton className="h-10 w-14 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
              <div className="flex flex-wrap justify-end gap-4">
                <Skeleton className="h-12 w-14 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
                <Skeleton className="h-12 w-14 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
                <Skeleton className="h-12 w-14 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
              </div>
            </div>
          </div>
          <div className="rounded-xl border px-4 py-3" style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg-soft)' }}>
            <Skeleton className="h-3 w-40 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
            <Skeleton className="mt-3 h-6 w-full max-w-xs rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
            <Skeleton className="mt-2 h-4 w-[75%] max-w-sm rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
            <Skeleton className="mt-4 h-9 w-40 rounded-xl" style={{ background: 'var(--wh-card-bg)' }} />
          </div>
        </section>

        <section
          className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border"
          style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg-soft)' }}
        >
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
            style={{ borderColor: 'var(--wh-border)' }}
          >
            <Skeleton className="h-5 w-28 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-4 w-16 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
              <Skeleton className="h-8 w-9 rounded-xl" style={{ background: 'var(--wh-card-bg)' }} />
              <Skeleton className="h-8 w-20 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
            </div>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-4 xl:p-5">
            <div className="mb-3 flex flex-wrap gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" style={{ background: 'var(--wh-card-bg)' }} />
              <Skeleton className="h-9 w-[7.5rem] rounded-xl" style={{ background: 'var(--wh-card-bg)' }} />
              <Skeleton className="h-9 w-28 rounded-xl" style={{ background: 'var(--wh-card-bg)' }} />
            </div>
            <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="min-h-[12rem] w-full rounded-xl" style={{ background: 'var(--wh-card-bg)' }} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
