'use client'

import Link from 'next/link'
import LemonHeader from '../typography/lemon-header'

interface DashboardHeaderProps {
  onMenuToggle?: () => void
  sidebarOpen?: boolean
}

export default function DashboardHeader({}: DashboardHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-dash-border bg-dash-shell px-4">
      <Link href="/dashboard" className="inline-flex items-center gap-2">
        <LemonHeader />
      </Link>
    </header>
  )
}
