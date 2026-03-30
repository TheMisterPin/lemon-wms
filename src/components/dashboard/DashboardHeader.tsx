'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import LemonHeader from '../typography/lemon-header'

export default function DashboardHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4">
      {/* Logo */}
      <Link href="/" className="inline-flex items-center gap-2">
        <LemonHeader />
      </Link>

      {/* Sidebar trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 p-0">
          <nav className="flex flex-col gap-1 p-4 pt-6">
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Navigation
            </p>
            {[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Warehouses', href: '/dashboard/warehouses' },
              { label: 'Items', href: '/dashboard/items' },
              { label: 'Orders', href: '/dashboard/orders' },
              { label: 'Users', href: '/dashboard/users' },
              { label: 'Reports', href: '/dashboard/reports' }
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
