'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Warehouse,
  Package,
  ClipboardList,
  Users,
  // BarChart3,
  MapPin,
  ShelvingUnit,
  TabletSmartphone,
  Sun,
  Moon
} from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

const NAV_LINKS = [
  { label: 'Dashboard',  href: '/dashboard',            icon: LayoutDashboard },
  { label: 'Warehouses', href: '/dashboard/warehouses', icon: Warehouse },
  { label: 'Zones',      href: '/dashboard/zones',      icon: MapPin },
  { label: 'Bins',       href: '/dashboard/bins',       icon: ShelvingUnit },
  { label: 'Items',      href: '/dashboard/items',      icon: Package },
  { label: 'Orders',     href: '/dashboard/orders',     icon: ClipboardList },
  { label: 'Users',      href: '/dashboard/users',      icon: Users },
  { label: 'Devices',     href: '/dashboard/devices',     icon: TabletSmartphone }
  // { label: 'Reports',    href: '/dashboard/reports',    icon: BarChart3 }
]

interface DashboardSidebarProps {
  onClose?: () => void
}

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-full w-64 flex-col border-r border-dash-border bg-dash-shell">
      <nav className="flex flex-1 flex-col gap-0.5 p-4 pt-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-dash-muted">
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
              onClick={() => onClose?.()}
              className={[
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                active
                  ? 'bg-dash-card2 text-dash-text'
                  : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
              ].join(' ')}
            >
              <Icon size={18} className="shrink-0 opacity-90" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-dash-border p-4">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-dash-muted transition-colors duration-200 hover:bg-dash-card2 hover:text-dash-text"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="shrink-0" />
          ) : (
            <Moon size={18} className="shrink-0" />
          )}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </div>
  )
}
