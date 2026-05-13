'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/orders/dashboard-orders-page-view.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { ClipboardList, Truck } from 'lucide-react'

import { CreatePurchaseOrderModal } from '@/components/features/orders/components/create-purchase-order-modal'
import { OrderTypeOverview } from '@/components/features/orders/components/order-type-overview'
import { OrderTypeOverviewSkeleton } from '@/components/features/orders/skeletons/order-type-overview-skeleton'
import { GenericTable } from '@/components/primitives/tables/generic-table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { OrderStatus } from '@/generated/prisma'
import { useOrderTypeDashboard } from '@/hooks/dashboard/orders/use-order-type-dashboard'
import { dashboardApiClient } from '@/lib/axios'
import type { DashboardPurchaseOrderRow } from '@/lib/orders/purchase/get-dashboard-purchase-orders'
import type { ColumnConfig } from '@/types/components/table/column.types'
import { DEFAULT_GENERIC_TABLE_PAGE_SIZE } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type PurchaseOrderRow = {
  id: string
  reference: string
  status: OrderStatus
  supplier: string
  warehouseId: string
  createdAt: string
  businessPartyId: string | null
}

const SUPPORTED_ORDER_TYPES = new Set(['purchase', 'sales', 'transfer'])

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse<unknown> | undefined

    if (data?.message && typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  return fallback
}

function normalizeRows(data: PurchaseOrderRow[]): PurchaseOrderRow[] {
  return data.map((row) => ({
    ...row,
    createdAt:
      typeof row.createdAt === 'string'
        ? row.createdAt
        : new Date(row.createdAt as unknown as Date).toISOString()
  }))
}

function mapDetailedToTableRows(rows: DashboardPurchaseOrderRow[]): PurchaseOrderRow[] {
  return rows.map((row) => ({
    id: row.id,
    reference: row.reference,
    status: row.status,
    supplier: row.supplier,
    warehouseId: row.warehouseId,
    createdAt:
      typeof row.createdAt === 'string'
        ? row.createdAt
        : row.createdAt.toISOString(),
    businessPartyId: row.businessPartyId
  }))
}

const dataColumns: ColumnConfig<PurchaseOrderRow>[] = [
  { label: 'Reference', accessor: 'reference', sortable: true },
  { label: 'Status', accessor: 'status', sortable: true },
  { label: 'Supplier', accessor: 'supplier', sortable: true },
  { label: 'Warehouse', accessor: 'warehouseId', sortable: true },
  { label: 'Created', accessor: 'createdAt', type: 'date', sortable: true }
]

export function DashboardOrdersPageView({ orderType }: { orderType: string }) {
  const normalized = orderType.trim().toLowerCase()
  const isSupported = SUPPORTED_ORDER_TYPES.has(normalized)
  const isPurchase = normalized === 'purchase'

  const { data, isLoading, error, refetch } = useOrderTypeDashboard(orderType, isSupported)

  const [tableRows, setTableRows] = useState<PurchaseOrderRow[]>([])
  const [releasingId, setReleasingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (data?.purchaseOrdersForTable) {
      setTableRows(normalizeRows(mapDetailedToTableRows(data.purchaseOrdersForTable)))

      return
    }

    if (!isPurchase) {
      setTableRows([])
    }
  }, [data?.purchaseOrdersForTable, isPurchase])

  const handleRelease = useCallback(
    async (row: PurchaseOrderRow) => {
      if (releasingId !== null || row.status !== OrderStatus.DRAFT) {
        return
      }

      setActionError(null)
      setReleasingId(row.id)

      try {
        const res = await dashboardApiClient.post<ApiResponse<{ id: string; status: OrderStatus }>>(
          `/dashboard/orders/purchase/${encodeURIComponent(row.id)}/release`,
          {}
        )

        if (res.success) {
          await refetch()
        } else {
          setActionError(res.message || 'Release failed.')
        }
      } catch (err) {
        console.error('[DashboardOrdersPageView] release failed', err)
        setActionError(getApiErrorMessage(err, 'Release failed.'))
      } finally {
        setReleasingId(null)
      }
    },
    [refetch, releasingId]
  )

  const columns = useMemo<ColumnConfig<PurchaseOrderRow>[]>(() => {
    if (!isPurchase) {
      return []
    }

    const busy = releasingId !== null

    return [
      ...dataColumns,
      {
        label: 'Release',
        cell: (row) => {
          if (row.status !== OrderStatus.DRAFT) {
            return <span className="text-brand-subtle">—</span>
          }

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  aria-label="Release to warehouse"
                  className="size-8 rounded-lg text-brand-muted hover:bg-brand-glass-hover hover:text-brand-text disabled:pointer-events-none disabled:opacity-40"
                  data-icon="inline-start"
                  onClick={(event) => {
                    event.stopPropagation()
                    void handleRelease(row)
                  }}
                >
                  <Truck className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Release to warehouse</TooltipContent>
            </Tooltip>
          )
        }
      }
    ]
  }, [handleRelease, isPurchase, releasingId])

  const pageTitle = `${orderType.charAt(0).toUpperCase()}${orderType.slice(1)} orders`

  if (!isSupported) {
    return (
      <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-page-bg-from to-page-bg-to">
        <div className="mx-auto flex w-full max-w-[1200px] origin-top flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <header className="mt-2">
            <h1 className="text-2xl font-semibold text-brand-text">{pageTitle}</h1>
          </header>
          <p className="mt-4 text-sm text-brand-muted">
            This order type is not available in the dashboard yet. Supported types: purchase, sales, and
            transfer.
          </p>
        </div>
      </main>
    )
  }

  if (isLoading && !data) {
    return <OrderTypeOverviewSkeleton />
  }

  if ((!isLoading && error) || !data) {
    return (
      <main className="min-h-screen p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-8 text-center"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            {error ?? 'Could not load order dashboard.'}
          </p>
          <Button type="button" variant="outline" className="mt-6" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </main>
    )
  }

  return (
    <>
      <OrderTypeOverview data={data} />

      {isPurchase && data.purchaseOrdersForTable ? (
        <div
          className="mx-auto w-full max-w-7xl space-y-4 px-4 pb-10 xl:px-6"
          style={{ background: 'var(--wh-page-bg)' }}
        >
          {actionError ? (
            <div
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
            >
              {actionError}
            </div>
          ) : null}

          <section
            className="rounded-lg border p-6"
            style={{
              borderColor: 'var(--wh-border)',
              background: 'var(--wh-card-bg-soft)'
            }}
          >
            <GenericTable
              columns={columns}
              records={tableRows}
              pageSize={DEFAULT_GENERIC_TABLE_PAGE_SIZE}
              headerButtons={(
                <CreatePurchaseOrderModal
                  orderType={orderType}
                  existingOrderCount={tableRows.length}
                  onCreated={async () => {
                    await refetch()
                  }}
                />
              )}
              title="Purchase order operations"
              titleIcon={ClipboardList}
              entityTone="order"
              search={{
                placeholder: 'Search by reference, supplier, or status...',
                fields: ['reference', 'supplier', 'status']
              }}
              emptyMessage="No purchase orders yet."
            />
          </section>
        </div>
      ) : null}
    </>
  )
}
