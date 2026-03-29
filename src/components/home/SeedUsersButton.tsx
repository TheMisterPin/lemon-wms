'use client'

import { useState } from 'react'

type Status =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success'; message: string }
  | { type: 'error'; message: string }

export default function SeedUsersButton() {
  const [status, setStatus] = useState<Status>({ type: 'idle' })

  const handleSeed = async () => {
    setStatus({ type: 'loading' })

    try {
      const response = await fetch('/api/seed/users', { method: 'POST' })
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Seeding failed.')
      }

      setStatus({
        type: 'success',
        message: `Seeded ${payload.usersSeeded ?? 'all'} users.`
      })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Seeding failed.'
      })
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSeed}
        disabled={status.type === 'loading'}
        className="group w-full rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-left transition-colors hover:border-emerald-500/60 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <p className="text-base font-semibold text-zinc-100 transition-colors group-hover:text-emerald-400">
          Seed Users
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Populate default login users for local testing.
        </p>
      </button>

      {status.type === 'success' ? (
        <p className="mt-2 text-sm text-emerald-400">{status.message}</p>
      ) : null}

      {status.type === 'error' ? (
        <p className="mt-2 text-sm text-red-400">{status.message}</p>
      ) : null}
    </div>
  )
}
