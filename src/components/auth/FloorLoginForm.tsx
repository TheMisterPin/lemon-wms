'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import NumericKeypad from '@/components/shared/NumericKeypad'
import ScanInput from '@/components/shared/ScanInput'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAuthStore } from '@/lib/auth/store'
import type { AuthUser } from '@/types'

type Step = 'device' | 'badge' | 'pin'

type LoginResponse = {
  accessToken: string
  user: AuthUser
  device: { id: string; warehouseId: string; zoneId: string | null }
  error?: string
}

const DEVICE_CODE_KEY = 'wms_device_code'

export default function FloorLoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const isMobile = useIsMobile()

  const [step, setStep] = useState<Step>('device')
  const [deviceCode, setDeviceCode] = useState('')
  const [badgeNumber, setBadgeNumber] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const deviceInputRef = useRef<HTMLInputElement>(null)

  // Auto-populate device code from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(DEVICE_CODE_KEY)
    if (saved) {
      setDeviceCode(saved)
      setStep('badge')
    }
  }, [])

  const handleDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (deviceCode.trim().length >= 3) {
      setError(null)
      setStep('badge')
    }
  }

  const handleBadgeScan = (value: string) => {
    setBadgeNumber(value)
    setError(null)
    setStep('pin')
  }

  const submitLogin = async (currentPin: string) => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/floor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceCode: deviceCode.trim(), badgeNumber, pin: currentPin })
      })

      const data: LoginResponse = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        setPin('')
        if (res.status === 401 && data.error === 'Invalid badge or PIN') {
          // Go back to badge scan on auth failure
          setStep('badge')
          setBadgeNumber('')
        }

        return
      }

      // Persist device code for next login
      localStorage.setItem(DEVICE_CODE_KEY, deviceCode.trim())

      setAuth(data.accessToken, data.user)
      router.push('/warehouse')
    } catch {
      setError('Unable to connect. Please try again.')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const handlePinConfirm = () => {
    if (pin.length === 4) {
      submitLogin(pin)
    }
  }

  const handleNativePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(val)
    if (val.length === 4) {
      submitLogin(val)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['device', 'badge', 'pin'] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                step === s
                  ? 'bg-linear-to-br from-brand-primary to-brand-primary-end text-white'
                  : ['device', 'badge', 'pin'].indexOf(step) > i
                    ? 'bg-brand-input text-brand-muted'
                    : 'bg-brand-border text-brand-subtle'
              ].join(' ')}
            >
              {i + 1}
            </div>
            {i < 2 && <div className="h-px w-6 bg-brand-input" />}
          </div>
        ))}
        <span className="ml-1 text-sm text-brand-muted">
          {step === 'device' ? 'Device code' : step === 'badge' ? 'Scan badge' : 'Enter PIN'}
        </span>
      </div>

      {/* Step 1: Device code */}
      {step === 'device' && (
        <form onSubmit={handleDeviceSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-code" className="text-sm font-medium text-brand-text">
              Device code
            </label>
            <input
              id="device-code"
              ref={deviceInputRef}
              type="text"
              autoFocus
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value)}
              placeholder="e.g. WH1-ZONE3"
              autoComplete="off"
              className="rounded-lg border border-brand-input bg-brand-surface px-4 py-3 text-lg text-brand-text placeholder-brand-subtle outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <button
            type="submit"
            disabled={deviceCode.trim().length < 3}
            className="rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-end px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>
        </form>
      )}

      {/* Step 2: Badge scan */}
      {step === 'badge' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-brand-muted">
            Scan your badge or type your badge number
          </p>
          <ScanInput
            placeholder="Scan badge…"
            onScan={handleBadgeScan}
            autoFocus
          />
          <button
            type="button"
            onClick={() => {
              setStep('device'); setError(null)
            }}
            className="text-sm text-brand-subtle hover:text-brand-muted"
          >
            ← Change device code
          </button>
        </div>
      )}

      {/* Step 3: PIN */}
      {step === 'pin' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-brand-muted">
            Badge: <span className="font-mono text-brand-text">{badgeNumber}</span>
          </p>

          {isMobile ? (
            /* Native numeric keyboard on touch devices */
            <div className="flex flex-col gap-3">
              <label htmlFor="native-pin" className="text-sm font-medium text-brand-text">
                4-digit PIN
              </label>
              <input
                id="native-pin"
                type="password"
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                autoFocus
                autoComplete="current-password"
                value={pin}
                onChange={handleNativePinChange}
                disabled={loading}
                placeholder="••••"
                className="rounded-lg border border-brand-input bg-brand-surface px-4 py-3 text-center text-2xl tracking-[0.5em] text-brand-text placeholder-brand-subtle outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
              />
            </div>
          ) : (
            /* Custom keypad on desktop */
            <NumericKeypad
              value={pin}
              onChange={setPin}
              onConfirm={handlePinConfirm}
              maxLength={4}
              masked
            />
          )}

          {!isMobile && (
            <button
              type="button"
              onClick={handlePinConfirm}
              disabled={pin.length !== 4 || loading}
              className="flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-end px-4 py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          )}

          {loading && isMobile && (
            <div className="flex items-center justify-center gap-2 text-brand-muted">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Signing in…</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setStep('badge'); setBadgeNumber(''); setPin(''); setError(null)
            }}
            className="text-sm text-brand-subtle hover:text-brand-muted"
          >
            ← Rescan badge
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
