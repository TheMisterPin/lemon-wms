'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/item-detail-dashboard.md
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { format } from 'date-fns'
import { WarehouseOverviewShellSection } from '@/components/primitives/warehouse-overview-primitives'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { ItemDetailDashboardDTO } from '@/types/item-detail-dashboard.types'

function formatTs(value: string): string {
  return format(new Date(value), 'MMM d, yyyy · HH:mm')
}

function getStatusBadgeColor(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('completed') || statusLower.includes('executed')) {
    return 'default'
  }
  if (statusLower.includes('draft')) {
    return 'secondary'
  }
  if (statusLower.includes('cancelled')) {
    return 'destructive'
  }

  return 'outline'
}

export function ItemDetailDashboard({ data }: { data: ItemDetailDashboardDTO }) {
  const router = useRouter()
  const [showWarehousesSheet, setShowWarehousesSheet] = useState(false)
  const [showBinsSheet, setShowBinsSheet] = useState(false)
  const [showMovementsSheet, setShowMovementsSheet] = useState(false)

  const WAREHOUSE_PAGE_SIZE = 4
  const visibleWarehouses = data.stockByWarehouse.slice(0, WAREHOUSE_PAGE_SIZE)
  const hiddenWarehouses = data.stockByWarehouse.slice(WAREHOUSE_PAGE_SIZE)

  const BIN_PAGE_SIZE = 4
  const visibleBins = data.stockByBin.slice(0, BIN_PAGE_SIZE)
  const hiddenBins = data.stockByBin.slice(BIN_PAGE_SIZE)

  const MOVEMENT_PAGE_SIZE = 4
  const visibleMovements = data.movements.slice(0, MOVEMENT_PAGE_SIZE)
  const hiddenMovements = data.movements.slice(MOVEMENT_PAGE_SIZE)

  const totals = {
    totalOnHand: data.kpis.find((kpi) => kpi.label.toLowerCase() === 'total on hand')?.value ?? '0',
    available: data.kpis.find((kpi) => kpi.label.toLowerCase() === 'available')?.value ?? '0',
    reserved: data.kpis.find((kpi) => kpi.label.toLowerCase() === 'reserved')?.value ?? '0',
    blocked: data.kpis.find((kpi) => kpi.label.toLowerCase() === 'blocked')?.value ?? '0'
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 xl:p-6">
      {/* Header - New Layout */}
      <div
        className="rounded-2xl border p-5 xl:p-6"
        style={{
          background: 'var(--wh-card-bg-soft)',
          borderColor: 'var(--wh-border)'
        }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--wh-text-muted)' }}>
          {data.header.sku}
        </p>
        <h1 className="mt-1 text-2xl font-bold xl:text-3xl" style={{ color: 'var(--wh-text-primary)' }}>
          {data.header.title}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--wh-text-secondary)' }}>
          {data.header.categoryName}
        </p>
      </div>

      {/* KPI Totals - Single card style aligned with stock category cards */}
      <div className="grid grid-cols-1 gap-3">
        <Card
          className="border"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(59,130,246,0.35))',
            borderColor: 'var(--wh-border)'
          }}
        >
          <CardContent className="space-y-3 p-5">
            <div className="text-sm opacity-90" style={{ color: 'var(--wh-text-primary)' }}>
              Totals
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                Total On Hand
              </div>
              <div className="text-3xl font-bold" style={{ color: 'var(--wh-text-primary)' }}>
                {Number(totals.totalOnHand).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs">
              <span style={{ color: 'var(--wh-status-available)' }}>● {Number(totals.available).toLocaleString()} available</span>
              <span style={{ color: 'var(--wh-status-full)' }}>● {Number(totals.reserved).toLocaleString()} reserved</span>
              <span style={{ color: 'var(--wh-status-blocked)' }}>● {Number(totals.blocked).toLocaleString()} blocked</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock by Warehouse - Card Grid with Stacked Status */}
      <WarehouseOverviewShellSection title={`Stock by Warehouse (${data.stockByWarehouse.length})`}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {visibleWarehouses.map((row) => {
              const total = row.available + row.reserved + row.blocked
              const availablePercent = total > 0 ? (row.available / total) * 100 : 0
              const reservedPercent = total > 0 ? (row.reserved / total) * 100 : 0
              const blockedPercent = total > 0 ? (row.blocked / total) * 100 : 0

              return (
                <article
                  key={row.warehouseId}
                  className="rounded-xl border p-4"
                  style={{
                    background: 'var(--wh-card-bg-soft)',
                    borderColor: 'var(--wh-border)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                        {row.warehouseName}
                      </p>
                      <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--wh-text-primary)' }}>
                        {row.totalOnHand}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                        {row.binsCount} bins stacked
                      </p>
                    </div>
                    <div className="space-y-1 text-right text-xs">
                      <p style={{ color: '#22c55e' }}>Available {row.available}</p>
                      <p style={{ color: '#eab308' }}>Reserved {row.reserved}</p>
                      <p style={{ color: '#ef4444' }}>Blocked {row.blocked}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden="true">
                    {availablePercent > 0 && (
                      <div
                        className="bg-green-500"
                        style={{ width: `${availablePercent}%` }}
                        title={`Available: ${row.available}`}
                      />
                    )}
                    {reservedPercent > 0 && (
                      <div
                        className="bg-yellow-500"
                        style={{ width: `${reservedPercent}%` }}
                        title={`Reserved: ${row.reserved}`}
                      />
                    )}
                    {blockedPercent > 0 && (
                      <div
                        className="bg-red-500"
                        style={{ width: `${blockedPercent}%` }}
                        title={`Blocked: ${row.blocked}`}
                      />
                    )}
                  </div>
                </article>
              )
            })}
          </div>

          {hiddenWarehouses.length > 0 && (
            <button
              onClick={() => setShowWarehousesSheet(true)}
              className="w-full rounded-lg border p-3 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--wh-card-bg-soft)',
                borderColor: 'var(--wh-border)',
                color: 'var(--wh-text-primary)'
              }}
            >
              See more ({hiddenWarehouses.length})
            </button>
          )}
        </div>
      </WarehouseOverviewShellSection>

      {/* Orders Using Item - Cards */}
      <WarehouseOverviewShellSection title={`Orders Using Item (${data.orders.length})`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.orders.map((row) => {
            const progressPercent = row.requiredQty > 0 ? (row.processedQty / row.requiredQty) * 100 : 0

            return (
              <button
                key={`${row.type}:${row.orderId}`}
                onClick={() => router.push(`/dashboard/orders/${row.type.toLowerCase()}/${row.orderId}`)}
                className="rounded-xl border p-4 text-left transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)'
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                    {row.type}
                  </span>
                  <Badge variant={getStatusBadgeColor(row.status)}>
                    {row.status}
                  </Badge>
                </div>
                <p className="mt-2 font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                  {row.orderLabel}
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--wh-text-secondary)' }}>
                      {row.processedQty} / {row.requiredQty}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                  {row.warehouseName}
                </p>
              </button>
            )
          })}
        </div>
      </WarehouseOverviewShellSection>

      {/* Stock by Bin & Movement Timeline - 2 Column Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Stock by Bin - Cards with Pagination */}
        <WarehouseOverviewShellSection title={`Stock by Bin (${data.stockByBin.length})`}>
          <div className="space-y-3">
            {visibleBins.map((row) => (
              <Link
                key={row.binStockItemId}
                href={row.href}
                className="block rounded-lg border p-3 transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)'
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                      {row.binCode}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                      {row.zoneName}
                    </p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--wh-text-primary)' }}>
                    {row.available + row.reserved + row.blocked}
                  </p>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e'
                    }}
                  >
                    Avail {row.available}
                  </span>
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      background: 'rgba(234, 179, 8, 0.1)',
                      color: '#eab308'
                    }}
                  >
                    Res {row.reserved}
                  </span>
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444'
                    }}
                  >
                    Blocked {row.blocked}
                  </span>
                </div>
              </Link>
            ))}
            {hiddenBins.length > 0 && (
              <button
                onClick={() => setShowBinsSheet(true)}
                className="w-full rounded-lg border p-3 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                Show more ({hiddenBins.length})
              </button>
            )}
          </div>
        </WarehouseOverviewShellSection>

        {/* Movement Timeline - Cards with Pagination */}
        <WarehouseOverviewShellSection title={`Movement Timeline (${data.movements.length})`}>
          <div className="space-y-3">
            {visibleMovements.map((row) => (
              <div
                key={row.movementId}
                className="rounded-lg border p-3"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)'
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                    {row.sku}
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--wh-text-primary)' }}>
                    {row.quantity}
                  </p>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                  {row.fromBinCode ?? '—'} → {row.toBinCode ?? '—'}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    {row.userName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    {formatTs(row.occurredAt)}
                  </p>
                </div>
              </div>
            ))}
            {hiddenMovements.length > 0 && (
              <button
                onClick={() => setShowMovementsSheet(true)}
                className="w-full rounded-lg border p-3 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                See more ({hiddenMovements.length})
              </button>
            )}
          </div>
        </WarehouseOverviewShellSection>
      </div>

      {/* Stock by Warehouse Sheet */}
      <Sheet open={showWarehousesSheet} onOpenChange={setShowWarehousesSheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>All Warehouses ({data.stockByWarehouse.length})</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3 pr-6">
            {data.stockByWarehouse.map((row) => {
              const total = row.available + row.reserved + row.blocked
              const availablePercent = total > 0 ? (row.available / total) * 100 : 0
              const reservedPercent = total > 0 ? (row.reserved / total) * 100 : 0
              const blockedPercent = total > 0 ? (row.blocked / total) * 100 : 0

              return (
                <article
                  key={row.warehouseId}
                  className="rounded-xl border p-4"
                  style={{
                    background: 'var(--wh-card-bg-soft)',
                    borderColor: 'var(--wh-border)'
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                        {row.warehouseName}
                      </p>
                      <p className="mt-1 text-2xl font-bold" style={{ color: 'var(--wh-text-primary)' }}>
                        {row.totalOnHand}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                        {row.binsCount} bins stacked
                      </p>
                    </div>
                    <div className="space-y-1 text-right text-xs">
                      <p style={{ color: '#22c55e' }}>Available {row.available}</p>
                      <p style={{ color: '#eab308' }}>Reserved {row.reserved}</p>
                      <p style={{ color: '#ef4444' }}>Blocked {row.blocked}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex h-3 gap-1 overflow-hidden rounded-full" aria-hidden="true">
                    {availablePercent > 0 && (
                      <div
                        className="bg-green-500"
                        style={{ width: `${availablePercent}%` }}
                        title={`Available: ${row.available}`}
                      />
                    )}
                    {reservedPercent > 0 && (
                      <div
                        className="bg-yellow-500"
                        style={{ width: `${reservedPercent}%` }}
                        title={`Reserved: ${row.reserved}`}
                      />
                    )}
                    {blockedPercent > 0 && (
                      <div
                        className="bg-red-500"
                        style={{ width: `${blockedPercent}%` }}
                        title={`Blocked: ${row.blocked}`}
                      />
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* Stock by Bin Sheet */}
      <Sheet open={showBinsSheet} onOpenChange={setShowBinsSheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>All Stock by Bin ({data.stockByBin.length})</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3 pr-6">
            {data.stockByBin.map((row) => (
              <Link
                key={row.binStockItemId}
                href={row.href}
                className="block rounded-lg border p-3 transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)'
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                      {row.binCode}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                      {row.warehouseName} · {row.zoneName}
                    </p>
                  </div>
                  <p className="text-lg font-bold" style={{ color: 'var(--wh-text-primary)' }}>
                    {row.available + row.reserved + row.blocked}
                  </p>
                </div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e'
                    }}
                  >
                    Avail {row.available}
                  </span>
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      background: 'rgba(234, 179, 8, 0.1)',
                      color: '#eab308'
                    }}
                  >
                    Res {row.reserved}
                  </span>
                  <span
                    className="rounded px-2 py-1"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444'
                    }}
                  >
                    Blocked {row.blocked}
                  </span>
                </div>
                {row.lotCode && (
                  <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    Lot: {row.lotCode}
                  </p>
                )}
                {row.serialNumber && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    Serial: {row.serialNumber}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Movement Timeline Sheet */}
      <Sheet open={showMovementsSheet} onOpenChange={setShowMovementsSheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>All Movement Events ({data.movements.length})</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-3 pr-6">
            {data.movements.map((row) => (
              <div
                key={row.movementId}
                className="rounded-lg border p-3"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  borderColor: 'var(--wh-border)'
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold" style={{ color: 'var(--wh-text-primary)' }}>
                    {row.sku}
                  </p>
                  <p className="text-lg font-bold" style={{ color: 'var(--wh-text-primary)' }}>
                    {row.quantity}
                  </p>
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                  {row.fromBinCode ?? '—'} → {row.toBinCode ?? '—'}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                    {row.userName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                    {formatTs(row.occurredAt)}
                  </p>
                </div>
                <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                  BOE: {row.boeId}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
