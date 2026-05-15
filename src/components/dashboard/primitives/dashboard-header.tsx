'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-header.md
 */

import Link from 'next/link'
import { Menu } from 'lucide-react'

import LemonHeader from '@/components/primitives/typography/lemon-header'

interface DashboardHeaderProps {
  onMenuToggle?: () => void
  sidebarOpen?: boolean
}

export default function DashboardHeader({ onMenuToggle, sidebarOpen }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-dash-border bg-dash-shell px-4">
      <Link prefetch={false} href="/dashboard" className="inline-flex items-center gap-2">
        <LemonHeader />
      </Link>

      {sidebarOpen === false && onMenuToggle ? (
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
