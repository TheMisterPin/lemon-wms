'use client'

import { useEffect, useState } from 'react'

import { CirclePlus } from 'lucide-react'
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
    <main className="h-full rounded bg-brand-content-bg p-6">
      <div className="flex items-center justify-between mb-6 bg-brand-surface p-4 rounded border text-brand-text w-full">
        <h1 className="text-2xl font-semibold">WAREHOUSES</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded border border-brand-border bg-transparent px-3 py-2 text-sm font-medium text-brand-text transition-colors hover:bg-brand-border"
          >
            <CirclePlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-zinc-400">Loading warehouse data...</p>
      ) : error ? (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <GenericTable
            columns={warehouseTableColumns}
            records={warehouses}
            emptyMessage="No warehouses found."
          />
        </div>
      )}
    </main>
  )
}
