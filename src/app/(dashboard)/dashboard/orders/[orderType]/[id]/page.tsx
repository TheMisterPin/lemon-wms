import { OrderDetailPageClient } from '@/components/dashboard/orders/order-detail-page-client'

type PageProps = {
  params: Promise<{ orderType: string; id: string }>
}

export default async function DashboardOrderDetailPage({ params }: PageProps) {
  const { orderType, id } = await params

  return <OrderDetailPageClient orderType={orderType} orderId={id} />
}
