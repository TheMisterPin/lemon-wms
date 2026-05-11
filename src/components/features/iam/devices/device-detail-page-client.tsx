'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/devices/device-detail-page-client.md
 */


import Link from 'next/link'

import { DeviceDetailDashboard } from '@/components/features/iam/devices/device-detail-dashboard'
import { useDeviceDetailDashboard } from '@/components/features/iam/devices/use-device-detail-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export function DeviceDetailPageClient({ deviceId }: { deviceId: string }) {
  const { data, isLoading, error, refetch } = useDeviceDetailDashboard(deviceId)

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-wh-card-bg-soft" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-wh-card-bg-soft" />
            ))}
          </div>
          <Skeleton className="h-48 rounded-2xl bg-wh-card-bg-soft" />
          <Skeleton className="h-72 rounded-2xl bg-wh-card-bg-soft" />
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
              {error ?? 'Device not found.'}
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
              <Link
                href="/dashboard/auth/devices"
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-secondary)'
                }}
              >
                Back to Devices
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <DeviceDetailDashboard data={data} />
    </main>
  )
}
