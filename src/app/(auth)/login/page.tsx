'use client'

import { useState } from 'react'

import CredentialLoginForm from '@/components/auth/CredentialLoginForm'
import FloorLoginForm from '@/components/auth/FloorLoginForm'

type Tab = 'office' | 'warehouse'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('office')

  return (
    <main className="flex h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#080e1f] p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text text-3xl font-black tracking-tight text-transparent">
              LEMON
            </span>
            <span className="rounded bg-gradient-to-br from-green-400 to-emerald-600 px-2 py-0.5 text-xs font-black uppercase tracking-widest text-white">
              WMS
            </span>
          </div>
          <p className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-sm text-transparent">
            Warehouse Management System
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {(['office', 'warehouse'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'flex-1 py-3.5 text-sm font-semibold uppercase tracking-wider transition-colors',
                  tab === t
                    ? 'border-b-2 border-emerald-500 text-emerald-400'
                    : 'text-slate-500 hover:text-slate-300'
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
                <p className="mb-5 text-sm text-slate-400">
                  Sign in with your email and password.
                </p>
                <CredentialLoginForm />
              </>
            ) : (
              <>
                <p className="mb-5 text-sm text-slate-400">
                  Use your device code, badge, and PIN.
                </p>
                <FloorLoginForm />
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-700">
          Lemon WMS — internal use only
        </p>
      </div>
    </main>
  )
}
