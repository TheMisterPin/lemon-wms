'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/warehouse/home/use-warehouse-home.md
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, Warehouse } from 'lucide-react'

import type { BinRecord } from '@/components/features/locations/warehouses/components/dashboard-types'
import type {
  DashboardInfoCardItem,
  DashboardRecordListItem,
  WarehouseHomeData,
  WarehouseOrderRecord
} from '@/components/warehouse/orders/types'
import { toWarehouseHomeBinGridRecords } from '@/components/warehouse/home/warehouse-home-bin-grid'
import { resolveLastUserOrder } from '@/components/warehouse/home/warehouse-home-order-helpers'
import { warehouseApiClient } from '@/lib/axios'
import { DEFAULT_GENERIC_TABLE_PAGE_SIZE } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'

const POLL_INTERVAL_MS = 30_000
const PAGE_SIZE = 3
const ACTIONABLE_STATUSES = ['EXECUTING', 'PAUSED', 'RELEASED'] as const

function toOrderRecords(orders: WarehouseHomeData['orders']): DashboardRecordListItem[] {
  return orders.map((o) => ({
    id: o.id,
    title: o.reference,
    subtitle: `${o.type} - ${o.infoValue}`,
    details: `Assigned to: ${o.assignedTo}`,
    status: o.status as DashboardRecordListItem['status'],
    progress: o.progress
  }))
}

function toInfoCards(info: WarehouseHomeData['warehouseInfo']): DashboardInfoCardItem[] {
  return [
    { label: 'Warehouse', value: info.warehouseName, icon: Warehouse },
    { label: 'Zone', value: info.zoneName, icon: MapPin }
  ]
}

function paginate<T>(items: T[], page: number, size: number): T[] {
  return items.slice(page * size, (page + 1) * size)
}

function countByStatus(orders: WarehouseHomeData['orders'], status: string): number {
  return orders.filter((order) => order.status === status).length
}

function getPriorityOrder(orders: WarehouseHomeData['orders']): WarehouseHomeData['orders'][number] | null {
  for (const status of ACTIONABLE_STATUSES) {
    const order = orders.find((candidate) => candidate.status === status)

    if (order) {
      return order
    }
  }

  return orders[0] ?? null
}

function getResponseError(response: ApiResponse<WarehouseHomeData>): string {
  if (response.success) {
    return ''
  }

  return response.message || 'Unable to load warehouse home data.'
}

export type UseWarehouseHomeReturn = {
  isLoading: boolean
  error: string | null
  refetch: () => void
  infoCards: DashboardInfoCardItem[]
  orders: {
    records: DashboardRecordListItem[]
    allRecords: DashboardRecordListItem[]
    rawRecords: WarehouseHomeData['orders']
    page: number
    totalPages: number
    onPrev: () => void
    onNext: () => void
  }
  summary: {
    totalOrders: number
    releasedOrders: number
    activeOrders: number
    pausedOrders: number
    availableBins: number
  }
  priorityOrder: WarehouseHomeData['orders'][number] | null
  activeExecutingOrder: WarehouseHomeData['orders'][number] | null
  user: WarehouseHomeData['user'] | null
  warehouseInfo: WarehouseHomeData['warehouseInfo'] | null
  bins: {
    records: WarehouseHomeData['bins']
    gridRecords: BinRecord[]
    pageSize: number
  }
  lastUserOrder: WarehouseOrderRecord | null
  focusOrder: WarehouseOrderRecord | null
}

export function useWarehouseHome(): UseWarehouseHomeReturn {
  const [data, setData] = useState<WarehouseHomeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderPage, setOrderPage] = useState(0)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await warehouseApiClient.get<ApiResponse<WarehouseHomeData>>('/warehouse/home')

      if (response.success && response.data) {
        const payload = response.data
        setData({
          ...payload,
          activeExecutingOrder:
            payload.activeExecutingOrder
            ?? payload.orders.find(
              (order) =>
                order.assignedUserId === payload.user.userId
                && order.status === 'EXECUTING'
            )
            ?? null
        })

        return
      }

      setError(getResponseError(response))
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
    const interval = setInterval(() => void fetchData(), POLL_INTERVAL_MS)
    const handleZoneChanged = () => void fetchData()

    window.addEventListener('warehouse-zone-changed', handleZoneChanged)

    return () => {
      clearInterval(interval)
      window.removeEventListener('warehouse-zone-changed', handleZoneChanged)
    }
  }, [fetchData])

  const totalPages = data ? Math.max(1, Math.ceil(data.orders.length / PAGE_SIZE)) : 1

  useEffect(() => {
    setOrderPage((previousPage) => Math.min(previousPage, totalPages - 1))
  }, [totalPages])

  const infoCards = useMemo(() => (data ? toInfoCards(data.warehouseInfo) : []), [data])

  const pagedOrders = useMemo(
    () => toOrderRecords(paginate(data?.orders ?? [], orderPage, PAGE_SIZE)),
    [data, orderPage]
  )
  const allOrderRecords = useMemo(
    () => toOrderRecords(data?.orders ?? []),
    [data]
  )
  const summary = useMemo(() => {
    const orders = data?.orders ?? []
    const bins = data?.bins ?? []

    return {
      totalOrders: orders.length,
      releasedOrders: countByStatus(orders, 'RELEASED'),
      activeOrders: countByStatus(orders, 'EXECUTING'),
      pausedOrders: countByStatus(orders, 'PAUSED'),
      availableBins: bins.length
    }
  }, [data])
  const priorityOrder = useMemo(
    () => getPriorityOrder(data?.orders ?? []),
    [data]
  )
  const lastUserOrder = useMemo(
    () => resolveLastUserOrder(data?.orders ?? [], data?.user.userId ?? null),
    [data]
  )
  const focusOrder = useMemo(() => {
    const userId = data?.user.userId ?? null
    const active = data?.activeExecutingOrder ?? null

    if (active && active.assignedUserId === userId) {
      return active
    }

    return lastUserOrder
  }, [data?.activeExecutingOrder, data?.user.userId, lastUserOrder])
  const binGridRecords = useMemo(
    () => toWarehouseHomeBinGridRecords(data?.bins ?? []),
    [data?.bins]
  )

  return {
    isLoading,
    error,
    refetch: fetchData,
    infoCards,
    orders: {
      records: pagedOrders,
      allRecords: allOrderRecords,
      rawRecords: data?.orders ?? [],
      page: orderPage,
      totalPages,
      onPrev: () => setOrderPage((p) => Math.max(0, p - 1)),
      onNext: () => setOrderPage((p) => Math.min(totalPages - 1, p + 1))
    },
    summary,
    priorityOrder,
    activeExecutingOrder: data?.activeExecutingOrder ?? null,
    lastUserOrder,
    focusOrder,
    user: data?.user ?? null,
    warehouseInfo: data?.warehouseInfo ?? null,
    bins: {
      records: data?.bins ?? [],
      gridRecords: binGridRecords,
      pageSize: DEFAULT_GENERIC_TABLE_PAGE_SIZE
    }
  }
}
