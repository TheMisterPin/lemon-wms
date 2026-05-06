import { WarehouseStockDashboardPageClient } from '@/components/dashboard/warehouses/warehouse-stock-dashboard-page-client'

type WarehouseStockPageProps = {
  params: Promise<{ id: string }>
}

export default async function WarehouseStockPage({ params }: WarehouseStockPageProps) {
  const { id } = await params

  return <WarehouseStockDashboardPageClient warehouseId={id} />
}
