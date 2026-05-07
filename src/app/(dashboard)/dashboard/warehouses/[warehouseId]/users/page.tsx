import { DashboardUsersPageView } from '@/components/dashboard/users/DashboardUsersPageView'

type PageProps = {
  params: Promise<{ warehouseId: string }>
}

export default async function DashboardWarehouseUsersPage({ params }: PageProps) {
  const { warehouseId } = await params

  return <DashboardUsersPageView warehouseId={warehouseId} />
}
