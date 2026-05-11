'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/bins/bin-dashboard-overview-page-client.md
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { BinOverviewDashboard } from '@/components/features/locations/components/bin-overview-dashboard'
import { BinOverviewDashboardSkeleton } from '@/components/features/locations/skeletons'
import { useDashboardBinOverview } from '@/hooks/dashboard/locations/use-dashboard-bin-overview'
export function BinDashboardOverviewPage({ binId }: { binId: string }) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useDashboardBinOverview(binId)

  if (isLoading) {
    return (
      <BinOverviewDashboardSkeleton />
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
