'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { ArrowLeft, Package } from 'lucide-react'
import { GenericTable } from '@/components/tables/generic-table'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import AddItemToBinModal from '@/components/warehouse/modals/add-item-to-bin-modal'
import { apiClient } from '@/lib/axios'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type BinStockRecord = {
  id: string
  description: string
  itemId: string
  lotId: string | null
  serialNumberId: string | null
  boxId: string | null
  uom: string
  quantityAvailable: number | string
  quantityReserved: number | string
  quantityBlocked: number | string
}

type BinDetails = {
  id: string
  code: string
  name: string
  type: string
  zoneId: string
  warehouseId: string
  currentCapacity: number | string
  maxCapacity: number | string
  isBlocked: boolean
  blockReason: string | null
}

type BinDetailsResponse = {
  bin: BinDetails
  items: BinStockRecord[]
}

const itemColumns: TableColumnConfig<BinStockRecord>[] = [
  { label: 'Item ID', accessor: 'itemId' },
  { label: 'Description', accessor: 'description' },
  { label: 'Lot', accessor: 'lotId' },
  { label: 'Serial', accessor: 'serialNumberId' },
  {
    label: 'Available',
    type: 'joinValues',
    joinValuesRef: {
      first: 'quantityAvailable',
      second: 'uom'
    }
  },
  {
    label: 'Reserved',
    type: 'joinValues',
    joinValuesRef: {
      first: 'quantityReserved',
      second: 'uom'
    }
  },
  {
    label: 'Blocked',
    type: 'joinValues',
    joinValuesRef: {
      first: 'quantityBlocked',
      second: 'uom'
    }
  }
]

export default function WarehouseBinDetailsPage() {
  const params = useParams<{ id: string }>()
  const binId = params?.id ?? ''

  const [data, setData] = useState<BinDetailsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    async function fetchBinDetails() {
      try {
        setIsLoading(true)
        const response = await apiClient.get<ApiResponse<BinDetailsResponse>>(`/warehouse/bins/${binId}`)

        if (response.success && response.data) {
          setData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch bin details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (binId) {
      void fetchBinDetails()
    }
  }, [binId, refreshKey])

  const occupancy = useMemo(() => {
    if (!data?.bin) {
      return '0%'
    }

    const currentCapacity = Number(data.bin.currentCapacity) || 0
    const maxCapacity = Number(data.bin.maxCapacity) || 0

    if (maxCapacity <= 0) {
      return '0%'
    }

    return `${Math.round((currentCapacity / maxCapacity) * 100)}%`
  }, [data])

  return (
    <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
      <Card className="glass flex-1 overflow-y-auto py-8 px-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Bin Details</h1>
            {data?.bin && (
              <p className="text-brand-muted text-sm mt-1">
                {data.bin.name} ({data.bin.code}) · Zone {data.bin.zoneId}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <AddItemToBinModal
              binId={binId}
              onSuccess={() => setRefreshKey((currentValue) => currentValue + 1)}
            />
            <Button asChild variant="secondary">
              <Link href="/warehouse">
                <ArrowLeft className="size-4 mr-2" />
                Back to warehouse
              </Link>
            </Button>
          </div>
        </div>

        {data?.bin && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-brand-muted">
            <span>Type: {data.bin.type}</span>
            <span>Occupancy: {occupancy}</span>
            <span>Status: {data.bin.isBlocked ? 'Blocked' : 'Available'}</span>
            {data.bin.blockReason && <span>Reason: {data.bin.blockReason}</span>}
          </div>
        )}

        <div className="gap-4 rounded-lg bg-brand-glass/75 border border-slate-500 pb-8">
          <h2 className="text-xl font-semibold mt-8 px-4 flex items-center gap-2">
            <Package className="size-5" />
            Items in bin
          </h2>
          <GenericTable
            columns={itemColumns}
            records={data?.items ?? []}
            emptyMessage={isLoading ? 'Loading items...' : 'No items currently in this bin.'}
          />
        </div>
      </Card>
    </main>
  )
}
