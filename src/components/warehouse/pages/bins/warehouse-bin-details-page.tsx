'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ArrowLeft, Package, Truck } from 'lucide-react'
import { GenericTable } from '@/components/tables/generic-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import AddItemToBinModal from '@/components/warehouse/modals/add-item-to-bin-modal'
import LoadItemToTrolleyModal from '@/components/warehouse/modals/load-item-to-trolley-modal'
import { useBinDetails, type BinStockRecord } from '@/hooks/warehouse/use-bin-details'
import { useLoadItemToTrolley } from '@/hooks/warehouse/use-load-item-to-trolley'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

const itemColumns: TableColumnConfig<BinStockRecord>[] = [
  { label: 'Item ID', accessor: 'itemId' },
  { label: 'Description', accessor: 'description' },
  { label: 'Lot', accessor: 'lotId' },
  { label: 'Serial', accessor: 'serialNumberId' },
  {
    label: 'Available',
    type: 'joinValues',
    joinValuesRef: { first: 'quantityAvailable', second: 'uom' }
  },
  {
    label: 'Reserved',
    type: 'joinValues',
    joinValuesRef: { first: 'quantityReserved', second: 'uom' }
  },
  {
    label: 'Blocked',
    type: 'joinValues',
    joinValuesRef: { first: 'quantityBlocked', second: 'uom' }
  }
]

export function WarehouseBinDetailsPageView() {
  const params = useParams<{ id: string }>()
  const binId = params?.id ?? ''
  const { bin, items, isLoading, occupancy, refresh } = useBinDetails(binId)
  const loadModal = useLoadItemToTrolley(binId, refresh)

  return (
    <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
      <Card className="glass flex-1 overflow-y-auto py-8 px-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Bin Details</h1>
            {bin && (
              <p className="text-brand-muted text-sm mt-1">
                {bin.name} ({bin.code}) · Zone {bin.zoneId}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <AddItemToBinModal binId={binId} onSuccess={refresh} />
            <Button asChild variant="secondary">
              <Link href="/warehouse">
                <ArrowLeft className="size-4 mr-2" />
                Back to warehouse
              </Link>
            </Button>
          </div>
        </div>

        {bin && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-brand-muted">
            <span>Type: {bin.type}</span>
            <span>Occupancy: {occupancy}</span>
            <span>Status: {bin.isBlocked ? 'Blocked' : 'Available'}</span>
            {bin.blockReason && <span>Reason: {bin.blockReason}</span>}
          </div>
        )}

        <div className="gap-4 rounded-lg bg-brand-glass/75 border border-slate-500 pb-8">
          <h2 className="text-xl font-semibold mt-8 px-4 flex items-center gap-2">
            <Package className="size-5" />
            Items in bin
          </h2>
          <GenericTable
            columns={itemColumns}
            records={items}
            emptyMessage={isLoading ? 'Loading items...' : 'No items currently in this bin.'}
            actions={[
              {
                icon: <Truck className="size-4" />,
                tooltip: 'Load to trolley',
                onClick: (row) => loadModal.openForItem(row)
              }
            ]}
          />
        </div>
      </Card>

      <LoadItemToTrolleyModal
        isOpen={loadModal.isOpen}
        onOpenChange={loadModal.onOpenChange}
        selectedItem={loadModal.selectedItem}
        quantity={loadModal.quantity}
        onQuantityChange={loadModal.setQuantity}
        onSubmit={loadModal.submit}
        isSubmitting={loadModal.isSubmitting}
        error={loadModal.error}
      />
    </main>
  )
}
