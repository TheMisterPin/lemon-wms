'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type WarehouseExpandableSearchProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  openButtonAriaLabel: string
  closeButtonAriaLabel: string
  className?: string
}

export function WarehouseExpandableSearch({
  value,
  onChange,
  placeholder,
  openButtonAriaLabel,
  closeButtonAriaLabel,
  className
}: WarehouseExpandableSearchProps) {
  const [isOpen, setIsOpen] = useState(value.trim().length > 0)
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const closeSearch = useCallback(() => {
    onChange('')
    setIsOpen(false)
  }, [onChange])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeSearch()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [closeSearch, isOpen])

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative h-9 shrink-0 overflow-hidden rounded-xl motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out',
        isOpen ? 'w-full min-w-0 sm:w-56' : 'w-9',
        className
      )}
    >
      {!isOpen ? (
        <Button
          type="button"
          aria-label={openButtonAriaLabel}
          variant="ghost"
          size="sm"
          className="h-9 w-full min-w-9 cursor-pointer rounded-xl p-0 motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:ease-out hover:opacity-90 active:scale-95"
          onClick={() => {
            setIsOpen(true)
            window.requestAnimationFrame(() => inputRef.current?.focus())
          }}
        >
          <Search className="size-4" />
        </Button>
      ) : (
        <div className="relative h-9 w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--wh-text-muted)' }} />
          <Input
            ref={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="h-9 w-full rounded-xl border pl-9 pr-9 text-sm motion-safe:transition-[box-shadow,opacity] motion-safe:duration-200"
            style={{
              background: 'var(--wh-card-bg)',
              borderColor: 'var(--wh-border)',
              color: 'var(--wh-text-primary)'
            }}
          />
          <button
            type="button"
            aria-label={closeButtonAriaLabel}
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md motion-safe:transition-colors motion-safe:duration-150"
            style={{ color: 'var(--wh-text-muted)' }}
            onClick={closeSearch}
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
