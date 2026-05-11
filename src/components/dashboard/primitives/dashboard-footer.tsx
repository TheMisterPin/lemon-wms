'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/dashboard-footer.md
 */

import { useRouter } from 'next/navigation'
import { LogOut, UserCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/lib/auth/store'
import { useAuth } from '@/lib/auth/use-auth'

export default function DashboardFooter() {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const session = useAuth()
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }
  const displayName = session.user?.fullName || 'User'

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
          className="w-40 border-dash-border bg-dash-shell p-1"
        >
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
