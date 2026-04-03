'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { useAuthStore } from '@/lib/auth/store'

export default function WarehouseFooter() {
  const router = useRouter()
  const clearAuth = useAuthStore((s) => s.clearAuth)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  return (
    <footer className="flex h-14 shrink-0 items-center border-t border-brand-border bg-brand-surface px-4">
      <button
        onClick={handleLogout}
        className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium text-brand-muted transition-colors hover:bg-brand-glass-hover hover:text-brand-text cursor-pointer"
      >
        <LogOut className="h-5 w-5" />
        Logout
      </button>
    </footer>
  )
}
