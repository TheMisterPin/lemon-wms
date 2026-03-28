'use client'

import { useState } from 'react'

import CredentialLoginForm from '@/components/auth/CredentialLoginForm'
import FloorLoginForm from '@/components/auth/FloorLoginForm'

type Tab = 'office' | 'warehouse'

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('office')

  return (
    <main className="terminal-scanline flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="mb-8 text-center">
          <div className="mb-2 inline-flex items-center gap-3">
            <span className="font-[family-name:var(--font-terminal)] text-3xl font-black tracking-[0.05em] text-terminal-text">
              LEMON
            </span>
            <span className="border border-terminal-accent px-2 py-0.5 font-[family-name:var(--font-terminal-label)] text-[0.6rem] font-black uppercase tracking-[0.2em] text-terminal-accent">
              WMS
            </span>
          </div>
          <p className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.15em] text-terminal-text-dim">
            WAREHOUSE MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Card */}
        <div className="border border-terminal-border bg-terminal-surface">
          {/* Tabs */}
          <div className="flex border-b border-terminal-border">
            {(['office', 'warehouse'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={[
                  'flex-1 py-3.5 font-[family-name:var(--font-terminal)] text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-[0.15s]',
                  tab === t
                    ? 'border-b-2 border-terminal-accent text-terminal-accent'
                    : 'text-terminal-text-dim hover:text-terminal-text'
                ].join(' ')}
              >
                {t === 'office' ? 'OFFICE' : 'WAREHOUSE'}
              </button>
            ))}
          </div>

          {/* Form content */}
          <div className="p-6">
            {tab === 'office' ? (
              <>
                <p className="mb-5 font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.15em] text-terminal-text-dim">
                  SIGN IN WITH EMAIL AND PASSWORD
                </p>
                <CredentialLoginForm />
              </>
            ) : (
              <>
                <p className="mb-5 font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.15em] text-terminal-text-dim">
                  USE DEVICE CODE, BADGE, AND PIN
                </p>
                <FloorLoginForm />
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center font-[family-name:var(--font-terminal-label)] text-[0.55rem] uppercase tracking-[0.15em] text-terminal-text-dim">
          LEMON WMS — INTERNAL USE ONLY
        </p>
      </div>
    </main>
  )
}
