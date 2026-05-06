import { ZoneDashboardOverviewPageClient } from '@/components/dashboard/zones/zone-dashboard-overview-page-client'

type ZoneOverviewPageProps = {
  params: Promise<{ id: string }>
}

export default async function ZoneOverviewPage({ params }: ZoneOverviewPageProps) {
  const { id } = await params

  return <ZoneDashboardOverviewPageClient zoneId={id} />
}
