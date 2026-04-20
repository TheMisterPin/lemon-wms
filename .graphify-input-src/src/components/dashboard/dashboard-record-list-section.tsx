import { useMemo } from 'react'
import { Search, type LucideIcon } from 'lucide-react'
import {
  PaginationPosition,
  PaginationSelector
} from '@/components/shared/PaginationSelector'
import { Input } from '@/components/ui/input'
import { OrderStatus } from '@/generated/prisma'

export interface DashboardRecordListItem {
  id: string
  title: string
  subtitle: string
  progress?: number
  status?: OrderStatus
  details?: string
}

interface DashboardRecordListSectionProps {
  title: string
  entityTone?: 'warehouse' | 'zone' | 'bin' | 'item' | 'order'
  icon: LucideIcon
  records: DashboardRecordListItem[]
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  paginationPosition: PaginationPosition
  emptyMessage?: string
  onRecordClick?: (record: DashboardRecordListItem) => void
  selectedRecordId?: string | null
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

function normalizeProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 100)
}

function getEntityTone(tone?: DashboardRecordListSectionProps['entityTone']) {
  const tones = {
    warehouse: {
      iconClass: 'text-entity-warehouse',
      titleClass: 'text-entity-warehouse',
      selectedRingClass: 'ring-entity-warehouse/35'
    },
    zone: {
      iconClass: 'text-entity-zone',
      titleClass: 'text-entity-zone',
      selectedRingClass: 'ring-entity-zone/35'
    },
    bin: {
      iconClass: 'text-entity-bin',
      titleClass: 'text-entity-bin',
      selectedRingClass: 'ring-entity-bin/35'
    },
    item: {
      iconClass: 'text-brand-primary',
      titleClass: 'text-brand-primary',
      selectedRingClass: 'ring-brand-primary/35'
    },
    order: {
      iconClass: 'text-brand-primary',
      titleClass: 'text-brand-primary',
      selectedRingClass: 'ring-brand-primary/35'
    }
  } as const

  return tone ? tones[tone] : tones.item
}

export function DashboardRecordListSection({
  title,
  entityTone,
  icon,
  records,
  page,
  totalPages,
  onPrev,
  onNext,
  paginationPosition = 'header',
  emptyMessage = `No ${title.toLowerCase()} found.`,
  onRecordClick,
  selectedRecordId,
  searchValue,
  onSearchChange,
  searchPlaceholder
}: DashboardRecordListSectionProps) {
  const Icon = icon
  const showHeaderPagination = paginationPosition === 'header'
  const showFooterPagination = paginationPosition === 'footer'
  const tone = getEntityTone(entityTone)
  const normalizedSearch = (searchValue ?? '').trim().toLowerCase()
  const filteredRecords = useMemo(() => {
    if (!normalizedSearch) {
      return records
    }

    return records.filter((record) => {
      const haystack = `${record.title} ${record.subtitle} ${record.details ?? ''}`.toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [records, normalizedSearch])

  return (
    <div className="mx-auto w-full min-h-full min-w-0 overflow-x-auto overflow-y-visible rounded-md bg-dash-card">
      <div className="flex items-center justify-between gap-4 border-b border-dash-border px-4 py-3">
        <h2 className={['text-xl font-semibold tracking-tight', tone.titleClass].join(' ')}>
          {title}
        </h2>
        {showHeaderPagination && (
          <PaginationSelector
            page={page}
            totalPages={totalPages}
            onPrev={onPrev}
            onNext={onNext}
          />
        )}
      </div>
      {onSearchChange && (
        <div className="border-b border-dash-border p-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-subtle" />
            <Input
              value={searchValue ?? ''}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
              className="pl-9"
              aria-label={`Search ${title.toLowerCase()}`}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4">
        {filteredRecords.length === 0 ? (
          <div className="rounded-md bg-dash-card2 px-4 py-6 text-sm text-dash-muted">
            {emptyMessage}
          </div>
        ) : (
          filteredRecords.map((record) => {
            const progress =
              record.progress !== undefined
                ? normalizeProgress(record.progress)
                : undefined

            return (
              <button
                key={record.id}
                type="button"
                onClick={() => onRecordClick?.(record)}
                className={[
                  'flex w-full items-center gap-4 rounded-md bg-dash-card2 px-4 py-3 text-left transition-colors duration-200',
                  onRecordClick ? 'cursor-pointer hover:bg-dash-bg dark:hover:bg-dash-card' : '',
                  selectedRecordId === record.id ? `ring-1 ring-inset ${tone.selectedRingClass}` : ''
                ].join(' ')}
              >
                <Icon size={20} className={['shrink-0', tone.iconClass].join(' ')} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-dash-text">{record.title}</p>
                  <p className="text-sm text-dash-muted">{record.subtitle}</p>
                  {progress !== undefined && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between gap-3 text-xs text-dash-muted">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div
                        aria-label={`${record.title} progress`}
                        aria-valuemax={100}
                        aria-valuemin={0}
                        aria-valuenow={progress}
                        className="h-1.5 w-full overflow-hidden rounded-none bg-dash-border"
                        role="progressbar"
                      >
                        <div
                          className="h-full rounded-none bg-brand-primary transition-[width] duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>

      {showFooterPagination && (
        <div className="border-t border-dash-border px-4 py-3">
          <PaginationSelector
            page={page}
            totalPages={totalPages}
            onPrev={onPrev}
            onNext={onNext}
          />
        </div>
      )}
    </div>
  )
}
