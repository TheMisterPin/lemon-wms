import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function Shimmer({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn('bg-wh-card-bg-soft', className)}
      style={{ border: '1px solid var(--wh-border)' }}
    />
  )
}

function StatCardSkeleton() {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div className="flex items-center justify-between p-4 xl:p-[18px]">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Shimmer className="h-3 w-28 rounded" />
          <Shimmer className="h-9 w-20 rounded-md" />
        </div>
        <Shimmer className="h-14 w-14 shrink-0 rounded-2xl" />
      </div>
    </div>
  )
}

function SectionShell({
  titlePlaceholder,
  children
}: {
  titlePlaceholder: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl"
      style={{
        background: 'var(--wh-card-bg-soft)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
        style={{ borderColor: 'var(--wh-border)' }}
      >
        {titlePlaceholder}
        <div className="flex shrink-0 items-center gap-2">
          <Shimmer className="h-3 w-16 rounded" />
          <Shimmer className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="space-y-3 p-4 xl:p-5">{children}</div>
    </section>
  )
}

function ListRowSkeleton() {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div className="flex items-center justify-between gap-4 p-4 xl:p-[18px]">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Shimmer className="h-12 w-12 shrink-0 rounded-2xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-4 w-40 rounded" />
            <Shimmer className="h-3 w-52 rounded" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Shimmer className="h-7 w-16 rounded-full" />
          <Shimmer className="hidden h-9 w-[84px] rounded-xl md:block" />
        </div>
      </div>
    </div>
  )
}

function BinCardSkeleton() {
  return (
    <div
      className="rounded-2xl"
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div className="p-4 xl:p-[18px]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Shimmer className="h-6 w-36 rounded" />
          <div className="flex items-center gap-2">
            <Shimmer className="h-4 w-24 rounded" />
            <Shimmer className="h-7 w-14 rounded-full" />
          </div>
        </div>
        <div className="mb-3">
          <div className="mb-1.5 flex justify-between gap-2">
            <Shimmer className="h-3 w-8 rounded" />
            <Shimmer className="h-3 w-28 rounded" />
          </div>
          <Shimmer className="h-2 w-full rounded-full" />
        </div>
        <div className="flex justify-center pt-1">
          <Shimmer className="h-9 w-[132px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function DashboardLocationsPageSkeleton() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto max-w-7xl space-y-4 p-4 xl:space-y-5 xl:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
          <SectionShell
            titlePlaceholder={
              <Shimmer className="h-5 w-36 rounded md:h-5" />
            }
          >
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </SectionShell>

          <SectionShell
            titlePlaceholder={
              <Shimmer className="h-5 w-24 rounded md:h-5" />
            }
          >
            <ListRowSkeleton />
            <ListRowSkeleton />
            <ListRowSkeleton />
          </SectionShell>
        </div>

        <section
          className="rounded-2xl"
          style={{
            background: 'var(--wh-card-bg-soft)',
            border: '1px solid var(--wh-border)'
          }}
        >
          <div
            className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
            style={{ borderColor: 'var(--wh-border)' }}
          >
            <Shimmer className="h-5 w-20 rounded" />
            <div className="flex shrink-0 items-center gap-2">
              <Shimmer className="h-3 w-20 rounded" />
              <Shimmer className="h-8 w-24 rounded-lg" />
            </div>
          </div>
          <div className="p-4 xl:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 xl:gap-4">
              <BinCardSkeleton />
              <BinCardSkeleton />
              <BinCardSkeleton />
              <BinCardSkeleton />
              <BinCardSkeleton />
              <BinCardSkeleton />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
