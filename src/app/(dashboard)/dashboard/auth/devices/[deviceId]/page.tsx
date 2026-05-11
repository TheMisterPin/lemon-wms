import { DeviceDetailPageClient } from '@/components/features/iam/devices/device-detail-page-client'

type Props = { params: Promise<{ deviceId: string }> }

export default async function DeviceDetailPage({ params }: Props) {
  const { deviceId } = await params

  return <DeviceDetailPageClient deviceId={deviceId} />
}
