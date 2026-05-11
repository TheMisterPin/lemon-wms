'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/users/user-detail-page-client.md
 */


import { useUserDetailDashboard } from '@/components/features/iam/users/use-user-detail-dashboard'
import { UserDetailDashboard } from '@/components/features/iam/users/user-detail-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

export function UserDetailPageClient({ userId }: { userId: string }) {
  const { data, isLoading, error, refetch } = useUserDetailDashboard(userId)

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-wh-card-bg-soft" />
          <Skeleton className="h-24 rounded-2xl bg-wh-card-bg-soft" />
          <Skeleton className="h-72 rounded-2xl bg-wh-card-bg-soft" />
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-center p-6 xl:p-10">
          <div
            className="w-full max-w-lg rounded-2xl px-6 py-10 text-center"
            style={{
              background: 'var(--wh-card-bg-soft)',
              border: '1px solid var(--wh-border)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--wh-text-primary)' }}>
              {error ?? 'Could not load user detail dashboard.'}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--wh-action-bg)',
                border: '1px solid var(--wh-action-border)',
                color: 'var(--wh-action-text)'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <UserDetailDashboard data={data} />
    </main>
  )
}
