'use client'

import { useEffect, useState } from 'react'

import { MapPin, ShelvingUnit, Warehouse } from 'lucide-react'
import { DashboardInfoCards, type DashboardInfoCardItem } from '@/components/dashboard/DashboardInfoCards'
import {
  DashboardRecordListSection,
  type DashboardRecordListItem
} from '@/components/dashboard/DashboardRecordListSection'
import { GenericTable } from '@/components/tables/generic-table'
import { Card } from '@/components/ui/card'
import { apiClient } from '@/lib/axios'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'

interface DashboardHomePageData {
  info: {
    warehouses: number
    zones: number
    bins: number
  }
  warehouses: {
    id: string
    name: string
    zones: number
    bins: number
  }[]
  zones: {
    id: string
    warehouseId: string
    name: string
    type: string
    isActive: boolean
    bins: number
  }[]
  bins: {
    id: string
    zoneId: string
    name: string
    isBlocked: boolean
    blockReason: string | null
    active: boolean
    maxCapacity: number
    type: string
    currentCapacity: number
  }[]
}

type DashboardWarehouseRecord = DashboardHomePageData['warehouses'][number]
type DashboardZoneRecord = DashboardHomePageData['zones'][number]
type DashboardBinRecord = DashboardHomePageData['bins'][number]

const PAGE_SIZE = 3

const binColumns: TableColumnConfig<DashboardBinRecord>[] = [
  { label: 'Name', accessor: 'name' },
  { label: 'Type', accessor: 'type' },
  { label: 'Status', accessor: 'active', type: 'boolean' },
  {
    label: 'Progress',
    type: 'progress',
    progressBarRef: {
      max: 'maxCapacity',
      current: 'currentCapacity'
    }
  }
]

function createWarehouseRecords(records: DashboardWarehouseRecord[]): DashboardRecordListItem[] {
  return records.map((warehouse) => ({
    id: warehouse.id,
    title: warehouse.name,
    subtitle: `${warehouse.zones} zones, ${warehouse.bins} bins`
  }))
}

function createZoneRecords(records: DashboardZoneRecord[]): DashboardRecordListItem[] {
  return records.map((zone) => ({
    id: zone.id,
    title: zone.name,
    subtitle: `${zone.type}, ${zone.bins} bins`
  }))
}

function createInfoCards(data: DashboardHomePageData['info']): DashboardInfoCardItem[] {
  return [
    { label: 'Warehouses', value: data.warehouses ?? 0, icon: Warehouse },
    { label: 'Zones', value: data.zones ?? 0, icon: MapPin },
    { label: 'Bins', value: data.bins ?? 0, icon: ShelvingUnit }
  ]
}

export default function DashboardHomePage() {
  const [dashboardData, setDashboardData] = useState<DashboardHomePageData>({
    info: {
      warehouses: 0,
      zones: 0,
      bins: 0
    },
    warehouses: [],
    zones: [],
    bins: []
  })

  const [warehousePage, setWarehousePage] = useState(0)
  const [zonePage, setZonePage] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await apiClient.get<ApiResponse<DashboardHomePageData>>('/dashboard/warehouse')

        if (response.success && response.data) {
          setDashboardData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    void fetchData()
  }, [])

  const warehouses = dashboardData.warehouses
  const zones = dashboardData.zones
  const bins = dashboardData.bins

  const warehouseTotalPages = Math.max(1, Math.ceil(warehouses.length / PAGE_SIZE))
  const zoneTotalPages = Math.max(1, Math.ceil(zones.length / PAGE_SIZE))

  const pagedWarehouses = warehouses.slice(warehousePage * PAGE_SIZE, (warehousePage + 1) * PAGE_SIZE)
  const pagedZones = zones.slice(zonePage * PAGE_SIZE, (zonePage + 1) * PAGE_SIZE)
  const infoCards = createInfoCards(dashboardData.info)
  const warehouseRecords = createWarehouseRecords(pagedWarehouses)
  const zoneRecords = createZoneRecords(pagedZones)

  return (
    <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
      <Card className=" glass flex-1 overflow-y-auto py-12 px-16">
        <h1 className="text-2xl font-semibold">Warehouse Dashboard</h1>

        <DashboardInfoCards cards={infoCards} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <DashboardRecordListSection
            title="Warehouses"
            icon={Warehouse}
            records={warehouseRecords}
            page={warehousePage}
            totalPages={warehouseTotalPages}
            onPrev={() => setWarehousePage((page) => Math.max(0, page - 1))}
            onNext={() => setWarehousePage((page) => Math.min(warehouseTotalPages - 1, page + 1))}
            paginationPosition="footer"
          />
          <DashboardRecordListSection
            title="Zones"
            icon={MapPin}
            records={zoneRecords}
            page={zonePage}
            totalPages={zoneTotalPages}
            onPrev={() => setZonePage((page) => Math.max(0, page - 1))}
            onNext={() => setZonePage((page) => Math.min(zoneTotalPages - 1, page + 1))}
          />
        </div>

        <div className="gap-4 rounded-lg bg-brand-glass/75 border border-slate-500 pb-12">
          {/* Bins table */}
          <h2 className="text-xl font-semibold mt-8 px-4 ">Bins</h2>
          <GenericTable
            columns={binColumns}
            records={bins!}
          />
        </div>
      </Card>
    </main>
  )
}
