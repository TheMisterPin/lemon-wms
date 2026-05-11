import { SubCategoryStockPageClient } from '@/components/features/stock/pages/sub-category-stock-page-client'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function SubcategoryStockPage({ params }: PageProps) {
  const { id } = await params

  return <SubCategoryStockPageClient subcategoryId={id} />
}
