import { WarehouseDashboardOverviewPageClient } from '@/components/features/locations/warehouses/pages/warehouse-dashboard-overview-page-client'

type WarehouseDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ stockCategories?: string }>
}

export default async function WarehouseDetailPage({ params, searchParams }: WarehouseDetailPageProps) {
  const { id } = await params
  const sp = await searchParams
  const stockCategoriesRollup = sp.stockCategories === 'leaf' ? 'leaf' : 'parent'

  return (
    <WarehouseDashboardOverviewPageClient
      warehouseId={id}
      stockCategoriesRollup={stockCategoriesRollup}
    />
  )
}
