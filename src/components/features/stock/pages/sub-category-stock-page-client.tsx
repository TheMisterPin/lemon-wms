'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Layers, Tags } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import {
  DashboardDonutBreakdown,
  DashboardPageShell,
  DashboardSection
} from '@/components/primitives/dashboard'
import { CategoryPickerIcon } from '@/components/primitives/media/category-icon'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { useSubcategoryStockDashboard } from '@/hooks/dashboard/stock/use-subcategory-stock-dashboard'
import type { SubcategoryStockItemRow } from '@/types/subcategory-stock-dashboard.types'
import { formatTs, humanizeEnum } from '@/utils/components/formatters/enums'

import CategoryStockPageSkeleton from '../skeletons/category-stock-page-skeleton'

const ITEM_TABLE_PREVIEW = 10
const ACTIVITY_PREVIEW = 5

const SHEET_CLASS =
  'flex h-full max-h-[100dvh] w-full flex-col gap-0 overflow-hidden border-wh-border bg-wh-page-bg p-0 text-wh-text-primary sm:max-w-2xl'

const lineTooltip = {
  contentStyle: {
    background: 'var(--wh-card-bg)',
    border: '1px solid var(--wh-border)',
    borderRadius: '8px',
    color: 'var(--wh-text-primary)',
    fontSize: 12
  } as const,
  labelStyle: { color: 'var(--wh-text-secondary)' } as const,
  itemStyle: { color: 'var(--wh-text-primary)' } as const
}

function stockLevelPercent(row: SubcategoryStockItemRow): number {
  const target = Math.max(row.minQuantity, 1)

  return Math.min(100, Math.round((row.onHand / target) * 100))
}

type SubcategoryItemSheetCardProps = {
  row: SubcategoryStockItemRow
}

function SubcategoryItemSheetCard({ row }: SubcategoryItemSheetCardProps) {
  const pct = stockLevelPercent(row)

  return (
    <Link href={row.href} className="block transition-opacity hover:opacity-90">
      <Card className="border" style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg)' }}>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                {row.name}
              </div>
              <div className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                {row.sku} · min {row.minQuantity.toLocaleString()} {row.uom}
              </div>
            </div>
            <div className="text-right text-xs tabular-nums" style={{ color: 'var(--wh-text-secondary)' }}>
              <div>On hand {row.onHand.toLocaleString()}</div>
              <div>
                Avail {row.available.toLocaleString()} · Res {row.reserved.toLocaleString()} · Blk{' '}
                {row.blocked.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                background: row.isLowStock ? 'var(--wh-status-blocked)' : 'var(--wh-status-available)'
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: 'var(--wh-text-muted)' }}>
            <span>{row.isLowStock ? 'Below minimum' : 'Stock vs minimum'}</span>
            <span className="tabular-nums">{pct}%</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

type SubCategoryStockPageClientProps = {
  subcategoryId: string
}

export function SubCategoryStockPageClient({ subcategoryId }: SubCategoryStockPageClientProps) {
  const { data, isLoading, error, refetch } = useSubcategoryStockDashboard(subcategoryId)
  const [itemsSheetOpen, setItemsSheetOpen] = useState(false)
  const [activitySheetOpen, setActivitySheetOpen] = useState(false)

  const donutRows = useMemo(() => {
    if (!data) {
      return []
    }

    const colorByBucket: Record<string, string> = {
      AVAILABLE: 'var(--wh-status-available)',
      RESERVED: 'var(--wh-status-full)',
      BLOCKED: 'var(--wh-status-blocked)'
    }

    const labelByBucket: Record<string, string> = {
      AVAILABLE: 'Available',
      RESERVED: 'Reserved',
      BLOCKED: 'Blocked'
    }

    return data.availabilityDonut.map((row) => ({
      id: row.bucket,
      label: labelByBucket[row.bucket] ?? row.bucket,
      value: row.quantity,
      color: colorByBucket[row.bucket] ?? 'var(--wh-text-muted)'
    }))
  }, [data])

  const donutTotal = useMemo(
    () => donutRows.reduce((sum, r) => sum + r.value, 0),
    [donutRows]
  )

  const previewItems = useMemo(() => data?.items.slice(0, ITEM_TABLE_PREVIEW) ?? [], [data])
  const hiddenItemCount = Math.max(0, (data?.items.length ?? 0) - previewItems.length)

  const previewActivities = useMemo(
    () => data?.activities.slice(0, ACTIVITY_PREVIEW) ?? [],
    [data]
  )
  const hiddenActivityCount = Math.max(0, (data?.activities.length ?? 0) - previewActivities.length)

  const fillChartRows = useMemo(() => {
    if (!data) {
      return []
    }

    return data.fillOverTime.map((p) => ({
      ...p,
      tick: format(new Date(p.occurredAt), 'MMM d HH:mm')
    }))
  }, [data])

  if (isLoading) {
    return <CategoryStockPageSkeleton />
  }

  if (error !== null || data === null) {
    return (
      <DashboardPageShell
        title="Subcategory"
        error={error ?? 'Could not load subcategory dashboard.'}
        onRetry={() => void refetch()}
      />
    )
  }

  const breadcrumbs = (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm">
      {data.breadcrumbs.map((crumb, i) => (
        <span key={`${crumb.href}-${i}`} className="flex items-center gap-1">
          {i > 0 ? (
            <span style={{ color: 'var(--wh-text-muted)' }} aria-hidden>
              /
            </span>
          ) : null}
          {i === data.breadcrumbs.length - 1 ? (
            <span className="font-medium" style={{ color: 'var(--wh-text-primary)' }}>
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className="hover:underline" style={{ color: 'var(--wh-text-secondary)' }}>
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )

  return (
    <DashboardPageShell
      title={
        <span className="flex items-center gap-3">
          <span
            className="inline-flex shrink-0 rounded-lg border p-1.5"
            style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg)' }}
          >
            <CategoryPickerIcon iconUrl={data.subcategory.iconUrl} fallback={Layers} size={36} />
          </span>
          <span>{data.header.title}</span>
        </span>
      }
      subtitle={
        <>
          {data.header.subtitle} ·{' '}
          <span className="inline-flex items-center gap-1.5">
            <CategoryPickerIcon iconUrl={data.parent.iconUrl} fallback={Tags} size={18} />
            <Link href={data.parent.href} className="hover:underline" style={{ color: 'var(--wh-text-secondary)' }}>
              Parent: {data.parent.name}
            </Link>
          </span>
        </>
      }
      isLoading={isLoading}
      className="space-y-8 xl:space-y-10"
    >
      {breadcrumbs}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className="border"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <CardContent className="p-5">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              Total on hand
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {data.kpis.totalOnHand.toLocaleString()}
            </div>
            <p className="mt-2 flex flex-wrap gap-x-2 gap-y-1 text-[11px]" style={{ color: 'var(--wh-text-secondary)' }}>
              <span style={{ color: 'var(--wh-status-available)' }}>
                {data.kpis.totalAvailable.toLocaleString()} avail
              </span>
              <span style={{ color: 'var(--wh-status-full)' }}>{data.kpis.totalReserved.toLocaleString()} res</span>
              <span style={{ color: 'var(--wh-status-blocked)' }}>{data.kpis.totalBlocked.toLocaleString()} blk</span>
            </p>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <CardContent className="p-5">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              Occupied bins
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {data.kpis.occupiedBins.toLocaleString()}
            </div>
            <p className="mt-2 text-[11px]" style={{ color: 'var(--wh-text-secondary)' }}>
              Bins holding stock for this subcategory
            </p>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <CardContent className="p-5">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              Orders with these items
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {data.kpis.ordersUsingItems.toLocaleString()}
            </div>
            <p className="mt-2 text-[11px]" style={{ color: 'var(--wh-text-secondary)' }}>
              Distinct operational orders (any line type)
            </p>
          </CardContent>
        </Card>

        <Card
          className="border"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <CardContent className="p-5">
            <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              Low stock items
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
              {data.kpis.lowStockItemsCount.toLocaleString()}
            </div>
            <p className="mt-2 text-[11px]" style={{ color: 'var(--wh-text-secondary)' }}>
              On hand below minimum quantity
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <DashboardSection title="Availability" action={`${donutTotal.toLocaleString()} units in bins`}>
          {donutRows.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No bin stock rows for this subcategory yet.
            </p>
          ) : (
            <DashboardDonutBreakdown
              rows={donutRows}
              total={donutTotal}
              totalLabel="Units in bins"
              valueLabel="units"
            />
          )}
        </DashboardSection>

        <DashboardSection
          title="Units in bins over time (BinHistory)"
          action="Daily snapshots · summed across bins that hold this subcategory"
        >
          <div
            className="rounded-2xl p-3 xl:p-4"
            style={{
              background: 'var(--wh-card-bg)',
              boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
              border: '1px solid var(--wh-border)'
            }}
          >
            <div className="h-[260px] w-full min-w-0">
              {fillChartRows.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
                  No BinHistory yet for bins that hold this subcategory.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fillChartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="var(--wh-border)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="tick"
                      stroke="var(--wh-text-muted)"
                      tick={{ fill: 'var(--wh-text-muted)', fontSize: 10 }}
                    />
                    <YAxis
                      stroke="var(--wh-text-muted)"
                      tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                    />
                    <Tooltip
                      {...lineTooltip}
                      labelFormatter={(_label, items) => {
                        const first =
                          Array.isArray(items) && items.length > 0 && typeof items[0] === 'object'
                            ? (items[0] as { payload?: { occurredAt?: string } }).payload
                            : undefined

                        return first?.occurredAt !== undefined
                          ? format(new Date(first.occurredAt), 'PPpp')
                          : ''
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="unitsOnHand"
                      name="Units on hand"
                      stroke="var(--wh-status-available, #22c55e)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </DashboardSection>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <DashboardSection
          title="Items"
          action={
            <div className="flex items-center gap-2">
              <span className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                {data.items.length.toLocaleString()} items
              </span>
              {hiddenItemCount > 0 ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => setItemsSheetOpen(true)}>
                  Show all
                </Button>
              ) : null}
            </div>
          }
        >
          {data.items.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No items in this subcategory.
            </p>
          ) : (
            <div
              className="rounded-2xl p-3 xl:p-4"
              style={{
                background: 'var(--wh-card-bg)',
                border: '1px solid var(--wh-border)'
              }}
            >
              <div className="mb-2 grid grid-cols-7 gap-1 text-[11px] font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                <span>SKU</span>
                <span className="col-span-2">Item</span>
                <span>On hand</span>
                <span>Avail</span>
                <span>Res</span>
                <span>Blk</span>
              </div>
              <div className="space-y-1.5 text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                {previewItems.map((row) => (
                  <Link
                    key={row.itemId}
                    href={row.href}
                    className="grid grid-cols-7 gap-1 rounded-md border-l-2 border-l-[var(--wh-border)] py-1 pl-2 transition-opacity hover:opacity-90"
                  >
                    <span className="min-w-0 truncate">{row.sku}</span>
                    <span className="col-span-2 min-w-0 truncate">{row.name}</span>
                    <span className="tabular-nums">{row.onHand.toLocaleString()}</span>
                    <span className="tabular-nums" style={{ color: 'var(--wh-status-available)' }}>
                      {row.available.toLocaleString()}
                    </span>
                    <span className="tabular-nums" style={{ color: 'var(--wh-status-full)' }}>
                      {row.reserved.toLocaleString()}
                    </span>
                    <span className="tabular-nums" style={{ color: 'var(--wh-status-blocked)' }}>
                      {row.blocked.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </DashboardSection>

        <DashboardSection
          title="Recent bin operations"
          action={
            <div className="flex items-center gap-2">
              <span className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                {data.activities.length.toLocaleString()} events
              </span>
              {hiddenActivityCount > 0 ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => setActivitySheetOpen(true)}>
                  Show all
                </Button>
              ) : null}
            </div>
          }
        >
          {data.activities.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No bin operation entries for items in this subcategory yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {previewActivities.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border p-3 text-sm"
                  style={{
                    borderColor: 'var(--wh-border)',
                    background: 'var(--wh-card-bg-soft)'
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium" style={{ color: 'var(--wh-text-primary)' }}>
                      {humanizeEnum(row.operationType)}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--wh-text-muted)' }}>
                      {formatTs(row.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    {row.itemSku} · qty {row.quantity >= 0 ? '+' : ''}
                    {row.quantity.toLocaleString()} · {row.userName} · {row.warehouseName}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>

      <Sheet open={itemsSheetOpen} onOpenChange={setItemsSheetOpen}>
        <SheetContent side="right" showCloseButton className={SHEET_CLASS}>
          <SheetHeader className="border-b border-wh-border px-4 py-4 text-left">
            <SheetTitle className="text-wh-text-primary">All items</SheetTitle>
            <SheetDescription className="text-wh-text-muted">
              {data.subcategory.name} · {data.items.length.toLocaleString()} items
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {data.items.map((row) => (
                <SubcategoryItemSheetCard key={`sheet-item-${row.itemId}`} row={row} />
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={activitySheetOpen} onOpenChange={setActivitySheetOpen}>
        <SheetContent side="right" showCloseButton className={SHEET_CLASS}>
          <SheetHeader className="border-b border-wh-border px-4 py-4 text-left">
            <SheetTitle className="text-wh-text-primary">All bin operations</SheetTitle>
            <SheetDescription className="text-wh-text-muted">
              {data.subcategory.name} · {data.activities.length.toLocaleString()} events
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-3">
              {data.activities.map((row) => (
                <li
                  key={`sheet-act-${row.id}`}
                  className="rounded-lg border p-3 text-sm"
                  style={{
                    borderColor: 'var(--wh-border)',
                    background: 'var(--wh-card-bg-soft)'
                  }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium" style={{ color: 'var(--wh-text-primary)' }}>
                      {humanizeEnum(row.operationType)}
                    </span>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--wh-text-muted)' }}>
                      {formatTs(row.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    {row.itemSku} · qty {row.quantity >= 0 ? '+' : ''}
                    {row.quantity.toLocaleString()} · {row.userName} · {row.warehouseName}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </DashboardPageShell>
  )
}
