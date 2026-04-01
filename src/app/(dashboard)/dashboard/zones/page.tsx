'use client'

import { useEffect, useState } from 'react'

import CreateZoneForm from '@/app/(dashboard)/dashboard/zones/components/create-zone-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import type { Warehouse } from '@/lib/components/configs/entities/warehouse/types'
import { zoneTableColumns, type ZoneTableRow } from '@/lib/components/configs/entities/zone/config'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type ZoneApiRecord = {
  id: string
  warehouseId: string
  name: string
  type: string
  isActive: boolean
  createdAt: string
  deletedAt: string | null
}

type ApiPayload<T> = {
  success: boolean
  data: T
}

export default function ZonesHomePage() {
  const [zones, setZones] = useState<ZoneTableRow[]>([])
  const [warehouseList, setWarehouseList] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function handleRowClick(row: ZoneTableRow) {
    // eslint-disable-next-line no-console
    console.log('Clicked zone row:', row)
  }

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [zonesResp, warehousesResp] = await Promise.all([
          fetch('/api/zones', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/warehouses', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
        ])

        if (!zonesResp.ok) {
          throw new Error('Failed to load zones.')
        }

        if (!warehousesResp.ok) {
          throw new Error('Failed to load warehouses.')
        }

        const zonesPayload = (await zonesResp.json()) as ApiPayload<ZoneApiRecord[]>
        const warehousesPayload = (await warehousesResp.json()) as ApiPayload<Warehouse[]>

        if (!isMounted) {
          return
        }

        const warehouseOptions = Array.isArray(warehousesPayload.data)
          ? warehousesPayload.data.map((warehouse) => ({ label: warehouse.name, value: warehouse.id }))
          : []

        const warehouseNameMap = new Map(warehouseOptions.map((warehouse) => [warehouse.value, warehouse.label]))

        setZones(
          Array.isArray(zonesPayload.data)
            ? zonesPayload.data.map((zone) => ({
              ...zone,
              warehouseName: warehouseNameMap.get(zone.warehouseId) ?? zone.warehouseId
            }))
            : []
        )

        setWarehouseList(warehouseOptions)
        setError(null)
      } catch (err) {
        if (!isMounted) {
          return
        }

        console.error(err)
        setError('Unable to load zones and warehouses.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>

      <PageWithGrid
        title='Zones'
        headerActions={<CreateZoneForm warehouseList={warehouseList} />}
        isLoading={isLoading}
        error={error}
        tableData={{ columns: zoneTableColumns, records: zones }}
        onRowClick={handleRowClick}
      />
    </>
  )
}
