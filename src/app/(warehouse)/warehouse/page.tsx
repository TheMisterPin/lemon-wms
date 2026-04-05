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

export default function DashboardHomePage() {
  const router = useRouter()

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
