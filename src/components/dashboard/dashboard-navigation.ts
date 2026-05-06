import {
  BarChart2,
  ClipboardList,
  LayoutDashboard,
  Package,
  Users,
  Warehouse
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type DashboardNavLink = {
  label: string
  href: string
}

export type DashboardNavGroup = {
  label: string
  icon: LucideIcon
  href?: string
  links?: DashboardNavLink[]
}

type DashboardRouteMetadata = {
  label: string
  icon: LucideIcon
  segment?: string
  children?: Array<{
    label: string
    segment: string
  }>
}

function joinDashboardHref(segment?: string) {
  if (!segment || segment.trim() === '') {
    return '/dashboard'
  }

  return `/dashboard/${segment}`
}

function buildDashboardNavGroups(metadata: DashboardRouteMetadata[]): DashboardNavGroup[] {
  return metadata.map((node) => {
    if (!node.children || node.children.length === 0) {
      return {
        label: node.label,
        icon: node.icon,
        href: joinDashboardHref(node.segment)
      }
    }

    return {
      label: node.label,
      icon: node.icon,
      links: node.children.map((child) => ({
        label: child.label,
        href: joinDashboardHref(child.segment)
      }))
    }
  })
}

export const DASHBOARD_ROUTE_METADATA: DashboardRouteMetadata[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    segment: ''
  },
  {
    label: 'Locations',
    icon: Warehouse,
    children: [
      { label: 'Warehouses', segment: 'locations/warehouses' },
      { label: 'Zones', segment: 'locations/zones' },
      { label: 'Bins', segment: 'locations/bins' }
    ]
  },
  {
    label: 'Catalog',
    icon: Package,
    children: [
      { label: 'Items', segment: 'catalog/items' }
    ]
  },
  {
    label: 'Orders',
    icon: ClipboardList,
    children: [
      { label: 'Purchase Orders', segment: 'orders/purchase' }
    ]
  },
  {
    label: 'Stock',
    icon: BarChart2,
    children: [
      { label: 'Overview', segment: 'stock' }
    ]
  },
  {
    label: 'Auth',
    icon: Users,
    children: [
      { label: 'Users', segment: 'auth/users' },
      { label: 'Devices', segment: 'auth/devices' }
    ]
  }
]

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] =
  buildDashboardNavGroups(DASHBOARD_ROUTE_METADATA)

export function isRouteActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard'
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
