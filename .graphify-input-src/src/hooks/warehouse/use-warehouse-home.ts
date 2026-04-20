'use client'

import { useEffect, useMemo, useState } from 'react'

import { MapPin, Warehouse } from 'lucide-react'

import type { DashboardInfoCardItem } from '@/components/dashboard/dashboard-info-card'
import type { DashboardRecordListItem } from '@/components/dashboard/dashboard-record-list-section'
import { OrderStatus, OrderType, Role } from '@/generated/prisma'
import { warehouseApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { BinItem } from '@/types/warehouse/bins/binlist.type'

const PAGE_SIZE = 3

interface Order {
  id: string
  type: OrderType
  status: OrderStatus
  assignedTo: string | 'Unassigned'
  progress: number
}

interface WarehouseInfo {
  warehouseId: string
  warehouseName: string
  zoneId: string
  zoneName: string
  deviceId: string
  deviceName: string
}

interface UserInfo {
  userId: string
  name: string
  role: Role
}

interface WarehouseHomePageData {
  warehouseInfo: WarehouseInfo
  user: UserInfo
  orders: Order[]
  bins: BinItem[]
}

export type WarehouseBinRecord = WarehouseHomePageData['bins'][number]

function toOrderRecords(orders: Order[]): DashboardRecordListItem[] {
  return orders.map((o) => ({
    id: o.id,
    title: `Order ${o.id}`,
    subtitle: `${o.type} - ${o.status}`,
    details: `Assigned to: ${o.assignedTo}`,
    status: o.status,
    progress: o.progress
  }))
}

function toInfoCards(info: WarehouseInfo): DashboardInfoCardItem[] {
  return [
    { label: 'Warehouse', value: info.warehouseName ?? '', icon: Warehouse },
    { label: 'Zone', value: info.zoneName ?? '', icon: MapPin }
  ]
}

function paginate<T>(items: T[], page: number): T[] {
  return items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
}

function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE))
}

export function useWarehouseHome() {
  const [data, setData] = useState<WarehouseHomePageData>({
    warehouseInfo: {
      zoneId: '', warehouseId: '', deviceId: '',
      warehouseName: '', zoneName: '', deviceName: ''
    },
    user: { userId: '', name: '', role: Role.WAREHOUSE_WORKER },
    orders: [],
    bins: []
  })

  const [orderPage, setOrderPage] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        const response = await warehouseApiClient.get<ApiResponse<WarehouseHomePageData>>('/warehouse/home')
        if (!cancelled && response.success && response.data) {
          setData(response.data)
        }
      } catch (error) {
        console.error('[useWarehouseHome] Failed to fetch:', error)
      }
    }

    void fetchData()

    return () => {
      cancelled = true
    }
  }, [])

  const infoCards = useMemo(() => toInfoCards(data.warehouseInfo), [data.warehouseInfo])

  const orderPages = totalPages(data.orders.length)

  const pagedOrders = useMemo(
    () => toOrderRecords(paginate(data.orders, orderPage)),
    [data.orders, orderPage]
  )

  return {
    infoCards,
    orders: {
      records: pagedOrders,
      page: orderPage,
      totalPages: orderPages,
      onPrev: () => setOrderPage((p) => Math.max(0, p - 1)),
      onNext: () => setOrderPage((p) => Math.min(orderPages - 1, p + 1))
    },
    bins: {
      records: data.bins,
      pageSize: PAGE_SIZE
    }
  }
}
