import { UserDetailPageClient } from '@/components/features/iam/users/user-detail-page-client'

type PageProps = {
  params: Promise<{ userId: string }>
}

export default async function DashboardUserDetailPage({ params }: PageProps) {
  const { userId } = await params

  return <UserDetailPageClient userId={userId} />
}
