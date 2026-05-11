'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-sidebar.md
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react'
import {
  DASHBOARD_NAV_GROUPS,
  isRouteActive
} from '@/components/dashboard/primitives/dashboard-navigation'
import { SelectLocationModal } from '@/components/features/locations/shared/components/select-location-modal'
import { useSelectLocationModalData } from '@/components/features/locations/shared/hooks/use-select-location-modal-data'
import { SelectStockCategoryModal } from '@/components/features/stock/shared/components/select-stock-category-modal'
import { SelectStockSubcategoryModal } from '@/components/features/stock/shared/components/select-stock-subcategory-modal'
import { useTheme } from '@/components/shared/use-theme'
import { useStockCategoryTree } from '@/hooks/dashboard/stock/use-stock-category-tree'
import type { SelectLocationModalConfirmPayload, SelectLocationModalVariant } from '@/types/dto/locations/select-location-modal.types'

interface DashboardSidebarProps {
  onClose?: () => void
}

export default function DashboardSidebar({ onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const locationAreaActive = pathname.startsWith('/dashboard/locations')
  const stockAreaActive = pathname.startsWith('/dashboard/stock')
  const { tree, isLoading, error, refetch } = useSelectLocationModalData(locationAreaActive)
  const {
    tree: stockCategoryTree,
    isLoading: stockCategoryTreeLoading,
    error: stockCategoryTreeError,
    refetch: refetchStockCategoryTree
  } = useStockCategoryTree(stockAreaActive)

  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const [locationPickerVariant, setLocationPickerVariant] =
    useState<SelectLocationModalVariant>('warehouse')
  const [locationPickerSession, setLocationPickerSession] = useState(0)

  const [stockCategoryModalOpen, setStockCategoryModalOpen] = useState(false)
  const [stockCategoryModalSession, setStockCategoryModalSession] = useState(0)
  const [stockSubcategoryModalOpen, setStockSubcategoryModalOpen] = useState(false)
  const [stockSubcategoryModalSession, setStockSubcategoryModalSession] = useState(0)

  const activeGroups = useMemo(() => {
    const entries: Array<[string, boolean]> = DASHBOARD_NAV_GROUPS.map((group) => {
      const links = group.links ?? []
      const groupActive =
        (group.href ? isRouteActive(pathname, group.href) : false)
        || links.some(
          (link) => Boolean(link.href) && isRouteActive(pathname, link.href)
        )

      return [group.label, groupActive]
    })

    return Object.fromEntries(entries)
  }, [pathname])

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(activeGroups)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenGroups((current) => {
      let changed = false
      const next = { ...current }

      for (const [groupLabel, isActive] of Object.entries(activeGroups)) {
        if (isActive && !next[groupLabel]) {
          next[groupLabel] = true
          changed = true
        }
      }

      return changed ? next : current
    })
  }, [activeGroups])

  const openLocationPicker = (variant: SelectLocationModalVariant) => {
    setLocationPickerSession((session) => session + 1)
    setLocationPickerVariant(variant)
    setLocationPickerOpen(true)
  }

  const handleLocationConfirmed = (payload: SelectLocationModalConfirmPayload) => {
    onClose?.()

    if (payload.variant === 'warehouse') {
      router.push(`/dashboard/locations/warehouses/${payload.warehouseId}`)

      return
    }

    if (payload.variant === 'zone') {
      router.push(`/dashboard/locations/zones/${payload.zoneId}`)

      return
    }

    router.push(`/dashboard/locations/bins/${payload.binId}`)
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-dash-border bg-dash-shell">
      <nav className="flex flex-1 flex-col gap-0.5 p-4 pt-6">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-dash-muted">
          Navigation
        </p>
        {DASHBOARD_NAV_GROUPS.map((group) => {
          const Icon = group.icon
          const links = group.links ?? []
          const hasChildren = links.length > 0
          const groupActive = activeGroups[group.label] ?? false
          const useCollapsibleLocationNav =
            Boolean(
              group.href
              && group.showChildLinksWhenPathPrefix
              && hasChildren
            )
          const showLocationStyleChildren =
            Boolean(
              useCollapsibleLocationNav
              && group.showChildLinksWhenPathPrefix
              && pathname.startsWith(group.showChildLinksWhenPathPrefix)
            )

          if (useCollapsibleLocationNav && group.href) {
            return (
              <div key={group.label} className="space-y-0.5">
                <Link
                  href={group.href}
                  onClick={() => onClose?.()}
                  className={[
                    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                    groupActive
                      ? 'bg-dash-card2 text-dash-text'
                      : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                  ].join(' ')}
                >
                  <Icon size={18} className="shrink-0 opacity-90" />
                  {group.label}
                </Link>
                {showLocationStyleChildren ? (
                  <div className="ml-4 space-y-0.5 border-l border-dash-border pl-3">
                    {links.map((link) => {
                      if (link.selectLocationVariant) {
                        return (
                          <button
                            key={link.label}
                            type="button"
                            onClick={() => {
                              openLocationPicker(link.selectLocationVariant!)
                              onClose?.()
                            }}
                            className={[
                              'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                              'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                            ].join(' ')}
                          >
                            {link.label}
                          </button>
                        )
                      }

                      if (link.openStockCategoryModal) {
                        return (
                          <button
                            key={link.label}
                            type="button"
                            onClick={() => {
                              setStockCategoryModalSession((s) => s + 1)
                              setStockCategoryModalOpen(true)
                              onClose?.()
                            }}
                            className={[
                              'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                              'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                            ].join(' ')}
                          >
                            {link.label}
                          </button>
                        )
                      }

                      if (link.openStockSubcategoryModal) {
                        return (
                          <button
                            key={link.label}
                            type="button"
                            onClick={() => {
                              setStockSubcategoryModalSession((s) => s + 1)
                              setStockSubcategoryModalOpen(true)
                              onClose?.()
                            }}
                            className={[
                              'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                              'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                            ].join(' ')}
                          >
                            {link.label}
                          </button>
                        )
                      }

                      if (!link.href) {
                        return null
                      }

                      const linkActive = isRouteActive(pathname, link.href)

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => onClose?.()}
                          className={[
                            'block rounded-md px-3 py-2 text-sm transition-colors duration-200',
                            linkActive
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
            )
          }

          if (!hasChildren && group.href) {
            return (
              <Link
                key={group.label}
                href={group.href}
                onClick={() => onClose?.()}
                className={[
                  'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                  groupActive
                    ? 'bg-dash-card2 text-dash-text'
                    : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                ].join(' ')}
              >
                <Icon size={18} className="shrink-0 opacity-90" />
                {group.label}
              </Link>
            )
          }

          return (
            <details
              key={group.label}
              className="group/nav-section rounded-md"
              open={openGroups[group.label] ?? groupActive}
              onToggle={(event) => {
                const target = event.currentTarget as HTMLDetailsElement

                setOpenGroups((current) => ({
                  ...current,
                  [group.label]: target.open
                }))
              }}
            >
              <summary
                className={[
                  'flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 [&::-webkit-details-marker]:hidden',
                  groupActive
                    ? 'bg-dash-card2 text-dash-text'
                    : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                ].join(' ')}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className="shrink-0 opacity-90" />
                  {group.label}
                </span>
                <ChevronDown
                  size={16}
                  className="shrink-0 opacity-70 transition-transform duration-200 group-open/nav-section:rotate-180"
                />
              </summary>
              <div className="grid grid-rows-[0fr] transition-all duration-200 ease-out group-open/nav-section:grid-rows-[1fr]">
                <div className="mt-1 space-y-1 overflow-hidden pl-10">
                  {links.map((link) => {
                    if (link.selectLocationVariant) {
                      return (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() => {
                            openLocationPicker(link.selectLocationVariant!)
                            onClose?.()
                          }}
                          className={[
                            'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                            'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {link.label}
                        </button>
                      )
                    }

                    if (link.openStockCategoryModal) {
                      return (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() => {
                            setStockCategoryModalSession((s) => s + 1)
                            setStockCategoryModalOpen(true)
                            onClose?.()
                          }}
                          className={[
                            'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                            'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {link.label}
                        </button>
                      )
                    }

                    if (link.openStockSubcategoryModal) {
                      return (
                        <button
                          key={link.label}
                          type="button"
                          onClick={() => {
                            setStockSubcategoryModalSession((s) => s + 1)
                            setStockSubcategoryModalOpen(true)
                            onClose?.()
                          }}
                          className={[
                            'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                            'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {link.label}
                        </button>
                      )
                    }

                    if (!link.href) {
                      return null
                    }

                    const linkActive = isRouteActive(pathname, link.href)

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => onClose?.()}
                        className={[
                          'block rounded-md px-3 py-2 text-sm transition-colors duration-200',
                          linkActive
                            ? 'bg-dash-card2 text-dash-text'
                            : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                        ].join(' ')}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </details>
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

      <SelectLocationModal
        key={locationPickerSession}
        open={locationPickerOpen}
        onOpenChange={setLocationPickerOpen}
        variant={locationPickerVariant}
        warehouses={tree}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
        onConfirm={handleLocationConfirmed}
      />

      <SelectStockCategoryModal
        key={stockCategoryModalSession}
        open={stockCategoryModalOpen}
        onOpenChange={setStockCategoryModalOpen}
        parents={stockCategoryTree?.parents ?? []}
        isLoading={stockCategoryTreeLoading}
        error={stockCategoryTreeError}
        onRefetch={() => {
          void refetchStockCategoryTree()
        }}
        onConfirm={(parentCode) => {
          router.push(`/dashboard/stock/categories/${encodeURIComponent(parentCode)}`)
        }}
      />

      <SelectStockSubcategoryModal
        key={stockSubcategoryModalSession}
        open={stockSubcategoryModalOpen}
        onOpenChange={setStockSubcategoryModalOpen}
        tree={stockCategoryTree}
        isLoading={stockCategoryTreeLoading}
        error={stockCategoryTreeError}
        onRefetch={() => {
          void refetchStockCategoryTree()
        }}
        onConfirm={(subcategoryCode) => {
          router.push(`/dashboard/stock/subcategory/${encodeURIComponent(subcategoryCode)}`)
        }}
      />
    </div>
  )
}
