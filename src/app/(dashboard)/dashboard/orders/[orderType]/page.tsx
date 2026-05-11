import { DashboardOrdersPageView } from '@/components/features/orders/components/dashboard-orders-page-view'

type PageProps = {
  params: Promise<{ orderType: string }>
}

export default async function DashboardOrdersOrderTypePage({ params }: PageProps) {
  const { orderType } = await params

  return <DashboardOrdersPageView orderType={orderType} />
}
