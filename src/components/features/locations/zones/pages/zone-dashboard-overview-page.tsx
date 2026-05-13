'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/zone-dashboard-overview-page-client.md
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useDashboardLocationResource } from '@/components/features/locations/shared/hooks/use-dashboard-location-resource'
import { DashboardZoneOverviewView } from '@/components/features/locations/zones/pages/zone-overview-dashboard'
import { ZoneOverviewDashboardSkeleton } from '@/components/features/locations/zones/skeletons/zone-overview-dashboard-skeleton'
import type { ZoneOverviewDashboardData } from '@/types/zone-overview-dashboard.types'

export function ZoneDashboardOverviewPageClient({ zoneId }: { zoneId: string }) {
  const router = useRouter()
  const { data, isLoading, error } = useDashboardLocationResource<ZoneOverviewDashboardData>({
    endpoint: `/dashboard/zones/${zoneId}/overview`,
    fallbackError: 'Could not load zone overview. Please try again.'
  })

  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="p-4 xl:p-6">
          <ZoneOverviewDashboardSkeleton />
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
              {error ?? 'Zone not found.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/locations/zones')}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-action-bg)',
                  border: '1px solid var(--wh-action-border)',
                  color: 'var(--wh-action-text)'
                }}
              >
                All zones
              </button>
              <Link
                prefetch={false}
                href="/dashboard/locations/warehouses"
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                Warehouses
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return <DashboardZoneOverviewView data={data} />
}
