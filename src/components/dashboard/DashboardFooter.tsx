'use client'

import { useRouter } from 'next/navigation'
import { LogOut, UserCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuthStore } from '@/lib/auth/store'

export default function DashboardFooter() {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  return (
    <footer className="flex h-12 shrink-0 items-center border-t border-zinc-200 bg-white px-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <UserCircle className="h-5 w-5 text-zinc-500" />
            <span className="sr-only">User menu</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-40 p-1">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </PopoverContent>
      </Popover>
    </footer>
  )
}
