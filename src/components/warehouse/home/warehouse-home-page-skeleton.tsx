'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function WarehouseHomePageSkeleton() {
  return (
    <main
      className="min-h-full p-4 pb-20 xl:p-6 xl:pb-20"
      style={{ background: 'var(--wh-page-bg)' }}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" style={{ background: 'var(--wh-card-bg-soft)' }} />
            <Skeleton className="h-8 w-48 rounded-md" style={{ background: 'var(--wh-card-bg-soft)' }} />
            <Skeleton className="h-4 w-36 rounded-md" style={{ background: 'var(--wh-card-bg-soft)' }} />
            <Skeleton className="h-4 w-28 rounded-md" style={{ background: 'var(--wh-card-bg-soft)' }} />
          </div>
          <Skeleton className="h-10 w-52 rounded-xl" style={{ background: 'var(--wh-card-bg-soft)' }} />
        </div>

        <div
          className="rounded-2xl border p-5"
          style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg-soft)' }}
        >
          <Skeleton className="h-4 w-24 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
          <Skeleton className="mt-4 h-7 w-40 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
          <Skeleton className="mt-3 h-4 w-full max-w-md rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
          <Skeleton className="mt-4 h-2 w-full rounded-full" style={{ background: 'var(--wh-card-bg)' }} />
        </div>

        <div
          className="rounded-2xl border p-5"
          style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg-soft)' }}
        >
          <Skeleton className="h-4 w-16 rounded-md" style={{ background: 'var(--wh-card-bg)' }} />
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-36 w-full rounded-2xl" style={{ background: 'var(--wh-card-bg)' }} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
