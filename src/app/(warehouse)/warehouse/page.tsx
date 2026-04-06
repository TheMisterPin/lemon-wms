'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { MapPin, Warehouse } from 'lucide-react'
import { DashboardInfoCards, type DashboardInfoCardItem } from '@/components/dashboard/DashboardInfoCards'
import {
  DashboardRecordListItem,
  DashboardRecordListSection
} from '@/components/dashboard/DashboardRecordListSection'
import { GenericTable } from '@/components/tables/generic-table'
import { Card } from '@/components/ui/card'
import { OrderStatus, OrderType, Role } from '@/generated/prisma'
import { useAuth } from '@/hooks/auth/use-auth'
import { apiClient } from '@/lib/axios'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'
import { BinItem } from './../../../types/warehouse/bins/binlist.type'

interface Order {
  id : string
  type : OrderType
  status : OrderStatus
  assignedTo : string | 'Unassigned'
  progress : number
}
interface WarehouseInfo {
  warehouseId : string
  warehouseName : string
  zoneId : string
  zoneName : string
  deviceId : string
  deviceName : string
}
interface UserInfo {
  userId : string
  name : string
  role : Role
}

interface WarehouseHomePageData {
  warehouseInfo: WarehouseInfo
  user: UserInfo
  orders: Order[]
  bins : BinItem[]

}

type DashboardBinRecord = WarehouseHomePageData['bins'][number]

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

function createInfoCards(data: WarehouseHomePageData['warehouseInfo']): DashboardInfoCardItem[] {
  return [
    { label: 'Warehouse', value: data.warehouseName ?? '', icon: Warehouse },
    { label: 'Zones', value: data.zoneName ?? '', icon: MapPin }
  ]
}

// TODO: This component is named `DashboardHomePage` but lives in the warehouse
// route (/warehouse/page.tsx). Rename to `WarehouseHomePage` to match the route.

// TODO: `WarehouseInfo`, `UserInfo`, and `WarehouseHomePageData` partially
// duplicate data already available in the Zustand auth store (user, location,
// device). Once `useAuth().warehouse` is fully populated, the /api/warehouse
// response can drop `user` and `warehouseInfo` fields, and the `UserInfo`/
// `WarehouseInfo` interfaces below can be removed from this file.
export default function DashboardHomePage() {
  const router = useRouter()
  const { warehouse } = useAuth()

  const [dashboardData, setDashboardData] = useState<WarehouseHomePageData>({
    warehouseInfo: {
      zoneId: '',
      warehouseId: '',
      deviceId: '',
      warehouseName: '',
      zoneName: '',
      deviceName: ''
    },
    user: {
      userId: '',
      name: '',
      role: Role.WAREHOUSE_WORKER
    },
    orders: [],
    bins: []
  })

  const [orderPage, setOrderPage] = useState(0)
  const [binPage, setBinPage] = useState(0)
  const orders = dashboardData.orders
  const bins = dashboardData.bins
  const orderTotalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE))
  const binTotalPages = Math.max(1, Math.ceil(bins.length / PAGE_SIZE))
  const formattedOrders : DashboardRecordListItem[] = orders.map((order) => ({
    id: order.id,
    title: `Order ${order.id}`,
    subtitle: `${order.type} - ${order.status}`,
    details: `Assigned to: ${order.assignedTo}`,
    status: order.status,
    progress: order.progress
  }))
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await apiClient.get<ApiResponse<WarehouseHomePageData>>('/warehouse')

        if (response.success && response.data) {
          setDashboardData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    void fetchData()
  }, [])

  const pagedOrders = formattedOrders.slice(orderPage * PAGE_SIZE, (orderPage + 1) * PAGE_SIZE)
  const pagedBins = bins.slice(binPage * PAGE_SIZE, (binPage + 1) * PAGE_SIZE)
  const infoCards = createInfoCards(dashboardData.warehouseInfo)

  return (
    <main className="select-none flex flex-col h-full bg-linear-50 from-slate-800 to-slate-900 p-6 gap-4 overflow-hidden">
      <Card className=" glass flex-1 overflow-y-auto py-12 px-16">
        <h1 className="text-2xl font-semibold">Warehouse </h1>
        {warehouse?.user ? (
          // TODO: `warehouse` is null on page refresh (user not persisted to storage —
          // see store.ts TODO). This block silently renders nothing until the first
          // 401 → refresh cycle repopulates the store. Add a skeleton or brief
          // loading state so the operator doesn't see a blank header.
          // TODO: `warehouse.location?.zoneId` is a raw UUID. Resolve it to
          // a zone name (already available from `/api/warehouse` response as
          // `warehouseInfo.zoneName`) and display that instead.
          <div className="mt-1 text-sm text-brand-muted">
            <p>
              Signed in as {warehouse.user.badgeNumber} ({warehouse.user.role})
            </p>
            <p>
              Device: {warehouse.device?.name ?? 'Unknown'}
              {warehouse.location?.zoneId ? ` · Zone ${warehouse.location.zoneId}` : ''}
            </p>
          </div>
        ) : null}

        <DashboardInfoCards cards={infoCards} />

        <DashboardRecordListSection
          title="Orders"
          icon={Warehouse}
          records={pagedOrders}
          page={orderPage}
          totalPages={orderTotalPages}
          onPrev={() => setOrderPage((page) => Math.max(0, page - 1))}
          onNext={() => setOrderPage((page) => Math.min(orderTotalPages - 1, page + 1))}
          paginationPosition="footer"
        />

        <div className="gap-4 rounded-lg bg-brand-glass/75 border border-slate-500 pb-12">
          {/* Bins table */}
          <h2 className="text-xl font-semibold mt-8 px-4 ">Bins</h2>
          <GenericTable
            columns={binColumns}
            records={pagedBins}
            onRowClick={(bin) => router.push(`/warehouse/bins/${encodeURIComponent(bin.id)}`)}
            pagination={{
              page: binPage,
              totalPages: binTotalPages,
              onPrev: () => setBinPage((page) => Math.max(0, page - 1)),
              onNext: () => setBinPage((page) => Math.min(binTotalPages - 1, page + 1)),
              position: 'header'
            }}
          />
        </div>
      </Card>
    </main>
  )
}
