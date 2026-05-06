import Link from 'next/link'
import { MapPin, Warehouse } from 'lucide-react'

import { PaginationSelector } from '@/components/shared/PaginationSelector'
import type { DashboardWarehouseDisplayRecord, DashboardZoneDisplayRecord } from './dashboard-types'

type SectionBlockProps = {
  title: string
  action?: string
  headerRight?: React.ReactNode
  children: React.ReactNode
}

function SectionBlock({ title, action, headerRight, children }: SectionBlockProps) {
  return (
    <section
      className="rounded-2xl"
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
        <div className="flex shrink-0 items-center gap-2">
          {action ? (
            <div
              className="text-[11px] xl:text-xs"
              style={{ color: 'var(--wh-text-muted)' }}
            >
              {action}
            </div>
          ) : null}
          {headerRight}
        </div>
      </div>

      <div className="space-y-3 p-4 xl:p-5">{children}</div>
    </section>
  )
}

type ListCardProps = {
  icon: React.ElementType
  title: string
  subtitle: string
  accent: string
  metric: string
  detailsHref?: string
}

function ListCard({
  icon: Icon,
  title,
  subtitle,
  accent,
  metric,
  detailsHref
}: ListCardProps) {
  const ctaClassName =
    'rounded-xl px-3 py-2 text-[11px] transition-all duration-300 xl:text-xs '
    + 'opacity-100 md:translate-x-1 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100'
  const ctaStyle = {
    background: 'var(--wh-action-bg)',
    border: '1px solid var(--wh-action-border)',
    color: 'var(--wh-action-text)'
  } as const

  return (
    <div
      className="group rounded-2xl transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div className="flex items-center justify-between gap-4 p-4 xl:p-[18px]">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="rounded-2xl p-3"
            style={{ background: 'var(--wh-card-bg-soft)', color: accent }}
          >
            <Icon size={18} />
          </div>
          <div className="min-w-0">
            <div
              className="truncate text-[15px] font-semibold xl:text-base"
              style={{ color: 'var(--wh-text-primary)' }}
            >
              {title}
            </div>
            <div
              className="truncate text-[11px] xl:text-xs"
              style={{ color: 'var(--wh-text-secondary)' }}
            >
              {subtitle}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div
            className="rounded-full px-3 py-1 text-[11px] xl:text-xs"
            style={{ background: 'var(--wh-card-bg-soft)', color: 'var(--wh-text-secondary)' }}
          >
            {metric}
          </div>

          {detailsHref ? (
            <Link
              href={detailsHref}
              className={`inline-flex items-center justify-center font-medium ${ctaClassName}`}
              style={ctaStyle}
            >
              See details
            </Link>
          ) : (
            <button
              type="button"
              className={`font-medium ${ctaClassName}`}
              style={ctaStyle}
            >
              See details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function DirectorySections({
  warehouses,
  zones,
  warehousesPage,
  warehousesTotalPages,
  onWarehousesPrev,
  onWarehousesNext,
  warehousesMatchCount,
  zonesPage,
  zonesTotalPages,
  onZonesPrev,
  onZonesNext,
  zonesMatchCount
}: {
  warehouses: DashboardWarehouseDisplayRecord[]
  zones: DashboardZoneDisplayRecord[]
  warehousesPage?: number
  warehousesTotalPages?: number
  onWarehousesPrev?: () => void
  onWarehousesNext?: () => void
  warehousesMatchCount?: number
  zonesPage?: number
  zonesTotalPages?: number
  onZonesPrev?: () => void
  onZonesNext?: () => void
  zonesMatchCount?: number
}) {
  const showWarehousePagination =
    typeof warehousesPage === 'number' &&
    typeof warehousesTotalPages === 'number' &&
    onWarehousesPrev &&
    onWarehousesNext
  const showZonePagination =
    typeof zonesPage === 'number' &&
    typeof zonesTotalPages === 'number' &&
    onZonesPrev &&
    onZonesNext

  const warehouseAction =
    typeof warehousesMatchCount === 'number'
      ? `${warehousesMatchCount} total`
      : `${warehouses.length} active shown`
  const zoneAction =
    typeof zonesMatchCount === 'number' ? `${zonesMatchCount} total` : `${zones.length} active shown`

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
      <SectionBlock
        title="Warehouses"
        action={warehouseAction}
        headerRight={
          showWarehousePagination ? (
            <PaginationSelector
              page={warehousesPage}
              totalPages={warehousesTotalPages}
              onPrev={onWarehousesPrev}
              onNext={onWarehousesNext}
            />
          ) : null
        }
      >
        {warehouses.map((warehouse) => (
          <ListCard
            key={warehouse.id}
            icon={Warehouse}
            title={warehouse.name}
            subtitle={warehouse.subtitle}
            metric={warehouse.metric}
            accent="var(--wh-warehouse-accent)"
            detailsHref={`/dashboard/warehouses/${warehouse.id}`}
          />
        ))}
      </SectionBlock>

      <SectionBlock
        title="Zones"
        action={zoneAction}
        headerRight={
          showZonePagination ? (
            <PaginationSelector
              page={zonesPage}
              totalPages={zonesTotalPages}
              onPrev={onZonesPrev}
              onNext={onZonesNext}
            />
          ) : null
        }
      >
        {zones.map((zone) => (
          <ListCard
            key={zone.id}
            icon={MapPin}
            title={zone.name}
            subtitle={zone.subtitle}
            metric={zone.metric}
            accent="var(--wh-zone-accent)"
          />
        ))}
      </SectionBlock>
    </div>
  )
}
