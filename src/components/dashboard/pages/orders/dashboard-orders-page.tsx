'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { ClipboardList, Truck } from 'lucide-react'

import { CreatePurchaseOrderModal } from '@/components/dashboard/pages/orders/create-purchase-order-modal'
import { GenericTable } from '@/components/tables/generic-table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { OrderStatus } from '@/generated/prisma'
import { dashboardApiClient } from '@/lib/axios'
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

/**
 * Converts request-layer errors into readable UI messages.
 */
function getApiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiResponse<unknown> | undefined

    if (data?.message && typeof data.message === 'string' && data.message.trim()) {
      return data.message
    }
  }

  return fallback
}

/**
 * Ensures table rows always carry an ISO createdAt string for date rendering.
 */
function normalizeRows(data: PurchaseOrderRow[]): PurchaseOrderRow[] {
  return data.map((row) => ({
    ...row,
    createdAt:
      typeof row.createdAt === 'string'
        ? row.createdAt
        : new Date(row.createdAt as unknown as Date).toISOString()
  }))
}

const dataColumns: ColumnConfig<PurchaseOrderRow>[] = [
  { label: 'Reference', accessor: 'reference', sortable: true },
  { label: 'Status', accessor: 'status', sortable: true },
  { label: 'Supplier', accessor: 'supplier', sortable: true },
  { label: 'Warehouse', accessor: 'warehouseId', sortable: true },
  { label: 'Created', accessor: 'createdAt', type: 'date', sortable: true }
]

/**
 * Dashboard page for order listing and release action.
 * Purchase orders are fully supported; other order types show a placeholder state.
 */
export function DashboardOrdersPageView({ orderType }: { orderType: string }) {
  const isPurchase = orderType === 'purchase'
  const [rows, setRows] = useState<PurchaseOrderRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [releasingId, setReleasingId] = useState<string | null>(null)

  /**
   * Loads current purchase orders for the dashboard table.
   * Silent mode is used after actions to avoid UI flicker.
   */
  const loadOrders = useCallback(async (opts?: { silent?: boolean }) => {
    if (!isPurchase) {
      return
    }

    const silent = opts?.silent === true

    if (!silent) {
      setIsLoading(true)
    }

    setListError(null)

    try {
      const res = await dashboardApiClient.get<ApiResponse<PurchaseOrderRow[]>>(
        '/dashboard/orders/purchase'
      )

      if (res.success && res.data) {
        setRows(normalizeRows(res.data))
      } else {
        setListError(res.message || 'Unable to load purchase orders.')
      }
    } catch (err) {
      console.error('[DashboardOrdersPageView] list failed', err)
      setListError(getApiErrorMessage(err, 'Unable to load purchase orders.'))
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }, [isPurchase])

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  /**
   * Calls the release endpoint for a draft order and refreshes the list.
   */
  const handleRelease = useCallback(
    async (row: PurchaseOrderRow) => {
      if (releasingId !== null || row.status !== OrderStatus.DRAFT) {
        return
      }

      setActionError(null)
      setReleasingId(row.id)

      try {
        const res = await dashboardApiClient.post<
          ApiResponse<{ id: string; status: OrderStatus }>
        >(
          '/dashboard/orders/purchase/' + encodeURIComponent(row.id) + '/release',
          {}
        )

        if (res.success) {
          await loadOrders({ silent: true })
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
    [loadOrders, releasingId]
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
                  className="size-8 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-glass-hover disabled:pointer-events-none disabled:opacity-40"
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

  const pageTitle = isPurchase
    ? 'Purchase orders'
    : `${orderType.charAt(0).toUpperCase()}${orderType.slice(1)} orders`

  if (!isPurchase) {
    return (
      <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-page-bg-from to-page-bg-to">
        <div className="mx-auto flex w-full max-w-[1200px] origin-top flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <header className="mt-2">
            <h1 className="text-2xl font-semibold text-brand-text">{pageTitle}</h1>
          </header>
          <p className="mt-4 text-sm text-brand-muted">
            This order type is not available in the dashboard yet. Purchase orders are supported
            under <span className="text-brand-text/90">/dashboard/orders/purchase</span>.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-page-bg-from to-page-bg-to">
      <div className="mx-auto flex w-full max-w-[1200px] origin-top flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <header className="mt-2">
          <h1 className="text-2xl font-semibold text-brand-text">{pageTitle}</h1>
        </header>

        {isLoading ? (
          <div className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75 p-6 text-sm text-brand-muted">
            Loading purchase orders...
          </div>
        ) : null}

        {!isLoading && listError ? (
          <div className="mt-6 rounded-lg border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
            <p>{listError}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-rose-500/40 text-rose-100 hover:bg-rose-500/20"
              onClick={() => void loadOrders()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {actionError ? (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            {actionError}
          </div>
        ) : null}

        {!isLoading && !listError ? (
          <section className="mt-6 rounded-lg border border-slate-500 bg-brand-glass/75 p-6">
            <GenericTable
              columns={columns}
              records={rows}
              pageSize={DEFAULT_GENERIC_TABLE_PAGE_SIZE}
              headerButtons={(
                <CreatePurchaseOrderModal
                  orderType={orderType}
                  existingOrderCount={rows.length}
                  onCreated={async () => {
                    await loadOrders({ silent: true })
                  }}
                />
              )}
              title="Orders"
              titleIcon={ClipboardList}
              entityTone="order"
              search={{
                placeholder: 'Search by reference, supplier, or status...',
                fields: ['reference', 'supplier', 'status']
              }}
              emptyMessage="No purchase orders yet."
            />
          </section>
        ) : null}
      </div>
    </main>
  )
}
