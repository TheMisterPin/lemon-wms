'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import LemonHeader from '../typography/lemon-header'

interface DashboardHeaderProps {
  onMenuToggle: () => void
  sidebarOpen: boolean
}

export default function DashboardHeader({ onMenuToggle, sidebarOpen }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-brand-border bg-brand-surface px-4">
      <Link href="/dashboard" className="inline-flex items-center gap-2">
        <LemonHeader />
      </Link>

      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        className="h-9 w-9 text-brand-muted hover:bg-brand-border hover:text-brand-text"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    </header>
  )
}
