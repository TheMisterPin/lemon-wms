import { BinDashboardOverviewPageClient } from '@/components/dashboard/bins/bin-dashboard-overview-page-client'

type BinOverviewPageProps = {
  params: Promise<{ id: string }>
}

export default async function BinOverviewPage({ params }: BinOverviewPageProps) {
  const { id } = await params

  return <BinDashboardOverviewPageClient binId={id} />
}
