'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/pagination-selector.md
 */


import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export type PaginationPosition = 'header' | 'footer'

export interface PaginationSelectorProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  className?: string
}

export function PaginationSelector({
  page,
  totalPages,
  onPrev,
  onNext,
  className
}: PaginationSelectorProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      <button
        type="button"
        aria-label="Go to previous page"
        onClick={onPrev}
        disabled={page === 0}
        className="cursor-pointer rounded-md bg-dash-card2 p-1.5 text-dash-muted transition-colors hover:text-dash-text hover:bg-dash-bg disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-xs text-dash-muted tabular-nums">
        {page + 1} / {totalPages}
      </span>
      <button
        type="button"
        aria-label="Go to next page"
        onClick={onNext}
        disabled={page >= totalPages - 1}
        className="cursor-pointer rounded-md bg-dash-card2 p-1.5 text-dash-muted transition-colors hover:text-dash-text hover:bg-dash-bg disabled:cursor-not-allowed disabled:opacity-30"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
