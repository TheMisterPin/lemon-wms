import { Skeleton } from '@/components/ui/skeleton'

export default function CategoryStockPageSkeleton() {
  return (
    <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <Skeleton className="h-28 w-full rounded-2xl bg-wh-card-bg-soft" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl bg-wh-card-bg-soft" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          <Skeleton className="h-80 rounded-2xl bg-wh-card-bg-soft" />
          <Skeleton className="h-80 rounded-2xl bg-wh-card-bg-soft" />
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          <Skeleton className="h-64 rounded-2xl bg-wh-card-bg-soft" />
          <Skeleton className="h-64 rounded-2xl bg-wh-card-bg-soft" />
        </div>
      </div>
    </main>
  )
}
