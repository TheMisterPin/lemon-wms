'use client'

import { useEffect, useMemo, useState } from 'react'

import { MapPin, ShelvingUnit, Warehouse } from 'lucide-react'

import type { DashboardInfoCardItem } from '@/components/dashboard/dashboard-info-card'
import type { DashboardRecordListItem } from '@/components/dashboard/dashboard-record-list-section'
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
    warehouseId: string
    zoneId: string
    name: string
    code: string
    isBlocked: boolean
    blockReason: string | null
    active: boolean
    maxCapacity: number | null
    currentCapacity: number | null
    filledPercentage: number | null
    itemsInBin: number
    type: string
    createdAt: string
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
    subtitle: `${z.type}, ${z.bins} bins`,
    details: z.warehouseId
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
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [warehouseSearch, setWarehouseSearch] = useState('')
  const [zoneSearch, setZoneSearch] = useState('')

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

    return () => {
      cancelled = true
    }
  }, [])

  const infoCards = useMemo(() => toInfoCards(data.info), [data.info])

  const zonesById = useMemo(
    () => new Map(data.zones.map((zone) => [zone.id, zone])),
    [data.zones]
  )

  const normalizedWarehouseSearch = warehouseSearch.trim().toLowerCase()
  const normalizedZoneSearch = zoneSearch.trim().toLowerCase()

  const filteredWarehouses = useMemo(() => {
    const list = selectedZoneId
      ? data.warehouses.filter((warehouse) => warehouse.id === zonesById.get(selectedZoneId)?.warehouseId)
      : selectedWarehouseId
        ? data.warehouses.filter((warehouse) => warehouse.id === selectedWarehouseId)
        : data.warehouses

    if (!normalizedWarehouseSearch) {
      return list
    }

    return list.filter((warehouse) => {
      const haystack = `${warehouse.name} ${warehouse.zones} ${warehouse.bins}`.toLowerCase()

      return haystack.includes(normalizedWarehouseSearch)
    })
  }, [data.warehouses, normalizedWarehouseSearch, selectedWarehouseId, selectedZoneId, zonesById])

  const filteredZones = useMemo(() => {
    const list = selectedZoneId
      ? data.zones.filter((zone) => zone.id === selectedZoneId)
      : selectedWarehouseId
        ? data.zones.filter((zone) => zone.warehouseId === selectedWarehouseId)
        : data.zones

    if (!normalizedZoneSearch) {
      return list
    }

    return list.filter((zone) => {
      const haystack = `${zone.name} ${zone.type} ${zone.bins}`.toLowerCase()

      return haystack.includes(normalizedZoneSearch)
    })
  }, [data.zones, normalizedZoneSearch, selectedWarehouseId, selectedZoneId])

  const filteredBins = useMemo(() => {
    if (selectedZoneId) {
      return data.bins.filter((bin) => bin.zoneId === selectedZoneId)
    }

    if (selectedWarehouseId) {
      return data.bins.filter((bin) => bin.warehouseId === selectedWarehouseId)
    }

    return data.bins
  }, [data.bins, selectedWarehouseId, selectedZoneId])

  const warehousePages = totalPages(filteredWarehouses.length)
  const zonePages = totalPages(filteredZones.length)
  const binPages = totalPages(filteredBins.length)

  const safeWarehousePage = Math.min(Math.max(0, warehousePage), warehousePages - 1)
  const safeZonePage = Math.min(Math.max(0, zonePage), zonePages - 1)
  const safeBinPage = Math.min(Math.max(0, binPage), binPages - 1)

  const pagedWarehouses = useMemo(
    () => toWarehouseRecords(paginate(filteredWarehouses, safeWarehousePage)),
    [filteredWarehouses, safeWarehousePage]
  )
  const pagedZones = useMemo(
    () => toZoneRecords(paginate(filteredZones, safeZonePage)),
    [filteredZones, safeZonePage]
  )
  const pagedBins = useMemo(
    () => paginate(filteredBins, safeBinPage),
    [filteredBins, safeBinPage]
  )

  const toggleWarehouse = (warehouseId: string) => {
    if (selectedWarehouseId === warehouseId) {
      setSelectedWarehouseId(null)
      setSelectedZoneId(null)

      return
    }

    setSelectedWarehouseId(warehouseId)
    setSelectedZoneId(null)
  }

  const toggleZone = (zoneId: string) => {
    if (selectedZoneId === zoneId) {
      setSelectedZoneId(null)
      setSelectedWarehouseId(null)

      return
    }

    const zone = zonesById.get(zoneId)
    setSelectedZoneId(zoneId)
    setSelectedWarehouseId(zone?.warehouseId ?? null)
  }

  return {
    infoCards,
    warehouses: {
      records: pagedWarehouses,
      page: safeWarehousePage,
      totalPages: warehousePages,
      onPrev: () =>
        setWarehousePage((p) => {
          const max = warehousePages - 1
          const current = Math.min(Math.max(0, p), max)

          return Math.max(0, current - 1)
        }),
      onNext: () =>
        setWarehousePage((p) => {
          const max = warehousePages - 1
          const current = Math.min(Math.max(0, p), max)

          return Math.min(max, current + 1)
        }),
      selectedId: selectedWarehouseId,
      onSelect: toggleWarehouse,
      search: warehouseSearch,
      onSearch: setWarehouseSearch
    },
    zones: {
      records: pagedZones,
      page: safeZonePage,
      totalPages: zonePages,
      onPrev: () =>
        setZonePage((p) => {
          const max = zonePages - 1
          const current = Math.min(Math.max(0, p), max)

          return Math.max(0, current - 1)
        }),
      onNext: () =>
        setZonePage((p) => {
          const max = zonePages - 1
          const current = Math.min(Math.max(0, p), max)

          return Math.min(max, current + 1)
        }),
      selectedId: selectedZoneId,
      onSelect: toggleZone,
      search: zoneSearch,
      onSearch: setZoneSearch
    },
    bins: {
      records: pagedBins,
      page: safeBinPage,
      totalPages: binPages,
      onPrev: () =>
        setBinPage((p) => {
          const max = binPages - 1
          const current = Math.min(Math.max(0, p), max)

          return Math.max(0, current - 1)
        }),
      onNext: () =>
        setBinPage((p) => {
          const max = binPages - 1
          const current = Math.min(Math.max(0, p), max)

          return Math.min(max, current + 1)
        })
    }
  }
}
