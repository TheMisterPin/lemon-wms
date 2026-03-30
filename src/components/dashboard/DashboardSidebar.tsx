'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ClipboardList,
  Users,
  BarChart3,
  MapPin
} from 'lucide-react'

const NAV_LINKS = [
  { label: 'Dashboard',  href: '/dashboard',            icon: LayoutDashboard },
  { label: 'Warehouses', href: '/dashboard/warehouses', icon: Warehouse },
  { label: 'Zones',      href: '/dashboard/zones',      icon: MapPin },
  { label: 'Items',      href: '/dashboard/items',      icon: Package },
  { label: 'Orders',     href: '/dashboard/orders',     icon: ClipboardList },
  { label: 'Users',      href: '/dashboard/users',      icon: Users },
  { label: 'Reports',    href: '/dashboard/reports',    icon: BarChart3 }
]

interface DashboardSidebarProps {
  onClose: () => void
}

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-dash-border bg-dash-card">
      <nav className="flex flex-col gap-0.5 p-3 pt-5">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-dash-muted">
          Navigation
        </p>
        {NAV_LINKS.map((link) => {
          const active =
            link.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(link.href)
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={[
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'border border-dash-amber/25 bg-dash-amber-dim text-dash-amber-text'
                  : 'border border-transparent text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
              ].join(' ')}
            >
              <Icon size={16} className="shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
