'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/bins/bin-dashboard-overview-page-client.md
 */


import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { BinOverviewDashboard } from '@/components/dashboard/bins/bin-overview-dashboard'
import { useDashboardBinOverview } from '@/components/dashboard/bins/use-dashboard-bin-overview'
import { Skeleton } from '@/components/ui/skeleton'

export function BinDashboardOverviewPageClient({ binId }: { binId: string }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useDashboardBinOverview(binId)

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-10 w-64 rounded-lg bg-wh-card-bg-soft" />
          <Skeleton className="h-4 max-w-xl rounded-lg bg-wh-card-bg-soft" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-28 rounded-xl bg-wh-card-bg-soft" />
            <Skeleton className="h-28 rounded-xl bg-wh-card-bg-soft" />
            <Skeleton className="h-28 rounded-xl bg-wh-card-bg-soft" />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Skeleton className="h-[320px] rounded-xl bg-wh-card-bg-soft" />
            <Skeleton className="h-[320px] rounded-xl bg-wh-card-bg-soft" />
          </div>
          <Skeleton className="h-72 rounded-xl bg-wh-card-bg-soft" />
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 p-6 xl:p-10">
          <div
            className="w-full max-w-lg rounded-2xl px-6 py-10 text-center"
            style={{
              background: 'var(--wh-card-bg-soft)',
              border: '1px solid var(--wh-border)'
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--wh-text-primary)' }}>
              {error ?? 'Bin not found.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-action-bg)',
                  border: '1px solid var(--wh-action-border)',
                  color: 'var(--wh-action-text)'
                }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                Go back
              </button>
              <Link
                href="/dashboard/locations/zones"
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                All zones
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return <BinOverviewDashboard data={data} />
}
