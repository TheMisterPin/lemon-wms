'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/layout/warehouse-header.md
 */

import Link from 'next/link'
import { Menu } from 'lucide-react'

import LemonHeader from '../../primitives/typography/lemon-header'

interface WarehouseHeaderProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
}

export function WarehouseHeader({ onMenuToggle, sidebarOpen }: WarehouseHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-dash-border bg-dash-shell px-4">
      <Link href="/warehouse" className="inline-flex items-center gap-2">
        <LemonHeader />
        <span className="text-sm font-medium text-dash-muted">Floor</span>
      </Link>

      {!sidebarOpen ? (
        <button
          type="button"
          onClick={onMenuToggle}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-dash-muted transition-colors hover:bg-dash-border hover:text-dash-text"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open sidebar</span>
        </button>
      ) : null}
    </header>
  )
}
