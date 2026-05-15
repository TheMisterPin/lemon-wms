'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/home/warehouse-home-page-view.md
 */

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  typeLabel,
  WarehouseOrderPoolHeader,
  WarehouseOrderPoolHeaderActions,
  WarehouseOrderPoolKpis,
  WarehouseOrderPoolSection,
  WarehouseOrderPoolToolbar
} from '@/components/warehouse/orders/order-pool-components'
import { useWarehouseHome } from '@/components/warehouse/orders/use-warehouse-home'
import { useWarehouseOrderPool } from '@/components/warehouse/orders/use-warehouse-order-pool'
import { WarehouseHomePageSkeleton } from '@/components/warehouse/orders/warehouse-home-page-skeleton'

export function WarehouseOrdersPageView() {
  const {
    isLoading,
    error,
    refetch,
    orders,
    summary,
    warehouseInfo,
    user,
    activeExecutingOrder
  } = useWarehouseHome()
  const pool = useWarehouseOrderPool({
    activeExecutingOrder,
    currentUserId: user?.userId ?? null,
    orders: orders.rawRecords,
    onActionComplete: () => refetch()
  })

  if (isLoading) {
    return <WarehouseHomePageSkeleton />
  }

  if (error) {
    return (
      <main className="min-h-full p-4 pb-20 xl:p-6 xl:pb-20" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-10 text-center"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--wh-status-blocked)' }}>{error}</p>
          <Button type="button" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      </main>
    )
  }

  const replaceTarget = pool.pendingReplaceStartOrder

  return (
    <>
      <main
        className="min-h-full p-3 pb-20 md:h-full md:overflow-hidden md:p-4 xl:p-5"
        style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
      >
        <div className="mx-auto flex h-full max-w-7xl flex-col gap-3 md:gap-4">
          <WarehouseOrderPoolHeader warehouseName={warehouseInfo?.warehouseName ?? ''} />
          <WarehouseOrderPoolKpis
            activeExecutingOrder={activeExecutingOrder}
            activeOrders={summary.activeOrders}
            lastUserOrder={pool.lastUserOrder}
            nextReadyOrder={pool.nextReadyOrder}
            pausedOrders={summary.pausedOrders}
            readyOrders={summary.releasedOrders}
            totalOrders={summary.totalOrders}
            onPauseActive={
              activeExecutingOrder
              && activeExecutingOrder.status === 'EXECUTING'
              && activeExecutingOrder.assignedUserId === user?.userId
                ? () => void pool.runAction(activeExecutingOrder)
                : undefined
            }
            onStatusClick={pool.filterBySingleStatus}
            onStartOrder={(order) => void pool.runAction(order)}
          />
          <WarehouseOrderPoolSection
            actingId={pool.actingId}
            currentUserId={user?.userId ?? null}
            onClearFilters={pool.clearFilters}
            headerActions={
              <WarehouseOrderPoolHeaderActions
                page={pool.safePage}
                searchText={pool.searchText}
                totalPages={pool.totalPages}
                onNext={pool.onNext}
                onPrev={pool.onPrev}
                onSearchChange={pool.setSearchText}
              />
            }
            orderCount={pool.visibleOrders.length}
            pageOrders={pool.pageOrders}
            onAction={(order) => void pool.runAction(order)}
            toolbar={
              <WarehouseOrderPoolToolbar
                availablePoolOnly={pool.availablePoolOnly}
                completionSort={pool.completionSort}
                myOrdersOnly={pool.myOrdersOnly}
                searchText={pool.searchText}
                selectedStatuses={pool.selectedStatuses}
                selectedTypes={pool.selectedTypes}
                sortBaseline={pool.sortBaseline}
                onAvailablePoolToggle={pool.toggleAvailablePool}
                onCompletionSortCycle={pool.cycleCompletionSort}
                onEnableAvailablePoolOnly={pool.enableAvailablePoolOnly}
                onMyOrdersToggle={pool.toggleMyOrdersOnly}
                onResetCompletionSort={pool.resetCompletionSort}
                onSearchClear={() => pool.setSearchText('')}
                onSortBaselineChange={pool.setSortBaseline}
                onStatusToggle={pool.toggleStatus}
                onTypeToggle={pool.toggleType}
              />
            }
          />
        </div>
      </main>

      <Dialog
        open={replaceTarget !== null && activeExecutingOrder !== null}
        onOpenChange={(open) => {
          if (!open) {
            pool.cancelReplaceStartOrder()
          }
        }}
      >
        <DialogContent className="border-dash-border bg-dash-shell text-dash-text sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Switch active order?</DialogTitle>
            <DialogDescription className="text-dash-muted">
              {activeExecutingOrder ? (
                <>
                  You are currently assigned to the{' '}
                  <span className="font-medium text-dash-text">{typeLabel(activeExecutingOrder.type)}</span>{' '}
                  order ({activeExecutingOrder.reference}). Starting{' '}
                  {replaceTarget ? (
                    <span className="font-medium text-dash-text">{replaceTarget.reference}</span>
                  ) : (
                    'this order'
                  )}
                  {' '}will pause the current assignment. Would you like to proceed?
                </>
              ) : (
                'Starting this order may pause another assignment. Proceed?'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="cursor-pointer" onClick={pool.cancelReplaceStartOrder}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="brand"
              className="cursor-pointer"
              disabled={pool.actingId !== null}
              onClick={() => void pool.confirmReplaceStartOrder()}
            >
              Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
