import { DashboardUsersPageView } from '@/components/features/iam/users/dashboard-users-page-view'

type PageProps = {
  params: Promise<{ warehouseId: string }>
}

export default async function DashboardWarehouseUsersPage({ params }: PageProps) {
  const { warehouseId } = await params

  return <DashboardUsersPageView warehouseId={warehouseId} />
}
