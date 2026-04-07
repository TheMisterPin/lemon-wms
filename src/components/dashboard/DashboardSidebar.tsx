'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Warehouse,
  Package,
  // ClipboardList,
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
  // { label: 'Orders',     href: '/dashboard/orders',     icon: ClipboardList },
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
    <div className="flex h-full w-64 flex-col border-r border-brand-glass-border bg-brand-surface/90 backdrop-blur-md">
      <nav className="flex flex-1 flex-col gap-1 p-4 pt-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-brand-subtle">
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
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-linear-to-r from-brand-primary/15 to-brand-primary-end/10 text-brand-primary border border-brand-primary/20 shadow-sm shadow-brand-primary/5'
                  : 'border border-transparent text-brand-muted hover:bg-brand-glass-hover hover:text-brand-text'
              ].join(' ')}
            >
              <Icon size={18} className="shrink-0" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-brand-glass-border p-4">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-muted transition-all duration-200 border border-transparent hover:bg-brand-glass-hover hover:text-brand-text cursor-pointer"
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
