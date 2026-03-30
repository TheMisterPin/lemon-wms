import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Warehouses', href: '/dashboard/warehouses' },
  { label: 'Items', href: '/dashboard/items' },
  { label: 'Orders', href: '/dashboard/orders' },
  { label: 'Users', href: '/dashboard/users' },
  { label: 'Reports', href: '/dashboard/reports' },
]

interface DashboardSidebarProps {
  onClose: () => void
}

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col border-r border-brand-border bg-brand-surface">
      <nav className="flex flex-col gap-0.5 p-3 pt-5">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-brand-subtle">
          Navigation
        </p>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-brand-muted transition-colors hover:bg-brand-border hover:text-brand-text"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
