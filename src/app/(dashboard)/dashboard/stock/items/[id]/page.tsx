import { ItemDetailPageClient } from '@/components/dashboard/stock/item-detail-page-client'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function StockItemDetailPage({ params }: PageProps) {
  const { id } = await params

  return <ItemDetailPageClient itemId={id} />
}
