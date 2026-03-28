'use client'

import { useState } from 'react'

import CredentialLoginForm from '@/components/auth/CredentialLoginForm'
import FloorLoginForm from '@/components/auth/FloorLoginForm'

type Tab = 'office' | 'warehouse'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('office')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="text-3xl font-black tracking-tight text-zinc-100">
              LEMON
            </span>
            <span className="rounded bg-amber-500 px-2 py-0.5 text-xs font-black uppercase tracking-widest text-zinc-950">
              WMS
            </span>
          </div>
          <p className="text-sm text-zinc-500">Warehouse Management System</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {(['office', 'warehouse'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'flex-1 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors',
                  tab === t
                    ? 'border-b-2 border-amber-500 text-amber-400'
                    : 'text-zinc-500 hover:text-zinc-300'
                ].join(' ')}
              >
                {t === 'office' ? 'Office' : 'Warehouse'}
              </button>
            ))}
          </div>

          {/* Form content */}
          <div className="p-6">
            {tab === 'office' ? (
              <>
                <p className="mb-5 text-sm text-zinc-400">
                  Sign in with your email and password.
                </p>
                <CredentialLoginForm />
              </>
            ) : (
              <>
                <p className="mb-5 text-sm text-zinc-400">
                  Use your device code, badge, and PIN.
                </p>
                <FloorLoginForm />
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Lemon WMS — internal use only
        </p>
      </div>
    </main>
  )
}
