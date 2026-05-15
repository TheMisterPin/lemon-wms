import { WarehouseOrdersPageView } from '@/components/warehouse/orders/warehouse-order-type-page-view'

type PageProps = {
  params: Promise<{ orderType: string }>
}

export default async function WarehouseOrdersOrderTypePage({ params }: PageProps) {
  const { orderType } = await params

  return <WarehouseOrdersPageView orderType={orderType} />
}
