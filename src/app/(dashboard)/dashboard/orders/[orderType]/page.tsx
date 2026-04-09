import { DashboardOrdersPageView } from '@/components/dashboard/pages/orders/dashboard-orders-page'

type PageProps = {
  params: Promise<{ orderType: string }>
}

export default async function DashboardOrdersOrderTypePage({ params }: PageProps) {
  const { orderType } = await params

  return <DashboardOrdersPageView orderType={orderType} />
}
