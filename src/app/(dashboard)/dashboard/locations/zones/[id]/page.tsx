import { ZoneDashboardOverviewPageClient } from '@/components/features/locations/zones/zone-dashboard-overview-page'

type ZoneOverviewPageProps = {
  params: Promise<{ id: string }>
}

export default async function ZoneOverviewPage({ params }: ZoneOverviewPageProps) {
  const { id } = await params

  return <ZoneDashboardOverviewPageClient zoneId={id} />
}
