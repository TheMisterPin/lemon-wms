'use client'

import { useEffect, useMemo, useState } from 'react'

import { MapPin, ShelvingUnit, Warehouse } from 'lucide-react'

import type { DashboardInfoCardItem } from '@/components/dashboard/DashboardInfoCards'
import type { DashboardRecordListItem } from '@/components/dashboard/DashboardRecordListSection'
import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'

const PAGE_SIZE = 3

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
export type DashboardBinRecord = DashboardHomePageData['bins'][number]

function toWarehouseRecords(records: DashboardWarehouseRecord[]): DashboardRecordListItem[] {
  return records.map((w) => ({
    id: w.id,
    title: w.name,
    subtitle: `${w.zones} zones, ${w.bins} bins`
  }))
}

function toZoneRecords(records: DashboardZoneRecord[]): DashboardRecordListItem[] {
  return records.map((z) => ({
    id: z.id,
    title: z.name,
    subtitle: `${z.type}, ${z.bins} bins`
  }))
}

function toInfoCards(info: DashboardHomePageData['info']): DashboardInfoCardItem[] {
  return [
    { label: 'Warehouses', value: info.warehouses ?? 0, icon: Warehouse },
    { label: 'Zones', value: info.zones ?? 0, icon: MapPin },
    { label: 'Bins', value: info.bins ?? 0, icon: ShelvingUnit }
  ]
}

function paginate<T>(items: T[], page: number): T[] {
  return items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
}

function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE))
}

export function useDashboardHome() {
  const [data, setData] = useState<DashboardHomePageData>({
    info: { warehouses: 0, zones: 0, bins: 0 },
    warehouses: [],
    zones: [],
    bins: []
  })

  const [warehousePage, setWarehousePage] = useState(0)
  const [zonePage, setZonePage] = useState(0)
  const [binPage, setBinPage] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const response = await dashboardApiClient.get<ApiResponse<DashboardHomePageData>>('/dashboard/home')
        if (!cancelled && response.success && response.data) {
          setData(response.data)
        }
      } catch (error) {
        console.error('[useDashboardHome] Failed to fetch:', error)
      }
    }

    void fetchData()
    return () => { cancelled = true }
  }, [])

  const infoCards = useMemo(() => toInfoCards(data.info), [data.info])

  const warehousePages = totalPages(data.warehouses.length)
  const zonePages = totalPages(data.zones.length)
  const binPages = totalPages(data.bins.length)

  const pagedWarehouses = useMemo(
    () => toWarehouseRecords(paginate(data.warehouses, warehousePage)),
    [data.warehouses, warehousePage]
  )
  const pagedZones = useMemo(
    () => toZoneRecords(paginate(data.zones, zonePage)),
    [data.zones, zonePage]
  )
  const pagedBins = useMemo(
    () => paginate(data.bins, binPage),
    [data.bins, binPage]
  )

  return {
    infoCards,
    warehouses: {
      records: pagedWarehouses,
      page: warehousePage,
      totalPages: warehousePages,
      onPrev: () => setWarehousePage((p) => Math.max(0, p - 1)),
      onNext: () => setWarehousePage((p) => Math.min(warehousePages - 1, p + 1))
    },
    zones: {
      records: pagedZones,
      page: zonePage,
      totalPages: zonePages,
      onPrev: () => setZonePage((p) => Math.max(0, p - 1)),
      onNext: () => setZonePage((p) => Math.min(zonePages - 1, p + 1))
    },
    bins: {
      records: pagedBins,
      page: binPage,
      totalPages: binPages,
      onPrev: () => setBinPage((p) => Math.max(0, p - 1)),
      onNext: () => setBinPage((p) => Math.min(binPages - 1, p + 1))
    }
  }
}
