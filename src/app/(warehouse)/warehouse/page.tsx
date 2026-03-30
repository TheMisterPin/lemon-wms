'use client'

import { useEffect, useState } from 'react'

import { GenericTable } from '@/components/tables/generic-table'
import { warehouseTableColumns } from '@/lib/components/configs/entities/warehouse/config'
import type { Warehouse } from '@/lib/components/configs/entities/warehouse/types'

type WarehouseApiResponse = {
  success: boolean
  data: Array<Omit<Warehouse, 'createdAt' | 'deletedAt'> & {
    createdAt: string
    deletedAt: string | null
  }>
}

export default function WarehouseHomePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function handleRowClick(row: Warehouse) {
    // eslint-disable-next-line no-console
    console.log('Clicked warehouse row:', row)
  }

  useEffect(() => {
    let isMounted = true

    async function loadWarehouses() {
      try {
        const response = await fetch('/api/warehouses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load warehouses.')
        }

        const payload = await response.json() as WarehouseApiResponse

        if (!isMounted) {
          return
        }

        setWarehouses(
          payload.data.map((warehouse) => ({
            ...warehouse,
            createdAt: new Date(warehouse.createdAt),
            deletedAt: warehouse.deletedAt ? new Date(warehouse.deletedAt) : null
          }))
        )
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setError('Unable to load warehouses.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadWarehouses()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="rounded border border-zinc-800 bg-zinc-900 p-6">
      <h1 className="text-2xl font-semibold">Order Pool</h1>
      <p className="text-sm text-zinc-400">Phase 0 warehouse shell complete.</p>

      {isLoading ? (
        <p className="mt-4 text-sm text-zinc-400">Loading warehouse data...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <GenericTable
            columns={warehouseTableColumns}
            records={warehouses}
            onRowClick={handleRowClick}
            emptyMessage="No warehouses found."
          />
        </div>
      )}
    </main>
  )
}
