'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/home/use-dashboard-home.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, Map as MapIcon, Package } from 'lucide-react'
import type { DashboardInfoCardItem } from '@/components/dashboard/primitives/dashboard-info-card'
import type { DashboardOverviewCard, DashboardWarehouseDisplayRecord, DashboardZoneDisplayRecord, DashboardBinDisplayRecord } from '@/components/features/locations/warehouses/components/dashboard-types'
import { dashboardApiClient } from '@/lib/axios'
import { DEFAULT_GENERIC_TABLE_PAGE_SIZE } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'

const PAGE_SIZE = 3

export type DashboardBinRecord = DashboardBinDisplayRecord

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

export type DashboardPagedList<T> = {
  records: T[]
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export type DashboardSearchModel = {
  text: string
  setText: (text: string) => void
}

export type UseDashboardHomeReturn = {
  isLoading: boolean
  error: string | null
  refetch: () => void
  overviewCards: DashboardOverviewCard[]
  infoCards: DashboardInfoCardItem[]
  warehouses: DashboardPagedList<DashboardWarehouseDisplayRecord> & {
    selectedId: string | null
    onSelect: (id: string) => void
    matchCount: number
  }
  zones: DashboardPagedList<DashboardZoneDisplayRecord> & {
    selectedId: string | null
    onSelect: (id: string) => void
    matchCount: number
  }
  bins: {
    records: DashboardBinDisplayRecord[]
    pageSize: number
  }
  search: DashboardSearchModel
}

type DashboardHomeFetchResult =
  | { ok: true; data: DashboardHomePageData }
  | { ok: false; error: string }

async function fetchDashboardHomePageData(): Promise<DashboardHomeFetchResult> {
  try {
    const response =
      await dashboardApiClient.get<ApiResponse<DashboardHomePageData>>('/dashboard/home')

    if (response.success && response.data) {
      return { ok: true, data: response.data }
    }

    return { ok: false, error: 'Could not load dashboard data.' }
  } catch (fetchError) {
    console.error('[useDashboardHome] Failed to fetch:', fetchError)

    return { ok: false, error: 'Could not load dashboard data. Please try again.' }
  }
}

function paginate<T>(items: T[], page: number): T[] {
  return items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
}

function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE))
}

function toOverviewCards(info: DashboardHomePageData['info']): DashboardOverviewCard[] {
  return [
    { label: 'Warehouses', value: info.warehouses ?? 0 },
    { label: 'Zones', value: info.zones ?? 0 },
    { label: 'Bins', value: info.bins ?? 0 }
  ]
}

function toWarehouseDisplayRecords(
  records: DashboardHomePageData['warehouses']
): DashboardWarehouseDisplayRecord[] {
  return records.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.name,
    title: warehouse.name,
    subtitle: `${warehouse.id} · ${warehouse.zones} zones`,
    metric: `${warehouse.bins} bins`
  }))
}

function toZoneDisplayRecords(
  records: DashboardHomePageData['zones']
): DashboardZoneDisplayRecord[] {
  return records.map((zone) => ({
    id: zone.id,
    name: zone.name,
    title: zone.name,
    subtitle: `${zone.id} · ${zone.type}`,
    metric: `${zone.bins} bins`
  }))
}

function toInfoCards(info: DashboardHomePageData['info']): DashboardInfoCardItem[] {
  return [
    { label: 'Warehouses', value: info.warehouses ?? 0, icon: Building2 },
    { label: 'Zones', value: info.zones ?? 0, icon: MapIcon },
    { label: 'Bins', value: info.bins ?? 0, icon: Package }
  ]
}

function toBinDisplayRecords(
  records: DashboardHomePageData['bins']
): DashboardBinDisplayRecord[] {
  return records.map((bin) => ({
    id: bin.id,
    name: bin.name,
    type: bin.type,
    itemsInBin: bin.itemsInBin,
    filledPercentage: bin.filledPercentage ?? 0,
    active: bin.active,
    isBlocked: bin.isBlocked
  }))
}

export function useDashboardHome(): UseDashboardHomeReturn {
  const [data, setData] = useState<DashboardHomePageData>({
    info: { warehouses: 0, zones: 0, bins: 0 },
    warehouses: [],
    zones: [],
    bins: []
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [warehousePage, setWarehousePage] = useState(0)
  const [zonePage, setZonePage] = useState(0)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  const refetch = useCallback(() => {
    void (async () => {
      setIsLoading(true)
      setError(null)
      const result = await fetchDashboardHomePageData()
      if (result.ok) {
        setData(result.data)
      } else {
        setError(result.error)
      }
      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      setIsLoading(true)
      setError(null)
      const result = await fetchDashboardHomePageData()
      if (cancelled) {
        return
      }
      if (result.ok) {
        setData(result.data)
      } else {
        setError(result.error)
      }
      setIsLoading(false)
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  const setSearchTextWithPageReset = useCallback((text: string) => {
    setSearchText(text)
    setWarehousePage(0)
    setZonePage(0)
  }, [])

  const zonesById = useMemo(
    () => new Map(data.zones.map((zone) => [zone.id, zone])),
    [data.zones]
  )

  const normalizedSearch = searchText.trim().toLowerCase()

  const filteredWarehouses = useMemo(() => {
    const list = selectedZoneId
      ? data.warehouses.filter(
        (warehouse) => warehouse.id === zonesById.get(selectedZoneId)?.warehouseId
      )
      : selectedWarehouseId
        ? data.warehouses.filter((warehouse) => warehouse.id === selectedWarehouseId)
        : data.warehouses

    if (!normalizedSearch) {
      return list
    }

    return list.filter((warehouse) => {
      const haystack = `${warehouse.id} ${warehouse.name} ${warehouse.zones} ${warehouse.bins}`.toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [data.warehouses, normalizedSearch, selectedWarehouseId, selectedZoneId, zonesById])

  const filteredZones = useMemo(() => {
    const list = selectedZoneId
      ? data.zones.filter((zone) => zone.id === selectedZoneId)
      : selectedWarehouseId
        ? data.zones.filter((zone) => zone.warehouseId === selectedWarehouseId)
        : data.zones

    if (!normalizedSearch) {
      return list
    }

    return list.filter((zone) => {
      const haystack = `${zone.id} ${zone.name} ${zone.type} ${zone.bins}`.toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [data.zones, normalizedSearch, selectedWarehouseId, selectedZoneId])

  const filteredBins = useMemo(() => {
    let list = data.bins

    if (selectedZoneId) {
      list = list.filter((bin) => bin.zoneId === selectedZoneId)
    } else if (selectedWarehouseId) {
      list = list.filter((bin) => bin.warehouseId === selectedWarehouseId)
    }

    if (!normalizedSearch) {
      return list
    }

    return list.filter((bin) => {
      const haystack = `${bin.id} ${bin.name} ${bin.type}`.toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [data.bins, normalizedSearch, selectedWarehouseId, selectedZoneId])

  const warehousePages = totalPages(filteredWarehouses.length)
  const zonePages = totalPages(filteredZones.length)

  const safeWarehousePage = Math.min(Math.max(0, warehousePage), warehousePages - 1)
  const safeZonePage = Math.min(Math.max(0, zonePage), zonePages - 1)

  const pagedWarehouses = useMemo(
    () => toWarehouseDisplayRecords(paginate(filteredWarehouses, safeWarehousePage)),
    [filteredWarehouses, safeWarehousePage]
  )

  const pagedZones = useMemo(
    () => toZoneDisplayRecords(paginate(filteredZones, safeZonePage)),
    [filteredZones, safeZonePage]
  )

  const displayBins = useMemo(
    () => toBinDisplayRecords(filteredBins),
    [filteredBins]
  )

  const toggleWarehouse = useCallback((warehouseId: string) => {
    if (selectedWarehouseId === warehouseId) {
      setSelectedWarehouseId(null)
      setSelectedZoneId(null)

      return
    }

    setSelectedWarehouseId(warehouseId)
    setSelectedZoneId(null)
  }, [selectedWarehouseId])

  const toggleZone = useCallback((zoneId: string) => {
    if (selectedZoneId === zoneId) {
      setSelectedZoneId(null)
      setSelectedWarehouseId(null)

      return
    }

    const zone = zonesById.get(zoneId)
    setSelectedZoneId(zoneId)
    setSelectedWarehouseId(zone?.warehouseId ?? null)
  }, [selectedZoneId, zonesById])

  return {
    isLoading,
    error,
    refetch,
    overviewCards: toOverviewCards(data.info),
    infoCards: toInfoCards(data.info),
    warehouses: {
      records: pagedWarehouses,
      page: safeWarehousePage,
      totalPages: warehousePages,
      onPrev: () => setWarehousePage((p) => Math.max(0, p - 1)),
      onNext: () => setWarehousePage((p) => Math.min(warehousePages - 1, p + 1)),
      selectedId: selectedWarehouseId,
      onSelect: toggleWarehouse,
      matchCount: filteredWarehouses.length
    },
    zones: {
      records: pagedZones,
      page: safeZonePage,
      totalPages: zonePages,
      onPrev: () => setZonePage((p) => Math.max(0, p - 1)),
      onNext: () => setZonePage((p) => Math.min(zonePages - 1, p + 1)),
      selectedId: selectedZoneId,
      onSelect: toggleZone,
      matchCount: filteredZones.length
    },
    bins: {
      records: displayBins,
      pageSize: DEFAULT_GENERIC_TABLE_PAGE_SIZE
    },
    search: {
      text: searchText,
      setText: setSearchTextWithPageReset
    }
  }
}
