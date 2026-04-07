import {
  PaginationPosition,
  PaginationSelector
} from '@/components/shared/PaginationSelector'
import { Input } from '@/components/ui/input'
import { OrderStatus } from '@/generated/prisma'
import { Search, type LucideIcon } from 'lucide-react'
import { useMemo } from 'react'

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
      selectedBorderClass: 'border-entity-warehouse/60',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-warehouse), var(--entity-warehouse-end))'
      }
    },
    zone: {
      iconClass: 'text-entity-zone',
      selectedBorderClass: 'border-entity-zone/60',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-zone), var(--entity-zone-end))'
      }
    },
    bin: {
      iconClass: 'text-entity-bin',
      selectedBorderClass: 'border-entity-bin/60',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--entity-bin), var(--entity-bin-end))'
      }
    },
    item: {
      iconClass: 'text-brand-primary',
      selectedBorderClass: 'border-brand-primary/60',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--brand-primary), var(--brand-primary-end))'
      }
    },
    order: {
      iconClass: 'text-brand-primary',
      selectedBorderClass: 'border-brand-primary/60',
      titleStyle: {
        backgroundImage: 'linear-gradient(to right, var(--brand-primary), var(--brand-primary-end))'
      }
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
    <div className="rounded-lg border border-slate-500 bg-brand-glass/75 p-4">
      <div className="flex items-center justify-between gap-4">
        <h2
          className="bg-clip-text text-xl font-semibold text-transparent"
          style={tone.titleStyle}
        >
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
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-subtle" />
          <Input
            value={searchValue ?? ''}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}...`}
            className="pl-9"
            aria-label={`Search ${title.toLowerCase()}`}
          />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-3 p-4">
        {filteredRecords.length === 0 ? (
          <div className="rounded-lg bg-brand-glass p-4 text-sm text-brand-muted">
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
                  'flex w-full items-center gap-4 rounded-lg bg-brand-glass p-4 text-left transition-colors',
                  onRecordClick ? 'cursor-pointer hover:bg-brand-glass-hover' : '',
                  selectedRecordId === record.id
                    ? `border ${tone.selectedBorderClass}`
                    : 'border border-transparent'
                ].join(' ')}
              >
                <Icon size={20} className={['shrink-0', tone.iconClass].join(' ')} />
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
              </button>
            )
          })
        )}
      </div>

      {showFooterPagination && (
        <PaginationSelector
          page={page}
          totalPages={totalPages}
          onPrev={onPrev}
          onNext={onNext}
        />
      )}
    </div>
  )
}
