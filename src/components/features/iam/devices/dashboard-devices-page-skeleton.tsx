/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/devices/dashboard-devices-page-skeleton.md
 */

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

function SectionShell({ titleWidth, children }: { titleWidth: string; children: React.ReactNode }) {
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
        <Shimmer className={titleWidth} />
        <Shimmer className="h-3 w-28 rounded" />
      </div>
      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

export function DashboardDevicesPageSkeleton() {
  return (
    <div
      className="mx-auto min-h-screen max-w-7xl space-y-8 p-4 xl:space-y-10 xl:p-6"
      style={{ background: 'var(--wh-page-bg)' }}
    >
      <div className="space-y-3">
        <Shimmer className="h-9 w-48 rounded-md" />
        <Shimmer className="h-4 w-full max-w-3xl rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl p-4"
            style={{
              background: 'var(--wh-card-bg)',
              border: '1px solid var(--wh-border)',
              boxShadow: '0 8px 22px rgba(0,0,0,0.24)'
            }}
          >
            <div className="space-y-2">
              <Shimmer className="h-3 w-24 rounded" />
              <Shimmer className="h-8 w-16 rounded" />
              <Shimmer className="h-3 w-full rounded" />
            </div>
          </div>
        ))}
      </div>

      <SectionShell titleWidth="h-5 w-40 rounded">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Shimmer key={index} className="h-10 w-36 rounded-full" />
          ))}
        </div>
      </SectionShell>

      <SectionShell titleWidth="h-5 w-44 rounded">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, cellIndex) => (
                <Shimmer key={cellIndex} className="h-4 w-full rounded" />
              ))}
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell titleWidth="h-5 w-40 rounded">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, cellIndex) => (
                <Shimmer key={cellIndex} className="h-4 w-full rounded" />
              ))}
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  )
}
