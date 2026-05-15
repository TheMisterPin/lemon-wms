'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-footer.md
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, UserCircle, Warehouse } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Role } from '@/generated/prisma'
import { useAuthStore } from '@/lib/auth/store'
import { useAuth } from '@/lib/auth/use-auth'
import type { AuthDevice, AuthLocation, AuthUser } from '@/types'

type DashboardFooterProps = {
  isDemoEnabled?: boolean
}

type DemoLoginApiResponse = {
  accessToken: string
  user: AuthUser
  location?: AuthLocation
  device?: AuthDevice
  error?: string
}

export default function DashboardFooter({ isDemoEnabled }: DashboardFooterProps) {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setAuth = useAuthStore((s) => s.setAuth)
  const session = useAuth()
  const [swapLoading, setSwapLoading] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  const handleOwnerDemoWarehouse = async () => {
    setSwapLoading(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      clearAuth()

      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: Role.OWNER, surface: 'warehouse' })
      })
      const data = (await res.json()) as DemoLoginApiResponse

      if (!res.ok) {
        router.push('/login')

        return
      }

      setAuth(
        data.accessToken,
        data.user,
        data.device && data.location
          ? { location: data.location, device: data.device }
          : undefined
      )

      if (data.device) {
        try {
          localStorage.setItem('wms_device_code', data.device.code)
          localStorage.setItem(
            'wms_floor_last_login',
            JSON.stringify({
              deviceCode: data.device.code,
              badgeNumber: data.user.badgeNumber
            })
          )
        } catch {
          // Ignore storage failures; auth store still has device context for this session.
        }
      }

      router.push('/warehouse')
    } catch {
      router.push('/login')
    } finally {
      setSwapLoading(false)
    }
  }

  const displayName = session.user?.fullName || 'User'
  const showOwnerWarehouseDemo = Boolean(isDemoEnabled && session.isOwner)

  return (
    <footer className="flex h-12 shrink-0 items-center border-t border-dash-border bg-dash-shell px-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 gap-2 px-2 text-dash-muted hover:bg-dash-border hover:text-dash-text"
          >
            <UserCircle className="h-5 w-5 shrink-0" />
            <span className="text-sm">{displayName}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="start"
          className="w-52 border-dash-border bg-dash-shell p-1"
        >
          {showOwnerWarehouseDemo ? (
            <button
              type="button"
              disabled={swapLoading}
              onClick={handleOwnerDemoWarehouse}
              className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-border hover:text-dash-text disabled:opacity-50"
            >
              {swapLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Warehouse className="h-4 w-4" />}
              Open warehouse (demo)
            </button>
          ) : null}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-dash-muted transition-colors hover:bg-dash-border hover:text-dash-text"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </PopoverContent>
      </Popover>
    </footer>
  )
}
