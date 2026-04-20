'use client'

import { useEffect, useMemo } from 'react'
import { ClipboardList, Pause, Play } from 'lucide-react'
import { GenericTable } from '@/components/tables/generic-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePurchaseOrders } from '@/components/warehouse/orders/use-purchase-orders'
import { OrderStatus } from '@/generated/prisma'
import type { ColumnConfig } from '@/types/components/table/column.types'
import type { RowAction } from '@/types/components/table/generic-table.types'

type Props = { orderType: string }

export function WarehouseOrdersPageView({ orderType }: Props) {
  const {
    isPurchase,
    filteredRows,
    cards,
    isLoading,
    listError,
    actionError,
    statusFilter,
    actingId,
    loadOrders,
    toggleStatusFilter,
    runAction
  } = usePurchaseOrders(orderType)

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const columns = useMemo<ColumnConfig<(typeof filteredRows)[number]>[]>(() => ([
    { label: 'Reference', accessor: 'reference', sortable: true },
    {
      label: 'Status',
      accessor: 'status',
      type: 'indicator',
      typeValues: {
        conditions: {
          released: '#94a3b8',
          executing: '#4ade80',
          paused: '#f59e0b'
        },
        defaultColor: '#94a3b8'
      },
      sortable: true
    },
    { label: 'Supplier', accessor: 'supplier', sortable: true },
    { label: 'Warehouse', accessor: 'warehouseId', sortable: true },
    { label: 'Created', accessor: 'createdAt', type: 'date', sortable: true }
  ]), [])

  const rowActions = useMemo<RowAction<(typeof filteredRows)[number]>[]>(() => ([
    {
      icon: (row) =>
        row.status === OrderStatus.EXECUTING ? (
          <Pause className="size-4" />
        ) : (
          <Play className="size-4" />
        ),
      tooltip: (row) =>
        row.status === OrderStatus.EXECUTING ? 'Pause' : 'Start / Resume',
      className: (row) =>
        row.status === OrderStatus.EXECUTING ? 'text-amber-300' : 'text-emerald-300',
      onClick: (row) => {
        if (actingId !== null) {
          return
        }
        void runAction(row)
      }
    }
  ]), [actingId, runAction])

  if (!isPurchase) {
    return (
      <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
        <Card className="glass flex-1 overflow-y-auto py-12 px-8">
          <h1 className="text-2xl font-semibold">Warehouse orders</h1>
          <p className="mt-4 text-sm text-brand-muted">
            This order type is not available on the floor yet. Use purchase orders.
          </p>
        </Card>
      </main>
    )
  }

  return (
    <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
      <Card className="glass flex-1 overflow-y-auto py-12 px-8">
        <h1 className="text-2xl font-semibold">Warehouse purchase orders</h1>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {cards.map(card => (
            <button
              key={card.status}
              type="button"
              className={[
                'rounded-lg border px-4 py-4 text-left transition-colors',
                statusFilter === card.status
                  ? 'border-brand-primary bg-brand-primary/10'
                  : 'border-slate-500 bg-brand-glass/75 hover:bg-brand-glass-hover'
              ].join(' ')}
              onClick={() => toggleStatusFilter(card.status)}
            >
              <p className="text-xs text-brand-muted">{card.label}</p>
              <p className="text-3xl font-bold text-brand-text">{card.count}</p>
            </button>
          ))}
        </div>

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
              records={filteredRows}
              title="Operational orders"
              titleIcon={ClipboardList}
              entityTone="order"
              actions={rowActions}
              search={{
                fields: ['reference', 'supplier', 'status'],
                placeholder: 'Search purchase orders...'
              }}
              emptyMessage="No orders in this status."
            />
          </section>
        ) : null}
      </Card>
    </main>
  )
}
