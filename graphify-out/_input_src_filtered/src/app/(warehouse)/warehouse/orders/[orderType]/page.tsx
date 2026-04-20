import { WarehouseOrdersPageView } from '@/components/warehouse/pages/orders/warehouse-orders-page'

type PageProps = {
  params: Promise<{ orderType: string }>
}

export default async function WarehouseOrdersOrderTypePage({ params }: PageProps) {
  const { orderType } = await params

  return <WarehouseOrdersPageView orderType={orderType} />
}
