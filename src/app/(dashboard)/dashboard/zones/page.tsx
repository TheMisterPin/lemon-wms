/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useEffect, useState } from 'react'

import PageWithGrid from '@/components/pages/page-with-grid'
import type { Warehouse } from '@/lib/components/configs/entities/warehouse/types'
import { warehouseTableColumns } from '@/lib/components/configs/forms/warehouse-form-config'

type ZonesApiResponse = {
  success: boolean
  data: Array<Omit<Warehouse, 'createdAt' | 'deletedAt'> & {
    createdAt: string
    deletedAt: string | null
  }>
}

export default function ZonesHomePage() {
  const [zones, setZones] = useState<any[]>([])
  const [warehouseList, setWarehouseList] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function handleRowClick(row: any) {
    // eslint-disable-next-line no-console
    console.log('Clicked zone row:', row)
  }

  useEffect(() => {
    let isMounted = true

    async function loadZones() {
      try {
        const response = await fetch('/api/zones', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load zones.')
        }

        const payload = await response.json()
        if (!isMounted) {
          return
        }

        setZones(
          payload.data.zones
        )
        setWarehouseList(payload.data.warehouseList.map((warehouse : any) => warehouse.name))
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setError('Unable to load zones.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadZones()

    return () => {
      isMounted = false
    }
  }, [])

  return (

    <PageWithGrid
      title='Zones'
      headerActions={null}
      isLoading={isLoading}
      error={error}
      tableData={{ columns: warehouseTableColumns, records: zones }}
      onRowClick={handleRowClick}
    />
  )
}
