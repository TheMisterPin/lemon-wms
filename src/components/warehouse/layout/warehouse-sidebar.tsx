'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/layout/warehouse-sidebar.md
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Boxes,
  ClipboardList,
  HomeIcon,
  Moon,
  PanelLeftClose,
  Sun
} from 'lucide-react'

import { useTheme } from '@/components/shared/use-theme'
import { cn, closeSidebarIfMobile } from '@/lib/utils'

const ORDER_POOL_LINKS = [
  { label: 'Purchase', href: '/warehouse/orders/purchase' },
  { label: 'Sales', href: '/warehouse/orders/sales' },
  { label: 'Transfer', href: '/warehouse/orders/transfer' }
]

interface WarehouseSidebarProps {
  onClose: () => void
  onToggleCollapse: () => void
  isExpanded: boolean
}

export function WarehouseSidebar({
  onClose,
  onToggleCollapse,
  isExpanded
}: WarehouseSidebarProps) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const homeActive = pathname === '/warehouse'
  const poolSectionActive =
    pathname === '/warehouse/orders'
    || pathname.startsWith('/warehouse/orders')

  const showOrderTypeLinks = pathname.startsWith('/warehouse/orders')

  const binsActive = pathname.startsWith('/warehouse/bins')

  return (
    <div className="flex h-full w-64 flex-col border-r border-dash-border bg-dash-shell">
      <nav className="flex flex-1 flex-col gap-0.5 p-4 pt-6">
        <div className="mb-3 flex items-center justify-between gap-2 px-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-dash-muted">
            Floor
          </p>
          {isExpanded ? (
            <button
              type="button"
              aria-label="Collapse sidebar"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-dash-muted transition-colors hover:bg-dash-border hover:text-dash-text"
              onClick={onToggleCollapse}
            >
              <PanelLeftClose className="size-5" />
            </button>
          ) : null}
        </div>
        <Link
          href="/warehouse"
          prefetch={false}
          onClick={() => closeSidebarIfMobile(onClose)}
          className={[
            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200',
            homeActive
              ? 'bg-dash-card2 text-dash-text'
              : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
          ].join(' ')}
        >
          <HomeIcon size={18} className="shrink-0 opacity-90" />
          <span className="text-sm font-medium">Warehouse Home</span>
        </Link>

        <div className="space-y-0.5">
          <Link
            href="/warehouse/orders"
            prefetch={false}
            onClick={() => closeSidebarIfMobile(onClose)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200',
              poolSectionActive
                ? 'bg-dash-card2 text-dash-text'
                : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
            )}
          >
            <ClipboardList size={18} className="shrink-0 opacity-90" />
            Order pool
          </Link>

          {showOrderTypeLinks ? (
            <div className="ml-4 space-y-0.5 border-l border-dash-border pl-3">
              {ORDER_POOL_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    onClick={() => closeSidebarIfMobile(onClose)}
                    className={[
                      'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200',
                      active
                        ? 'bg-dash-card2 text-dash-text'
                        : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                    ].join(' ')}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>

        <Link
          href="/warehouse/bins"
          prefetch={false}
          onClick={() => closeSidebarIfMobile(onClose)}
          className={[
            'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200',
            binsActive
              ? 'bg-dash-card2 text-dash-text'
              : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
          ].join(' ')}
        >
          <Boxes size={18} className="shrink-0 opacity-90" />
          Bins
        </Link>
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
