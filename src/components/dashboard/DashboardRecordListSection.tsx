import { ChevronLeft, ChevronRight } from 'lucide-react'
import { OrderStatus } from '@/generated/prisma'
import type { LucideIcon } from 'lucide-react'

export interface DashboardRecordListItem {
  id: string
  title: string
  subtitle: string
  progress?: number
  status? : OrderStatus
  details?: string
}

type PaginationPosition = 'header' | 'footer'

interface DashboardRecordListSectionProps {
  title: string
  icon: LucideIcon
  records: DashboardRecordListItem[]
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  paginationPosition?: PaginationPosition
  emptyMessage?: string
}

function normalizeProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 100)
}

function PaginationControls({
  page,
  totalPages,
  onPrev,
  onNext
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 0}
        className="cursor-pointer rounded-md bg-brand-glass p-1.5 text-brand-muted transition-colors hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs text-brand-muted">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages - 1}
        className="cursor-pointer rounded-md bg-brand-glass p-1.5 text-brand-muted transition-colors hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

export function DashboardRecordListSection({
  title,
  icon,
  records,
  page,
  totalPages,
  onPrev,
  onNext,
  paginationPosition = 'header',
  emptyMessage = `No ${title.toLowerCase()} found.`
}: DashboardRecordListSectionProps) {
  const Icon = icon
  const showHeaderPagination = paginationPosition === 'header'
  const showFooterPagination = paginationPosition === 'footer'

  return (
    <div className="rounded-lg border border-slate-500 bg-brand-glass/75 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {showHeaderPagination && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPrev={onPrev}
            onNext={onNext}
          />
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 p-4">
        {records.length === 0 ? (
          <div className="rounded-lg bg-brand-glass p-4 text-sm text-brand-muted">
            {emptyMessage}
          </div>
        ) : (
          records.map((record) => {
            const progress =
              record.progress !== undefined
                ? normalizeProgress(record.progress)
                : undefined

            return (
              <div key={record.id} className="flex items-center gap-4 rounded-lg bg-brand-glass p-4">
                <Icon size={20} className="shrink-0 text-brand-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{record.title}</p>
                  <p className="text-sm text-brand-muted">{record.subtitle}</p>
                  {progress !== undefined && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs text-brand-muted">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div
                        aria-label={`${record.title} progress`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={progress}
                        className="h-2 w-full overflow-hidden rounded-full bg-brand-glass/50"
                        role="progressbar"
                      >
                        <div
                          className="h-full rounded-full bg-brand-primary transition-[width] duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {showFooterPagination && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </div>
  )
}
