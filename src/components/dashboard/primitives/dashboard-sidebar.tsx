'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-sidebar.md
 */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import axios from 'axios'
import {
  ChevronDown,
  FlaskConical,
  Moon,
  PanelLeftClose,
  Sun
} from 'lucide-react'

import {
  DASHBOARD_NAV_GROUPS,
  isRouteActive
} from '@/components/dashboard/primitives/dashboard-navigation'
import { ManageLocationsModal } from '@/components/features/locations/shared/components/manage-locations-modal'
import { SelectLocationModal } from '@/components/features/locations/shared/components/select-location-modal'
import { useSelectLocationModalData } from '@/components/features/locations/shared/hooks/use-select-location-modal-data'
import { AddProgressModal } from '@/components/features/simulation/add-progress-modal'
import { SimulationModal } from '@/components/features/simulation/simulation-modal'
import { SelectStockCategoryModal } from '@/components/features/stock/shared/components/select-stock-category-modal'
import { SelectStockSubcategoryModal } from '@/components/features/stock/shared/components/select-stock-subcategory-modal'
import { useTheme } from '@/components/shared/use-theme'
import { useStockCategoryTree } from '@/hooks/dashboard/stock/use-stock-category-tree'
import { useAuth } from '@/lib/auth/use-auth'
import type { SimulateActiveFloorUsersResult } from '@/lib/simulation/simulate-active-floor-users'
import { closeSidebarIfMobile } from '@/lib/utils'
import type { SelectLocationModalConfirmPayload, SelectLocationModalVariant } from '@/types/dto/locations/select-location-modal.types'
import type { ApiResponse } from '@/types/responses/basic-response'

interface DashboardSidebarProps {
  onClose?: () => void
  isDemoEnabled?: boolean
  onToggleCollapse?: () => void
  isExpanded?: boolean
}

export default function DashboardSidebar({
  onClose,
  isDemoEnabled,
  onToggleCollapse,
  isExpanded
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { isOfficeRole } = useAuth()
  const locationAreaActive = pathname.startsWith('/dashboard/locations')
  const stockAreaActive = pathname.startsWith('/dashboard/stock')
  const { tree, isLoading, error, refetch } = useSelectLocationModalData(locationAreaActive)
  const {
    tree: stockCategoryTree,
    isLoading: stockCategoryTreeLoading,
    error: stockCategoryTreeError,
    refetch: refetchStockCategoryTree
  } = useStockCategoryTree(stockAreaActive)

  const [simulationOpen, setSimulationOpen] = useState(false)
  const [simulationSectionOpen, setSimulationSectionOpen] = useState(false)
  const [simulateActiveUsersBusy, setSimulateActiveUsersBusy] = useState(false)
  const [simulateActiveUsersNotice, setSimulateActiveUsersNotice] = useState<string | null>(null)
  const [addProgressModalOpen, setAddProgressModalOpen] = useState(false)
  const [addProgressSession, setAddProgressSession] = useState(0)
  const [locationPickerOpen, setLocationPickerOpen] = useState(false)
  const [locationPickerVariant, setLocationPickerVariant] =
    useState<SelectLocationModalVariant>('warehouse')
  const [locationPickerSession, setLocationPickerSession] = useState(0)

  const [stockCategoryModalOpen, setStockCategoryModalOpen] = useState(false)
  const [stockCategoryModalSession, setStockCategoryModalSession] = useState(0)
  const [stockSubcategoryModalOpen, setStockSubcategoryModalOpen] = useState(false)
  const [stockSubcategoryModalSession, setStockSubcategoryModalSession] = useState(0)

  const [manageLocationsOpen, setManageLocationsOpen] = useState(false)
  const [manageLocationsSession, setManageLocationsSession] = useState(0)

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
    closeSidebarIfMobile(onClose)

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
        <div className="mb-3 flex items-center justify-between gap-2 px-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-dash-muted">
            Navigation
          </p>
          {isExpanded && onToggleCollapse ? (
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
                  prefetch={false}
                  href={group.href}
                  onClick={() => closeSidebarIfMobile(onClose)}
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
                    {links.map((link, linkIndex) => {
                      const SubIcon = link.icon

                      if (link.openManageLocationsModal) {
                        if (!isOfficeRole) {
                          return null
                        }

                        return (
                          <button
                            key={`${group.label}:lnk:${linkIndex}`}
                            type="button"
                            onClick={() => {
                              setManageLocationsSession((s) => s + 1)
                              setManageLocationsOpen(true)
                              closeSidebarIfMobile(onClose)
                            }}
                            className={[
                              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                              'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                            ].join(' ')}
                          >
                            {SubIcon ? (
                              <SubIcon size={16} className="shrink-0 opacity-80" />
                            ) : null}
                            {link.label}
                          </button>
                        )
                      }

                      if (link.selectLocationVariant) {
                        return (
                          <button
                            key={`${group.label}:lnk:${linkIndex}`}
                            type="button"
                            onClick={() => {
                              openLocationPicker(link.selectLocationVariant!)
                              closeSidebarIfMobile(onClose)
                            }}
                            className={[
                              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                              'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                            ].join(' ')}
                          >
                            {SubIcon ? (
                              <SubIcon size={16} className="shrink-0 opacity-80" />
                            ) : null}
                            {link.label}
                          </button>
                        )
                      }

                      if (link.openStockCategoryModal) {
                        return (
                          <button
                            key={`${group.label}:lnk:${linkIndex}`}
                            type="button"
                            onClick={() => {
                              setStockCategoryModalSession((s) => s + 1)
                              setStockCategoryModalOpen(true)
                              closeSidebarIfMobile(onClose)
                            }}
                            className={[
                              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                              'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                            ].join(' ')}
                          >
                            {SubIcon ? (
                              <SubIcon size={16} className="shrink-0 opacity-80" />
                            ) : null}
                            {link.label}
                          </button>
                        )
                      }

                      if (link.openStockSubcategoryModal) {
                        return (
                          <button
                            key={`${group.label}:lnk:${linkIndex}`}
                            type="button"
                            onClick={() => {
                              setStockSubcategoryModalSession((s) => s + 1)
                              setStockSubcategoryModalOpen(true)
                              closeSidebarIfMobile(onClose)
                            }}
                            className={[
                              'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                              'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                            ].join(' ')}
                          >
                            {SubIcon ? (
                              <SubIcon size={16} className="shrink-0 opacity-80" />
                            ) : null}
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
                          key={`${group.label}:lnk:${linkIndex}:${link.href}`}
                          prefetch={false}
                          href={link.href}
                          onClick={() => closeSidebarIfMobile(onClose)}
                          className={[
                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200',
                            linkActive
                              ? 'bg-dash-card2 text-dash-text'
                              : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {SubIcon ? (
                            <SubIcon size={16} className="shrink-0 opacity-80" />
                          ) : null}
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
                prefetch={false}
                href={group.href}
                onClick={() => closeSidebarIfMobile(onClose)}
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
                  {links.map((link, linkIndex) => {
                    const SubIcon = link.icon

                    if (link.openManageLocationsModal) {
                      if (!isOfficeRole) {
                        return null
                      }

                      return (
                        <button
                          key={`${group.label}:lnk:${linkIndex}`}
                          type="button"
                          onClick={() => {
                            setManageLocationsSession((s) => s + 1)
                            setManageLocationsOpen(true)
                            closeSidebarIfMobile(onClose)
                          }}
                          className={[
                            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                            'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {SubIcon ? (
                            <SubIcon size={16} className="shrink-0 opacity-80" />
                          ) : null}
                          {link.label}
                        </button>
                      )
                    }

                    if (link.selectLocationVariant) {
                      return (
                        <button
                          key={`${group.label}:lnk:${linkIndex}`}
                          type="button"
                          onClick={() => {
                            openLocationPicker(link.selectLocationVariant!)
                            closeSidebarIfMobile(onClose)
                          }}
                          className={[
                            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                            'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {SubIcon ? (
                            <SubIcon size={16} className="shrink-0 opacity-80" />
                          ) : null}
                          {link.label}
                        </button>
                      )
                    }

                    if (link.openStockCategoryModal) {
                      return (
                        <button
                          key={`${group.label}:lnk:${linkIndex}`}
                          type="button"
                          onClick={() => {
                            setStockCategoryModalSession((s) => s + 1)
                            setStockCategoryModalOpen(true)
                            closeSidebarIfMobile(onClose)
                          }}
                          className={[
                            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                            'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {SubIcon ? (
                            <SubIcon size={16} className="shrink-0 opacity-80" />
                          ) : null}
                          {link.label}
                        </button>
                      )
                    }

                    if (link.openStockSubcategoryModal) {
                      return (
                        <button
                          key={`${group.label}:lnk:${linkIndex}`}
                          type="button"
                          onClick={() => {
                            setStockSubcategoryModalSession((s) => s + 1)
                            setStockSubcategoryModalOpen(true)
                            closeSidebarIfMobile(onClose)
                          }}
                          className={[
                            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                            'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                          ].join(' ')}
                        >
                          {SubIcon ? (
                            <SubIcon size={16} className="shrink-0 opacity-80" />
                          ) : null}
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
                        key={`${group.label}:lnk:${linkIndex}:${link.href}`}
                        prefetch={false}
                        href={link.href}
                        onClick={() => closeSidebarIfMobile(onClose)}
                        className={[
                          'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors duration-200',
                          linkActive
                            ? 'bg-dash-card2 text-dash-text'
                            : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                        ].join(' ')}
                      >
                        {SubIcon ? (
                          <SubIcon size={16} className="shrink-0 opacity-80" />
                        ) : null}
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

      {isDemoEnabled && (
        <div className="border-t border-dash-border p-4">
          <details
            className="group/nav-section rounded-md"
            open={simulationSectionOpen}
            onToggle={(event) => {
              const target = event.currentTarget as HTMLDetailsElement
              setSimulationSectionOpen(target.open)
            }}
          >
            <summary
              className={[
                'flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 [&::-webkit-details-marker]:hidden',
                simulationSectionOpen
                  ? 'bg-dash-card2 text-dash-text'
                  : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
              ].join(' ')}
            >
              <span className="flex items-center gap-3">
                <FlaskConical size={18} className="shrink-0 opacity-90" />
                Simulation
              </span>
              <ChevronDown
                size={16}
                className="shrink-0 opacity-70 transition-transform duration-200 group-open/nav-section:rotate-180"
              />
            </summary>
            <div className="grid grid-rows-[0fr] transition-all duration-200 ease-out group-open/nav-section:grid-rows-[1fr]">
              <div className="mt-1 overflow-hidden">
                <div className="ml-4 space-y-0.5 border-l border-dash-border pl-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSimulationOpen(true)
                      closeSidebarIfMobile(onClose)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-dash-muted transition-colors duration-200 hover:bg-dash-card2 hover:text-dash-text"
                  >
                    Purchase Order
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddProgressSession((s) => s + 1)
                      setAddProgressModalOpen(true)
                      closeSidebarIfMobile(onClose)
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-dash-muted transition-colors duration-200 hover:bg-dash-card2 hover:text-dash-text"
                  >
                    Add progress
                  </button>
                  <button
                    type="button"
                    disabled={simulateActiveUsersBusy}
                    onClick={() => {
                      void (async () => {
                        setSimulateActiveUsersBusy(true)
                        setSimulateActiveUsersNotice(null)
                        try {
                          const res = await axios.post<ApiResponse<SimulateActiveFloorUsersResult>>(
                            '/api/simulation/active-floor-users'
                          )
                          if (!res.data.success || !res.data.data) {
                            setSimulateActiveUsersNotice(res.data.message ?? 'Simulation failed.')

                            return
                          }

                          const rows = res.data.data.warehouses
                          const updated = rows.filter((w) => w.action === 'updated')
                          const skipped = rows.filter((w) => w.action === 'skipped_had_active')
                          const usersActivated = updated.reduce(
                            (sum, w) => sum + w.userIdsActivated.length,
                            0
                          )

                          setSimulateActiveUsersNotice(
                            usersActivated > 0
                              ? `Marked ${usersActivated} user(s) logged in across ${updated.length} warehouse(s). Skipped ${skipped.length} warehouse(s) that already had active users.`
                              : `No users activated (${skipped.length} warehouse(s) already had active floor users, or no eligible assignments).`
                          )
                        } catch {
                          setSimulateActiveUsersNotice('Request failed.')
                        } finally {
                          setSimulateActiveUsersBusy(false)
                        }
                      })()
                    }}
                    className={[
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-200',
                      simulateActiveUsersBusy
                        ? 'cursor-not-allowed text-dash-muted opacity-60'
                        : 'text-dash-muted hover:bg-dash-card2 hover:text-dash-text'
                    ].join(' ')}
                  >
                    Simulate Active Users
                  </button>
                  {simulateActiveUsersNotice ? (
                    <p className="px-3 pb-1 text-xs leading-snug text-dash-muted">
                      {simulateActiveUsersNotice}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

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

      {isDemoEnabled && (
        <>
          <AddProgressModal
            key={`dashboard-add-progress-${addProgressSession}`}
            open={addProgressModalOpen}
            onOpenChange={setAddProgressModalOpen}
          />
          <SimulationModal key="dashboard-simulation" open={simulationOpen} onOpenChange={setSimulationOpen} />
        </>
      )}

      <SelectLocationModal
        key={`dashboard-select-location-${locationPickerSession}`}
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
        key={`dashboard-select-stock-category-${stockCategoryModalSession}`}
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
        key={`dashboard-select-stock-subcategory-${stockSubcategoryModalSession}`}
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

      <ManageLocationsModal
        key={`dashboard-manage-locations-${manageLocationsSession}`}
        open={manageLocationsOpen}
        onOpenChange={setManageLocationsOpen}
      />
    </div>
  )
}
