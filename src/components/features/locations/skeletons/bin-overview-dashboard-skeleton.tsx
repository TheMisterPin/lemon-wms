import { Skeleton } from '@/components/ui/skeleton'

export function BinOverviewDashboardSkeleton() {
  return (
    <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg bg-wh-card-bg-soft" />
        <Skeleton className="h-4 max-w-xl rounded-lg bg-wh-card-bg-soft" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-28 rounded-xl bg-wh-card-bg-soft" />
          <Skeleton className="h-28 rounded-xl bg-wh-card-bg-soft" />
          <Skeleton className="h-28 rounded-xl bg-wh-card-bg-soft" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 rounded-xl bg-wh-card-bg-soft" />
          <Skeleton className="h-80 rounded-xl bg-wh-card-bg-soft" />
        </div>
        <Skeleton className="h-72 rounded-xl bg-wh-card-bg-soft" />
      </div>
    </main>
  )
}
