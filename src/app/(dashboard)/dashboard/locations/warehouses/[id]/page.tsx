import { WarehouseDashboardOverviewPageClient } from '@/components/features/locations/warehouses/warehouse-dashboard-overview-page-client'

type WarehouseDetailPageProps = {
  params: Promise<{ id: string }>
}

export default async function WarehouseDetailPage({ params }: WarehouseDetailPageProps) {
  const { id } = await params

  return <WarehouseDashboardOverviewPageClient warehouseId={id} />
}
