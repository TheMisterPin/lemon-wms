'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page.md
 */


import Link from 'next/link'
import { useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { DASHBOARD_NAV_GROUPS, isRouteActive } from '@/components/dashboard/dashboard-navigation'
import { useDashboardHome } from '@/components/dashboard/home/use-dashboard-home'

import { BinGrid } from './components/BinGrid'
import { DirectorySections } from './components/DirectorySections'
import { OverviewCards } from './components/OverviewCards'
import { DashboardLocationsPageSkeleton } from './dashboard-location-page-skeleton'
import { BinContentsModal } from '../features/bins/bin-contents-modal'

/** Locations overview at `/dashboard` — aggregates only; drill down via `/dashboard/warehouses/[id]`. */
export function DashboardLocationsPageView() {
  const {
    isLoading,
    error,
    refetch,
    overviewCards,
    warehouses,
    zones,
    bins
  } = useDashboardHome()
  const [contentsBinId, setContentsBinId] = useState<string | null>(null)
  const [contentsOpen, setContentsOpen] = useState(false)

  const openContents = useCallback((binId: string) => {
    setContentsBinId(binId)
    setContentsOpen(true)
  }, [])

  const onContentsOpenChange = useCallback((open: boolean) => {
    setContentsOpen(open)
    if (!open) {
      setContentsBinId(null)
    }
  }, [])

  if (isLoading) {
    return <DashboardLocationsPageSkeleton />
  }

  if (error) {
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
              {error}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--wh-action-bg)',
                border: '1px solid var(--wh-action-border)',
                color: 'var(--wh-action-text)'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto max-w-7xl space-y-4 p-4 xl:space-y-5 xl:p-6">
        <section
          className="rounded-2xl"
          style={{
            background: 'var(--wh-card-bg-soft)',
            border: '1px solid var(--wh-border)'
          }}
        >
          <div className="border-b px-4 py-3 xl:px-5" style={{ borderColor: 'var(--wh-border)' }}>
            <h2 className="text-sm font-semibold xl:text-base" style={{ color: 'var(--wh-text-primary)' }}>
              Dashboard navigation
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:p-5">
            {DASHBOARD_NAV_GROUPS.map((group) => {
              const links = group.links ?? []

              if (group.href && links.length === 0) {
                const active = isRouteActive('/dashboard', group.href)

                return (
                  <Link
                    key={group.label}
                    href={group.href}
                    className={[
                      'rounded-xl border px-4 py-3 text-sm font-medium transition-opacity hover:opacity-90',
                      active ? 'opacity-100' : 'opacity-95'
                    ].join(' ')}
                    style={{
                      background: 'var(--wh-card-bg)',
                      borderColor: 'var(--wh-border)',
                      color: 'var(--wh-text-primary)'
                    }}
                  >
                    {group.label}
                  </Link>
                )
              }

              return (
                <details
                  key={group.label}
                  className="group/nav-card rounded-xl border"
                  style={{
                    background: 'var(--wh-card-bg)',
                    borderColor: 'var(--wh-border)'
                  }}
                >
                  <summary
                    className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden"
                    style={{ color: 'var(--wh-text-primary)' }}
                  >
                    <span>{group.label}</span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open/nav-card:rotate-180" />
                  </summary>
                  <div className="grid grid-rows-[0fr] transition-all duration-200 ease-out group-open/nav-card:grid-rows-[1fr]">
                    <div className="space-y-2 overflow-hidden px-4 pb-4">
                      {links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="block rounded-lg border px-3 py-2 text-sm transition-opacity hover:opacity-90"
                          style={{
                            background: 'var(--wh-card-bg-soft)',
                            borderColor: 'var(--wh-border)',
                            color: 'var(--wh-text-secondary)'
                          }}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
        </section>
        <OverviewCards overview={overviewCards} />
        <DirectorySections
          warehouses={warehouses.records}
          zones={zones.records}
          warehousesPage={warehouses.page}
          warehousesTotalPages={warehouses.totalPages}
          onWarehousesPrev={warehouses.onPrev}
          onWarehousesNext={warehouses.onNext}
          warehousesMatchCount={warehouses.matchCount}
          zonesPage={zones.page}
          zonesTotalPages={zones.totalPages}
          onZonesPrev={zones.onPrev}
          onZonesNext={zones.onNext}
          zonesMatchCount={zones.matchCount}
        />
        <BinGrid bins={bins.records} pageSize={bins.pageSize} onViewContents={openContents} />
      </div>
      <BinContentsModal binId={contentsBinId} open={contentsOpen} onOpenChange={onContentsOpenChange} />
    </main>
  )
}
