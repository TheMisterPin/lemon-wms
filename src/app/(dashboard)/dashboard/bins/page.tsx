'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import CreateBinForm from '@/app/(dashboard)/dashboard/bins/components/create-bin-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { binTableColumns, type BinTableRow } from '@/lib/components/configs/entities/bin/config'
import type { Warehouse } from '@/lib/components/configs/entities/warehouse/types'
import type { Zone } from '@/lib/components/configs/entities/zone/types'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type BinApiRecord = {
  id: string
  zoneId: string
  warehouseId: string
  name: string
  code: string
  type: string
  isBlocked: boolean
  createdAt: string
  deletedAt: string | null
}

type ApiPayload<T> = {
  success: boolean
  data: T
}

export default function BinsHomePage() {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center py-24 text-sm text-brand-muted'>
          Loading bins…
        </div>
      }
    >
      <BinsContent />
    </Suspense>
  )
}

function BinsContent() {
  const searchParams = useSearchParams()
  const warehouseIdFilter = searchParams.get('warehouseId')

  const [bins, setBins] = useState<BinTableRow[]>([])
  const [zoneList, setZoneList] = useState<SelectOption[]>([])
  const [warehouseList, setWarehouseList] = useState<SelectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function handleRowClick(row: BinTableRow) {
    // eslint-disable-next-line no-console
    console.log('Clicked bin row:', row)
  }

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const queryString = warehouseIdFilter
          ? `?warehouseId=${encodeURIComponent(warehouseIdFilter)}`
          : ''

        const [binsResp, zonesResp, warehousesResp] = await Promise.all([
          fetch(`/api/bins${queryString}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch(`/api/zones${queryString}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }),
          fetch('/api/warehouses', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          })
        ])

        if (!binsResp.ok) {
          throw new Error('Failed to load bins.')
        }

        if (!zonesResp.ok) {
          throw new Error('Failed to load zones.')
        }

        if (!warehousesResp.ok) {
          throw new Error('Failed to load warehouses.')
        }

        const binsPayload = (await binsResp.json()) as ApiPayload<BinApiRecord[]>
        const zonesPayload = (await zonesResp.json()) as ApiPayload<Zone[]>
        const warehousesPayload = (await warehousesResp.json()) as ApiPayload<Warehouse[]>

        if (!isMounted) {
          return
        }

        const warehouses = Array.isArray(warehousesPayload.data)
          ? warehousesPayload.data
          : []
        const filteredWarehouses = warehouseIdFilter
          ? warehouses.filter((warehouse) => warehouse.id === warehouseIdFilter)
          : warehouses

        const warehouseOptions = filteredWarehouses.map((warehouse) => ({
          label: warehouse.name,
          value: warehouse.id
        }))

        const zones = Array.isArray(zonesPayload.data)
          ? zonesPayload.data
          : []
        const zoneOptions = zones.map((zone) => ({ label: zone.name, value: zone.id }))

        const warehouseNameMap = new Map(warehouseOptions.map((warehouse) => [warehouse.value, warehouse.label]))
        const zoneNameMap = new Map(zoneOptions.map((zone) => [zone.value, zone.label]))

        setBins(
          Array.isArray(binsPayload.data)
            ? binsPayload.data.map((bin) => ({
              ...bin,
              zoneName: zoneNameMap.get(bin.zoneId) ?? bin.zoneId,
              warehouseName: warehouseNameMap.get(bin.warehouseId) ?? bin.warehouseId
            }))
            : []
        )

        setZoneList(zoneOptions)
        setWarehouseList(warehouseOptions)
        setError(null)
      } catch (err) {
        if (!isMounted) {
          return
        }

        console.error(err)
        setError('Unable to load bins, zones, and warehouses.')
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
  }, [warehouseIdFilter])

  return (
    <PageWithGrid
      title='Bins'
      headerActions={<CreateBinForm zonesList={zoneList} warehouseList={warehouseList} />}
      isLoading={isLoading}
      error={error}
      tableData={{ columns: binTableColumns, records: bins }}
      onRowClick={handleRowClick}
    />
  )
}
