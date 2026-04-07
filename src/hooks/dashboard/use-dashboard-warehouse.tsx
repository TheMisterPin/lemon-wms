'use client'

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
import { AxiosError } from 'axios'

import { dashboardApiClient } from '@/lib/axios'
import type { BinTableRow } from '@/components/configs/entities/bin/config'
import type { BinFormValues } from '@/lib/schemas/bin'
import type { Warehouse } from '@/lib/schemas/warehouse'
import type { WarehouseFormValues } from '@/lib/schemas/warehouse'
import type { ZoneTableRow } from '@/components/configs/entities/zone/config'
import type { ZoneFormValues } from '@/lib/schemas/zone'
import type { SelectOption } from '@/types/components/form/generic-form.types'
import type { ApiResponse } from '@/types/responses/basic-response'
import { MutationError } from '@/types'

// ── API response shapes ──────────────────────────────────────────────

type ApiPayload<T> = { success: boolean; data: T }

type WarehouseApiRecord = Omit<Warehouse, 'createdAt' | 'deletedAt'> & {
  createdAt: string
  deletedAt: string | null
}

type ZoneApiRecord = {
  id: string
  warehouseId: string
  name: string
  type: string
  isActive: boolean
  createdAt: string
  deletedAt: string | null
}

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

// ── Context value ────────────────────────────────────────────────────

interface DashboardWarehouseContextValue {
  // Data
  warehouses: Warehouse[]
  zones: ZoneTableRow[]
  bins: BinTableRow[]

  // Select options (for forms)
  warehouseOptions: SelectOption[]
  zoneOptions: SelectOption[]

  // Filter
  warehouseIdFilter: string | null

  // Loading / error
  isLoading: boolean
  error: string | null

  // Mutation error (for ErrorModal)
  mutationError: MutationError | null
  clearMutationError: () => void

  // Mutations
  createWarehouse: (values: Pick<WarehouseFormValues, 'name'>) => Promise<void>
  createZone: (values: ZoneFormValues) => Promise<void>
  createBin: (values: BinFormValues) => Promise<void>

  // Refresh
  refresh: () => void
}

const DashboardWarehouseContext = createContext<DashboardWarehouseContextValue | null>(null)

// ── Helpers ──────────────────────────────────────────────────────────

function extractMutationError(err: unknown): MutationError {
  if (err instanceof AxiosError && err.response?.data) {
    const body = err.response.data as ApiResponse<null>

    return {
      message: body.message ?? 'An unexpected error occurred.',
      code: body.error?.code,
      details: body.error?.details
    }
  }

  if (err instanceof Error) {
    return { message: err.message }
  }

  return { message: 'An unexpected error occurred.' }
}

// ── Provider ─────────────────────────────────────────────────────────

export function DashboardWarehouseProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const warehouseIdFilter = searchParams.get('warehouseId')

  const [rawWarehouses, setRawWarehouses] = useState<Warehouse[]>([])
  const [rawZones, setRawZones] = useState<ZoneApiRecord[]>([])
  const [rawBins, setRawBins] = useState<BinApiRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [mutationError, setMutationError] = useState<MutationError | null>(null)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])
  const clearMutationError = useCallback(() => setMutationError(null), [])

  // ── Fetch all data ───────────────────────────────────────────────

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        const queryString = warehouseIdFilter
          ? `?warehouseId=${encodeURIComponent(warehouseIdFilter)}`
          : ''

        const [warehousesPayload, zonesPayload, binsPayload] = await Promise.all([
          dashboardApiClient.get<ApiPayload<WarehouseApiRecord[]>>('/dashboard/warehouses'),
          dashboardApiClient.get<ApiPayload<ZoneApiRecord[]>>(`/dashboard/zones${queryString}`),
          dashboardApiClient.get<ApiPayload<BinApiRecord[]>>(`/dashboard/bins${queryString}`)
        ])

        if (!isMounted) {
          return
        }

        const warehouses = Array.isArray(warehousesPayload.data)
          ? warehousesPayload.data
          : []

        setRawWarehouses(
          warehouses.map((w) => ({
            ...w,
            createdAt: new Date(w.createdAt),
            deletedAt: w.deletedAt ? new Date(w.deletedAt) : null
          }))
        )

        setRawZones(
          Array.isArray(zonesPayload.data) ? zonesPayload.data : []
        )

        setRawBins(
          Array.isArray(binsPayload.data) ? binsPayload.data : []
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

  // ── Derived / memoised values ────────────────────────────────────

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

  // ── Mutations ────────────────────────────────────────────────────

  const createWarehouse = useCallback(
    async (values: Pick<WarehouseFormValues, 'name'>) => {
      try {
        await dashboardApiClient.post('/dashboard/warehouses', values)
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        setMutationError(parsed)
        throw new Error(parsed.message)
      }
    },
    [refresh]
  )

  const createZone = useCallback(
    async (values: ZoneFormValues) => {
      try {
        await dashboardApiClient.post('/dashboard/zones', values)
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        setMutationError(parsed)
        throw new Error(parsed.message)
      }
    },
    [refresh]
  )

  const createBin = useCallback(
    async (values: BinFormValues) => {
      try {
        await dashboardApiClient.post('/dashboard/bins', values)
        refresh()
      } catch (err) {
        const parsed = extractMutationError(err)
        setMutationError(parsed)
        throw new Error(parsed.message)
      }
    },
    [refresh]
  )

  // ── Context value ────────────────────────────────────────────────

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
      mutationError,
      clearMutationError,
      createWarehouse,
      createZone,
      createBin,
      refresh
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
      mutationError,
      clearMutationError,
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

// ── Hook ─────────────────────────────────────────────────────────────

export function useDashboardWarehouse() {
  const context = useContext(DashboardWarehouseContext)

  if (!context) {
    throw new Error(
      'useDashboardWarehouse must be used within a DashboardWarehouseProvider'
    )
  }

  return context
}
