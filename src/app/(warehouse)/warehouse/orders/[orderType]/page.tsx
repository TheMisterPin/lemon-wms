import { WarehouseOrdersPageView } from '@/components/warehouse/orders/WarehouseOrdersPageView'

type PageProps = {
  params: Promise<{ orderType: string }>
}

export default async function WarehouseOrdersOrderTypePage({ params }: PageProps) {
  const { orderType } = await params

  return <WarehouseOrdersPageView orderType={orderType} />
}
