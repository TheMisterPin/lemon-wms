import { CategoryStockPageClient } from '@/components/dashboard/stock/category-stock-page-client'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function StockCategoryDetailPage({ params }: PageProps) {
  const { id } = await params

  return <CategoryStockPageClient categoryId={id} />
}
