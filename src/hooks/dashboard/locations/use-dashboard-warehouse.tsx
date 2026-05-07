'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/dashboard/warehouses/use-dashboard-warehouse.md
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'

import type { BinTableRow } from '@/components/configs/entities/bin/config'
import type { ZoneTableRow } from '@/components/configs/entities/zone/config'
import { useErrorDialog } from '@/components/shared/use-error-dialog'
import { extractMutationError } from '@/lib/api/extract-mutation-error'
import { dashboardApiClient } from '@/lib/axios'
import type { BinFormValues, Warehouse, WarehouseFormValues, ZoneFormValues } from '@/lib/locations'
import {
  mapWireBinsToBinApiRecords,
  mapWireWarehousesToDomainWarehouses,
  mapWireZonesToZoneApiRecords
} from '@/lib/transformers/locations/dashboard-home'
import type {
  ApiPayload,
  BinApiRecord,
  DashboardHomePayload,
  ZoneApiRecord
} from '@/types/api/locations/dashboard-home'
import type { SelectOption } from '@/types/components/form/generic-form.types'

interface DashboardWarehouseContextValue {
  warehouses: Warehouse[]
  zones: ZoneTableRow[]
  bins: BinTableRow[]
  warehouseOptions: SelectOption[]
  zoneOptions: SelectOption[]
  warehouseIdFilter: string | null
  isLoading: boolean
  error: string | null
  createWarehouse: (values: Pick<WarehouseFormValues, 'name'>) => Promise<void>
  createZone: (values: ZoneFormValues) => Promise<void>
  createBin: (values: BinFormValues) => Promise<void>
  refresh: () => void
  actions: {
    createWarehouse: (values: Pick<WarehouseFormValues, 'name'>) => Promise<void>
    createZone: (values: ZoneFormValues) => Promise<void>
    createBin: (values: BinFormValues) => Promise<void>
    refresh: () => void
  }
}

const DashboardWarehouseContext = createContext<DashboardWarehouseContextValue | null>(null)

export function DashboardWarehouseProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const warehouseIdFilter = searchParams.get('warehouseId')

  const [rawWarehouses, setRawWarehouses] = useState<Warehouse[]>([])
  const [rawZones, setRawZones] = useState<ZoneApiRecord[]>([])
  const [rawBins, setRawBins] = useState<BinApiRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { reportError } = useErrorDialog()

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        const homePayload = await dashboardApiClient.get<ApiPayload<DashboardHomePayload>>('/dashboard/home')

        if (!isMounted) {
          return
        }

        const payload = homePayload.data
        const warehouses = Array.isArray(payload.warehouses)
          ? payload.warehouses
          : []
        const zones = Array.isArray(payload.zones)
          ? payload.zones
          : []
        const bins = Array.isArray(payload.bins)
          ? payload.bins
          : []

        setRawWarehouses(mapWireWarehousesToDomainWarehouses(warehouses))

        const mappedZones = mapWireZonesToZoneApiRecords(zones)

        const mappedBins = mapWireBinsToBinApiRecords(bins)

        setRawZones(
          warehouseIdFilter
            ? mappedZones.filter((zone) => zone.warehouseId === warehouseIdFilter)
            : mappedZones
        )

        setRawBins(
          warehouseIdFilter
            ? mappedBins.filter((bin) => bin.warehouseId === warehouseIdFilter)
            : mappedBins
        )
      } catch {
        if (!isMounted) {
          return
        }

        setError('Unable to load warehouse data.')
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
  }, [warehouseIdFilter, refreshKey])

  const warehouseOptions = useMemo<SelectOption[]>(() => {
    const list = warehouseIdFilter
      ? rawWarehouses.filter((w) => w.id === warehouseIdFilter)
      : rawWarehouses

    return list.map((w) => ({ label: w.name, value: w.id }))
  }, [rawWarehouses, warehouseIdFilter])

  const warehouseNameMap = useMemo(
    () => new Map(rawWarehouses.map((w) => [w.id, w.name])),
    [rawWarehouses]
  )

  const zoneOptions = useMemo<SelectOption[]>(
    () => rawZones.map((z) => ({ label: z.name, value: z.id })),
    [rawZones]
  )

  const zoneNameMap = useMemo(
    () => new Map(rawZones.map((z) => [z.id, z.name])),
    [rawZones]
  )

  const zones = useMemo<ZoneTableRow[]>(
    () => rawZones.map((z) => ({
      ...z,
      warehouseName: warehouseNameMap.get(z.warehouseId) ?? z.warehouseId
    })),
    [rawZones, warehouseNameMap]
  )

  const bins = useMemo<BinTableRow[]>(
    () => rawBins.map((b) => ({
      ...b,
      zoneName: zoneNameMap.get(b.zoneId) ?? b.zoneId,
      warehouseName: warehouseNameMap.get(b.warehouseId) ?? b.warehouseId
    })),
    [rawBins, zoneNameMap, warehouseNameMap]
  )

  const createWarehouse = useCallback(
    async (values: Pick<WarehouseFormValues, 'name'>) => {
      try {
        await dashboardApiClient.post('/dashboard/warehouses', values)
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to create warehouse',
          source: 'dashboard/warehouses/create',
          code: parsed.code,
          details: parsed.details
        })
        throw new Error(parsed.message)
      }
    },
    [refresh, reportError]
  )

  const createZone = useCallback(
    async (values: ZoneFormValues) => {
      try {
        await dashboardApiClient.post('/dashboard/zones', values)
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to create zone',
          source: 'dashboard/zones/create',
          code: parsed.code,
          details: parsed.details
        })
        throw new Error(parsed.message)
      }
    },
    [refresh, reportError]
  )

  const createBin = useCallback(
    async (values: BinFormValues) => {
      try {
        await dashboardApiClient.post('/dashboard/bins', values)
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        reportError(parsed.message, {
          title: 'Failed to create bin',
          source: 'dashboard/bins/create',
          code: parsed.code,
          details: parsed.details
        })
        throw new Error(parsed.message)
      }
    },
    [refresh, reportError]
  )

  const value = useMemo<DashboardWarehouseContextValue>(
    () => ({
      warehouses: rawWarehouses,
      zones,
      bins,
      warehouseOptions,
      zoneOptions,
      warehouseIdFilter,
      isLoading,
      error,
      createWarehouse,
      createZone,
      createBin,
      refresh,
      actions: {
        createWarehouse,
        createZone,
        createBin,
        refresh
      }
    }),
    [
      rawWarehouses,
      zones,
      bins,
      warehouseOptions,
      zoneOptions,
      warehouseIdFilter,
      isLoading,
      error,
      createWarehouse,
      createZone,
      createBin,
      refresh
    ]
  )

  return (
    <DashboardWarehouseContext.Provider value={value}>
      {children}
    </DashboardWarehouseContext.Provider>
  )
}

export function useDashboardWarehouse() {
  const context = useContext(DashboardWarehouseContext)

  if (!context) {
    throw new Error(
      'useDashboardWarehouse must be used within DashboardWarehouseProvider'
    )
  }

  return context
}
