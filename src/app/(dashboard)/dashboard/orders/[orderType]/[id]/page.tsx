import { OrderDetailPageClient } from '@/components/features/orders/components/order-detail-page-client'

type PageProps = {
  params: Promise<{ orderType: string; id: string }>
}

export default async function DashboardOrderDetailPage({ params }: PageProps) {
  const { orderType, id } = await params

  return <OrderDetailPageClient orderType={orderType} orderId={id} />
}
