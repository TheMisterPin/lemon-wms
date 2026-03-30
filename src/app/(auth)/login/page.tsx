'use client'

import { useState } from 'react'

import CredentialLoginForm from '@/components/auth/CredentialLoginForm'
import FloorLoginForm from '@/components/auth/FloorLoginForm'
import LemonHeader from '@/components/typography/lemon-header'

type Tab = 'office' | 'warehouse'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('office')

  return (
    <main className="flex h-full flex-col items-center justify-center overflow-hidden bg-brand-bg p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-2">
            <LemonHeader />
          </div>
          <p className="bg-linear-to-r from-brand-primary to-brand-primary-end bg-clip-text text-sm text-transparent">
            Warehouse Management System
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-brand-border bg-brand-surface shadow-xl">
          {/* Tabs */}
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

          {/* Form content */}
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
