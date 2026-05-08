'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'

import CredentialLoginForm from '@/components/auth/credential-login-form'
import FloorLoginForm from '@/components/auth/floor-login-form'
import LemonHeader from '@/components/typography/lemon-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useAuthStore } from '@/lib/auth/store'
import type { AuthUser } from '@/types'

type Tab = 'office' | 'warehouse'

const DEMO_ROLES = [
  'OWNER',
  'OFFICE_MANAGER',
  'OFFICE_WORKER',
  'WAREHOUSE_MANAGER',
  'WAREHOUSE_WORKER'
] as const

type DemoRole = (typeof DEMO_ROLES)[number]

const DEMO_ROLE_LABELS: Record<DemoRole, string> = {
  OWNER: 'Owner',
  OFFICE_MANAGER: 'Office manager',
  OFFICE_WORKER: 'Office worker',
  WAREHOUSE_MANAGER: 'Warehouse manager',
  WAREHOUSE_WORKER: 'Warehouse worker'
}

type DemoLoginResponse = {
  accessToken: string
  user: AuthUser
  error?: string
}

type LoginPageClientProps = {
  isDemoEnabled: boolean
}

export function LoginPageClient({ isDemoEnabled }: LoginPageClientProps) {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [tab, setTab] = useState<Tab>('office')
  const [demoOpen, setDemoOpen] = useState(false)
  const [demoLoadingRole, setDemoLoadingRole] = useState<DemoRole | null>(null)
  const [demoError, setDemoError] = useState<string | null>(null)

  const handleDemoLogin = async (role: DemoRole) => {
    setDemoError(null)
    setDemoLoadingRole(role)

    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })

      const data = (await res.json()) as DemoLoginResponse

      if (!res.ok) {
        setDemoError(data.error ?? 'Demo login failed')

        return
      }

      setAuth(data.accessToken, data.user)

      const userRole = data.user.role
      if (userRole === 'WAREHOUSE_MANAGER' || userRole === 'WAREHOUSE_WORKER') {
        router.push('/warehouse')
      } else {
        router.push('/dashboard')
      }

      setDemoOpen(false)
    } catch {
      setDemoError('Unable to connect. Please try again.')
    } finally {
      setDemoLoadingRole(null)
    }
  }

  return (
    <main className="flex h-full flex-col items-center justify-center overflow-hidden bg-brand-bg p-4">
      <div className="w-full max-w-sm">
        {isDemoEnabled && (
          <div className="mb-6 flex justify-center">
            <Dialog open={demoOpen} onOpenChange={(open) => {
              setDemoOpen(open)
              if (!open) {
                setDemoError(null)
              }
            }}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 border-amber-500/70 bg-amber-500/10 font-semibold text-amber-200 shadow-[0_0_20px_-4px_rgba(245,158,11,0.45)] hover:bg-amber-500/20 hover:text-amber-100"
                >
                  <Sparkles className="size-4 shrink-0" aria-hidden />
                  Demo: sign in without credentials
                </Button>
              </DialogTrigger>
              <DialogContent className="border-brand-border bg-brand-surface text-brand-text">
                <DialogHeader>
                  <DialogTitle className="text-brand-text">Demo login</DialogTitle>
                  <DialogDescription className="text-brand-muted">
                    Sign in as the first seeded user with each role. Only active when IS_DEMO=true on the server.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  {DEMO_ROLES.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant="secondary"
                      disabled={demoLoadingRole !== null}
                      className="w-full justify-between border border-brand-border bg-brand-bg text-brand-text hover:bg-brand-surface"
                      onClick={() => void handleDemoLogin(role)}
                    >
                      <span>Login as {DEMO_ROLE_LABELS[role]}</span>
                      {demoLoadingRole === role && (
                        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                      )}
                    </Button>
                  ))}
                </div>
                {demoError && (
                  <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
                    {demoError}
                  </p>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}

        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <LemonHeader />
          </div>
          <p className="bg-linear-to-r from-brand-primary to-brand-primary-end bg-clip-text text-sm text-transparent">
            Warehouse Management System
          </p>
        </div>

        <div className="rounded-xl border border-brand-border bg-brand-surface shadow-xl">
          <div className="flex border-b border-brand-border">
            {(['office', 'warehouse'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'flex-1 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors',
                  tab === t
                    ? 'border-b-2 border-brand-primary text-brand-primary'
                    : 'text-brand-subtle hover:text-brand-muted'
                ].join(' ')}
              >
                {t === 'office' ? 'Office' : 'Warehouse'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === 'office' ? (
              <>
                <p className="mb-5 text-sm text-brand-muted">
                  Sign in with your email and password.
                </p>
                <CredentialLoginForm />
              </>
            ) : (
              <>
                <p className="mb-5 text-sm text-brand-muted">
                  Use your device code, badge, and PIN.
                </p>
                <FloorLoginForm />
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-brand-subtle">
          Lemon WMS — internal use only
        </p>
      </div>
    </main>
  )
}
