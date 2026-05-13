'use client'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Mirrors {@link OrderTypeOverview} layout: shell header, KPI cards, donut + bar row, orders + activities.
 */
export function OrderTypeOverviewSkeleton() {
  return (
    <main
      className="mx-auto min-h-screen max-w-7xl p-4 text-wh-text-primary xl:p-6"
      style={{ background: 'var(--wh-page-bg)' }}
    >
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 xl:mb-10">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-9 w-52 max-w-full rounded-md bg-wh-card-bg-soft" />
          <Skeleton className="h-4 w-full max-w-xl rounded-md bg-wh-card-bg-soft" />
          <Skeleton className="h-4 w-full max-w-md rounded-md bg-wh-card-bg-soft" />
        </div>
      </div>

      <div className="space-y-8 xl:space-y-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border p-5"
              style={{
                background: 'var(--wh-card-bg-soft)',
                borderColor: 'var(--wh-border)'
              }}
            >
              <Skeleton className="h-3 w-28 rounded-md bg-wh-card-bg" />
              <Skeleton className="mt-3 h-10 w-24 rounded-md bg-wh-card-bg" />
              <Skeleton className="mt-3 h-3 w-full max-w-[220px] rounded-md bg-wh-card-bg" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          <section
            className="overflow-hidden rounded-2xl border"
            style={{
              background: 'var(--wh-card-bg-soft)',
              borderColor: 'var(--wh-border)'
            }}
          >
            <div
              className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
              style={{ borderColor: 'var(--wh-border)' }}
            >
              <Skeleton className="h-4 w-36 rounded-md bg-wh-card-bg" />
              <Skeleton className="h-3 w-16 rounded-md bg-wh-card-bg" />
            </div>
            <div className="flex justify-center p-6 xl:p-8">
              <Skeleton className="size-[200px] shrink-0 rounded-full bg-wh-card-bg xl:size-[220px]" />
            </div>
          </section>

          <section
            className="overflow-hidden rounded-2xl border"
            style={{
              background: 'var(--wh-card-bg-soft)',
              borderColor: 'var(--wh-border)'
            }}
          >
            <div
              className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
              style={{ borderColor: 'var(--wh-border)' }}
            >
              <Skeleton className="h-4 w-48 rounded-md bg-wh-card-bg" />
              <Skeleton className="h-3 w-28 rounded-md bg-wh-card-bg" />
            </div>
            <div className="p-4 xl:p-5">
              <Skeleton className="h-[260px] w-full rounded-xl bg-wh-card-bg" />
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          {[0, 1].map((column) => (
            <section
              key={column}
              className="overflow-hidden rounded-2xl border"
              style={{
                background: 'var(--wh-card-bg-soft)',
                borderColor: 'var(--wh-border)'
              }}
            >
              <div
                className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
                style={{ borderColor: 'var(--wh-border)' }}
              >
                <Skeleton className="h-4 w-32 rounded-md bg-wh-card-bg" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-14 rounded-md bg-wh-card-bg" />
                  <Skeleton className="h-8 w-16 rounded-md bg-wh-card-bg" />
                </div>
              </div>
              <div className="space-y-3 p-4 xl:p-5">
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                  <Skeleton
                    key={`${column}-${rowIndex}`}
                    className="h-[104px] w-full rounded-lg bg-wh-card-bg"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
