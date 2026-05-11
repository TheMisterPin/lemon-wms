import { BinDashboardOverviewPage } from '@/components/features/locations/pages'

type BinOverviewPageProps = {
  params: Promise<{ id: string }>
}

export default async function BinOverviewPage({ params }: BinOverviewPageProps) {
  const { id } = await params

  return <BinDashboardOverviewPage binId={id} />
}
