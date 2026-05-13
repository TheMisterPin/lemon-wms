/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/misc/dashboard/dashboard-navigation.md
 */

import {
  BarChart2,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  Settings2,
  ShelvingUnit,
  Users,
  Warehouse
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type DashboardNavLink = {
  label: string
  href: string
  /** Optional icon shown next to the link label (e.g. Locations sub-links). */
  icon?: LucideIcon
  selectLocationVariant?: 'warehouse' | 'zone' | 'bin'
  /** Opens stock category picker instead of navigating (Stock hub only). */
  openStockCategoryModal?: boolean
  /** Opens stock subcategory picker instead of navigating (Stock hub only). */
  openStockSubcategoryModal?: boolean
  /** Opens Manage Locations modal (Locations hub, office roles only). */
  openManageLocationsModal?: boolean
}

export type DashboardNavGroup = {
  label: string
  icon: LucideIcon
  href?: string
  /** When set, child links render only while `pathname` is under this prefix (e.g. `/dashboard/locations`). */
  showChildLinksWhenPathPrefix?: string
  links?: DashboardNavLink[]
}

type DashboardRouteMetadata = {
  label: string
  icon: LucideIcon
  segment?: string
  showChildLinksWhenPathPrefix?: string
  children?: Array<{
    label: string
    segment?: string
    icon?: LucideIcon
    selectLocationVariant?: 'warehouse' | 'zone' | 'bin'
    openStockCategoryModal?: boolean
    openStockSubcategoryModal?: boolean
    openManageLocationsModal?: boolean
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
      href:
        node.segment !== undefined && node.segment !== null && node.segment !== ''
          ? joinDashboardHref(node.segment)
          : undefined,
      showChildLinksWhenPathPrefix: node.showChildLinksWhenPathPrefix,
      links: node.children.map((child) => ({
        label: child.label,
        icon: child.icon,
        href:
          child.openStockCategoryModal
            || child.openStockSubcategoryModal
            || child.openManageLocationsModal
            ? ''
            : child.segment
              ? joinDashboardHref(child.segment)
              : '',
        selectLocationVariant: child.selectLocationVariant,
        openStockCategoryModal: child.openStockCategoryModal,
        openStockSubcategoryModal: child.openStockSubcategoryModal,
        openManageLocationsModal: child.openManageLocationsModal
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
    segment: 'locations',
    showChildLinksWhenPathPrefix: '/dashboard/locations',
    children: [
      {
        label: 'Warehouses',
        segment: 'locations/warehouses',
        icon: Warehouse,
        selectLocationVariant: 'warehouse'
      },
      {
        label: 'Zones',
        segment: 'locations/zones',
        icon: MapPin,
        selectLocationVariant: 'zone'
      },
      {
        label: 'Bins',
        segment: 'locations/bins',
        icon: ShelvingUnit,
        selectLocationVariant: 'bin'
      },
      {
        label: 'Manage Locations',
        icon: Settings2,
        openManageLocationsModal: true
      }
    ]
  },
  {
    label: 'Orders',
    icon: ClipboardList,
    segment: 'orders',
    showChildLinksWhenPathPrefix: '/dashboard/orders',
    children: [
      { label: 'Sales Orders', segment: 'orders/sales' },
      { label: 'Purchase Orders', segment: 'orders/purchase' },
      { label: 'Transfer Orders', segment: 'orders/transfer' }
    ]
  },
  {
    label: 'Stock',
    icon: BarChart2,
    segment: 'stock',
    showChildLinksWhenPathPrefix: '/dashboard/stock',
    children: [
      { label: 'Categories', openStockCategoryModal: true },
      { label: 'Sub categories', openStockSubcategoryModal: true },
      { label: 'Health', segment: 'stock/health' }
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
