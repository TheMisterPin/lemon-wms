'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/items/warehouse-bin-details-page-view.md
 */


import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ArrowLeft, Filter, Package, Truck } from 'lucide-react'

import { CheckBoxTable } from '@/components/tables/checkbox-table'
import { GenericTable } from '@/components/tables/generic-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UniversalModal } from '@/components/universal-modal'
import { useBinDetails, type BinStockRecord } from '@/components/warehouse/items/use-bin-details'
import { useLoadItemToTrolley } from '@/components/warehouse/items/use-load-item-to-trolley'
import AddItemToBinModal from '@/components/warehouse/modals/add-item-to-bin-modal'
import LoadItemToTrolleyModal from '@/components/warehouse/modals/load-item-to-trolley-modal'
import type { ColumnConfig } from '@/types/components/table/column.types'
import {
  DEFAULT_GENERIC_TABLE_PAGE_SIZE,
  type RowStyleIfConfig
} from '@/types/components/table/generic-table.types'

const itemColumns: ColumnConfig<BinStockRecord>[] = [
  { label: 'SKU', accessor: 'sku' },
  { label: 'name', accessor: 'name' },
  { label: 'Lot', accessor: 'lotId' },
  { label: 'Serial', accessor: 'serialNumberId' },
  {
    label: 'Available',
    accessor: 'quantityAvailable',
    type: 'joinValues',
    typeValues: { values: ['quantityAvailable', 'uom'] }
  },
  {
    label: 'Reserved',
    accessor: 'quantityReserved',
    type: 'joinValues',
    typeValues: { values: ['quantityReserved', 'uom'] }
  },
  {
    label: 'Blocked',
    accessor: 'quantityBlocked',
    type: 'joinValues',
    typeValues: { values: ['quantityBlocked', 'uom'] }
  }
]

const binRowStyleIf: RowStyleIfConfig = {
  rules: [
    {
      accessor: 'quantityBlocked',
      condition: 'positive',
      className: 'bg-red-950/40 text-red-100'
    },
    {
      accessor: 'quantityReserved',
      condition: 'positive',
      className: 'bg-amber-950/40 text-amber-100'
    },
    {
      accessor: 'quantityAvailable',
      condition: 'positive',
      className: ''
    }
  ]
}

type QuantityFilterRow = {
  id: string
  name: string
  description: string
}

const quantityFilterRows: QuantityFilterRow[] = [
  {
    id: 'available',
    name: 'Available',
    description: 'Stock with available quantity'
  },
  {
    id: 'reserved',
    name: 'Reserved',
    description: 'Stock with reserved quantity'
  },
  {
    id: 'blocked',
    name: 'Blocked',
    description: 'Stock with blocked quantity'
  }
]

function qty(value: number | string): number {
  const n = Number(value)

  return Number.isFinite(n) ? n : 0
}

function rowMatchesQuantityKinds(
  row: BinStockRecord,
  kinds: Set<string>
): boolean {
  const showAvailable = kinds.has('available')
  const showReserved = kinds.has('reserved')
  const showBlocked = kinds.has('blocked')

  if (showAvailable && qty(row.quantityAvailable) > 0) {
    return true
  }

  if (showReserved && qty(row.quantityReserved) > 0) {
    return true
  }

  if (showBlocked && qty(row.quantityBlocked) > 0) {
    return true
  }

  return false
}

export function WarehouseBinDetailsPageView() {
  const params = useParams<{ id: string }>()
  const binId = params?.id ?? ''
  const { bin, items, isLoading, occupancy, refresh } = useBinDetails(binId)
  const loadModal = useLoadItemToTrolley(binId, refresh)

  const [filterOpen, setFilterOpen] = useState(false)
  const [appliedQuantityKinds, setAppliedQuantityKinds] = useState<Set<string>>(
    () => new Set(['available'])
  )
  const [draftQuantityKinds, setDraftQuantityKinds] = useState<Set<string>>(
    () => new Set(['available'])
  )

  const filteredItems = useMemo(
    () => items.filter((row) => rowMatchesQuantityKinds(row, appliedQuantityKinds)),
    [items, appliedQuantityKinds]
  )

  const applyQuantityFilter = () => {
    const next = new Set(draftQuantityKinds)

    if (next.size === 0) {
      next.add('available')
    }

    setAppliedQuantityKinds(next)
    setFilterOpen(false)
  }

  const filterModalFooter = (
    <>
      <Button type="button" variant="ghost" onClick={() => setFilterOpen(false)}>
        Cancel
      </Button>
      <Button type="button" onClick={applyQuantityFilter}>
        Apply
      </Button>
    </>
  )

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

        <div id="bin-contents" className="gap-4 rounded-lg bg-brand-glass/75 border border-slate-500 pb-8">
          <h2 className="text-xl font-semibold mt-8 px-4 flex items-center gap-2">
            <Package className="size-5" />
            Bin contents
          </h2>
          <GenericTable
            columns={itemColumns}
            records={filteredItems}
            emptyMessage={isLoading ? 'Loading items...' : 'No items currently in this bin.'}
            pageSize={DEFAULT_GENERIC_TABLE_PAGE_SIZE}
            rowStyleIf={binRowStyleIf}
            headerButtons={
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 gap-2"
                onClick={() => {
                  setDraftQuantityKinds(new Set(appliedQuantityKinds))
                  setFilterOpen(true)
                }}
              >
                <Filter className="size-4" />
                Filter
              </Button>
            }
            actions={[
              {
                icon: <Truck className="size-4" />,
                tooltip: 'Load to trolley',
                onClick: (row) => loadModal.openForItem(row)
              }
            ]}
          />
        </div>

        <UniversalModal
          open={filterOpen}
          onOpenChange={(nextOpen) => {
            if (nextOpen) {
              setDraftQuantityKinds(new Set(appliedQuantityKinds))
            }

            setFilterOpen(nextOpen)
          }}
          title="Quantity types"
          footer={filterModalFooter}
          contentClassName="sm:max-w-lg"
        >
          <p className="text-sm text-brand-muted mb-3">
            Choose which stock rows to include. At least one type must stay selected.
          </p>
          <CheckBoxTable<QuantityFilterRow>
            columns={[
              { key: 'name', label: 'Type' },
              { key: 'description', label: 'Description' }
            ]}
            records={quantityFilterRows}
            selectedIds={draftQuantityKinds}
            onSelectionChange={setDraftQuantityKinds}
          />
        </UniversalModal>
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
