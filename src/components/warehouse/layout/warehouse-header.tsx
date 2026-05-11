'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/layout/warehouse-header.md
 */

import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import LemonHeader from '../../primitives/typography/lemon-header'

interface WarehouseHeaderProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
}

export function WarehouseHeader({ onMenuToggle, sidebarOpen }: WarehouseHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-brand-border bg-brand-surface px-4">
      <Link href="/warehouse" className="inline-flex items-center gap-2">
        <LemonHeader />
        <span className="text-sm font-medium text-brand-subtle">Floor</span>
      </Link>

      <button
        onClick={onMenuToggle}
        className="flex h-11 w-11 items-center justify-center rounded-xl text-brand-muted transition-colors hover:bg-brand-glass-hover hover:text-brand-text cursor-pointer"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle sidebar</span>
      </button>
    </header>
  )
}
