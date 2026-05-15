'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/warehouse/layout/warehouse-footer.md
 */

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, LayoutDashboard, ShoppingCart, UserCircle } from 'lucide-react'

import NumericKeypad from '@/components/shared/numeric-keypad'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { useMoveItems } from '@/components/warehouse/layout/use-move-items'
import { WarehouseZonePicker } from '@/components/warehouse/layout/warehouse-zone-picker'
import { Role } from '@/generated/prisma'
import { useAuthStore } from '@/lib/auth/store'
import { useAuth } from '@/lib/auth/use-auth'
import { warehouseApiClient } from '@/lib/axios'
import type { AuthUser } from '@/types'
import type { ApiResponse } from '@/types/responses/basic-response'

type WarehouseFooterUserResponse = {
  user?: {
    name?: string
  }
}

type WarehouseFooterProps = {
  isDemoEnabled?: boolean
}

type DemoLoginApiResponse = {
  accessToken: string
  user: AuthUser
  location?: {
    warehouseId?: string
    zoneId?: string
  }
  device?: {
    id: string
    name: string
    code: string
    warehouseId?: string
    zoneId?: string
  }
  error?: string
}

export function WarehouseFooter({ isDemoEnabled }: WarehouseFooterProps) {
  const router = useRouter()
  const params = useParams<{ id?: string }>()
  const destinationBinId = typeof params?.id === 'string' ? params.id : null
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setAuth = useAuthStore((s) => s.setAuth)
  const device = useAuthStore((s) => s.device)
  const { user, isOfficeRole, isOwner } = useAuth()
  const [resolvedUserName, setResolvedUserName] = useState<string | null>(user?.fullName ?? null)
  const [swapLoading, setSwapLoading] = useState(false)
  const displayName = resolvedUserName || user?.fullName || 'Signed in'

  const {
    trolleyItems,
    selectedIds,
    isSheetOpen,
    isLoading,
    isSubmitting,
    error,
    setSheetOpen,
    refreshTrolley,
    toggleSelection,
    clearSelection,
    unloadSelectedToBin
  } = useMoveItems()
  const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false)
  const [quantityToUnload, setQuantityToUnload] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const selectedItems = useMemo(
    () => trolleyItems.filter((item) => selectedIds.includes(item.id)),
    [selectedIds, trolleyItems]
  )

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  const showOwnerDashboardDemo = Boolean(isDemoEnabled && isOwner)
  const showDashboardNav = isOfficeRole && !showOwnerDashboardDemo

  const handleOwnerDemoDashboard = async () => {
    setSwapLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      clearAuth()

      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: Role.OWNER, surface: 'dashboard' })
      })
      const data = (await res.json()) as DemoLoginApiResponse

      if (!res.ok) {
        router.push('/login')

        return
      }

      setAuth(data.accessToken, data.user, undefined)
      router.push('/dashboard')
    } catch {
      router.push('/login')
    } finally {
      setSwapLoading(false)
    }
  }

  const handleGoDashboard = (): void => {
    router.push('/dashboard')
  }

  useEffect(() => {
    if (isSheetOpen) {
      void refreshTrolley()
    }
  }, [isSheetOpen, refreshTrolley])

  useEffect(() => {
    if (resolvedUserName) {
      return
    }

    let cancelled = false

    async function loadUserName() {
      try {
        const response = await warehouseApiClient.get<ApiResponse<WarehouseFooterUserResponse>>('/warehouse/home')
        const name = response.data?.user?.name

        if (!cancelled && name) {
          setResolvedUserName(name)
        }
      } catch {
        // Keep the footer usable if the background display-name lookup fails.
      }
    }

    void loadUserName()

    return () => {
      cancelled = true
    }
  }, [resolvedUserName])

  async function handleUnloadSelection() {
    if (!destinationBinId) {
      setLocalError('Open bin details page to unload trolley items.')

      return
    }
    if (selectedItems.length === 0) {
      setLocalError('Select at least one item in trolley.')

      return
    }

    if (selectedItems.length === 1 && selectedItems[0].quantityAvailable > 1) {
      setIsQuantityDialogOpen(true)

      return
    }

    setLocalError(null)
    await unloadSelectedToBin(destinationBinId)
  }

  async function handleConfirmSingleQuantity() {
    if (!destinationBinId) {
      setLocalError('Open bin details page to unload trolley items.')

      return
    }
    const selected = selectedItems[0]
    if (!selected) {
      setLocalError('Select one trolley item.')

      return
    }
    const parsedQuantity = Number.parseInt(quantityToUnload, 10)
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setLocalError('Enter valid quantity greater than zero.')

      return
    }
    if (parsedQuantity > selected.quantityAvailable) {
      setLocalError('Quantity exceeds selected trolley item quantity.')

      return
    }

    setLocalError(null)
    await unloadSelectedToBin(destinationBinId, parsedQuantity)
    setIsQuantityDialogOpen(false)
    setQuantityToUnload('')
  }

  return (
    <footer className="flex h-12 shrink-0 flex-wrap items-center gap-x-1 gap-y-2 border-t border-dash-border bg-dash-shell px-3 py-2 sm:px-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 px-2 text-dash-muted hover:bg-dash-border hover:text-dash-text"
          >
            <UserCircle className="h-5 w-5 shrink-0" />
            <span className="max-w-[10rem] truncate text-sm">{displayName}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-52 border-dash-border bg-dash-shell p-1"
        >
          {showOwnerDashboardDemo ? (
            <button
              type="button"
              disabled={swapLoading}
              onClick={() => void handleOwnerDemoDashboard()}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-border hover:text-dash-text disabled:opacity-50"
            >
              {swapLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
              ) : (
                <LayoutDashboard className="h-4 w-4 shrink-0" />
              )}
              Open dashboard (demo)
            </button>
          ) : null}
          {showDashboardNav ? (
            <button
              type="button"
              onClick={handleGoDashboard}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-border hover:text-dash-text"
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              Dashboard
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-border hover:text-dash-text"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </PopoverContent>
      </Popover>

      <span className="hidden text-dash-border sm:inline">|</span>

      <div className="flex min-w-0 max-w-[12rem] items-center gap-1.5 text-sm text-dash-muted">
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide">Device</span>
        <span className="truncate font-medium text-dash-text">{device?.name ?? '—'}</span>
      </div>

      <span className="hidden text-dash-border sm:inline">|</span>

      <WarehouseZonePicker />

      <div className="ml-auto flex shrink-0 items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setSheetOpen(true)}
          className="h-9 gap-2 px-2 text-dash-muted hover:bg-dash-border hover:text-dash-text"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm">Trolley</span>
          {trolleyItems.length > 0 ? <span className="text-sm">({trolleyItems.length})</span> : null}
        </Button>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full max-w-md border-dash-border bg-dash-shell">
          <SheetHeader>
            <SheetTitle>Trolley items</SheetTitle>
            <SheetDescription>
              Select one or more items and unload them into the open bin details page.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isLoading ? (
              <div className="flex min-h-24 items-center justify-center gap-2 text-sm text-dash-muted">
                <Loader2 className="size-4 animate-spin" />
                Loading trolley items...
              </div>
            ) : null}

            {!isLoading && trolleyItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-dash-border px-4 py-6 text-sm text-dash-muted">
                Your trolley is empty.
              </p>
            ) : null}

            {!isLoading && trolleyItems.length > 0 ? (
              <div className="space-y-2">
                {trolleyItems.map((item) => (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-dash-border bg-dash-card2 p-3"
                  >
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => toggleSelection(item.id)}
                    />
                    <div className="space-y-0.5 text-sm">
                      <p className="font-medium text-dash-text">{item.name}</p>
                      <p className="text-dash-muted">
                        Qty: {item.quantityAvailable} {item.uom}
                      </p>
                      <p className="text-xs text-dash-muted">
                        Source: {item.sourceBinName} ({item.sourceBinCode})
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
          </div>

          <SheetFooter className="border-t border-dash-border bg-dash-shell">
            {(error || localError) ? (
              <p className="rounded-lg border border-dash-red-dim bg-dash-red-dim px-3 py-2 text-sm text-dash-red-text">
                {localError ?? error}
              </p>
            ) : null}
            <div className="flex items-center gap-2">
              <Button variant="outline" type="button" onClick={clearSelection} disabled={isSubmitting}>
                Clear
              </Button>
              <Button type="button" onClick={handleUnloadSelection} disabled={isSubmitting || selectedItems.length === 0}>
                {isSubmitting ? 'Unloading...' : 'Unload to this bin'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog
        open={isQuantityDialogOpen}
        onOpenChange={(open) => {
          setIsQuantityDialogOpen(open)
          if (!open) {
            setQuantityToUnload('')
          }
        }}
      >
        <DialogContent className="max-w-sm border-dash-border bg-dash-shell">
          <DialogHeader>
            <DialogTitle>Choose unload quantity</DialogTitle>
            <DialogDescription>
              Selected item has more than one unit. Enter how many to unload.
            </DialogDescription>
          </DialogHeader>
          <NumericKeypad
            value={quantityToUnload}
            onChange={setQuantityToUnload}
            onConfirm={handleConfirmSingleQuantity}
            maxLength={6}
            disabled={isSubmitting}
            emptyLabel="Enter quantity"
          />
        </DialogContent>
      </Dialog>
    </footer>
  )
}
