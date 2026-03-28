'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/lib/auth/store'
import { useIsMobile } from '@/hooks/use-mobile'
import ScanInput from '@/components/shared/ScanInput'
import NumericKeypad from '@/components/shared/NumericKeypad'
import type { AuthUser } from '@/types'

type Step = 'device' | 'badge' | 'pin'

type LoginResponse = {
  accessToken: string
  user: AuthUser
  device: { id: string; warehouseId: string; zoneId: string | null }
  error?: string
}

const DEVICE_CODE_KEY = 'wms_device_code'

const STEP_LABELS: Record<Step, string> = {
  device: 'DEVICE CODE',
  badge: 'SCAN BADGE',
  pin: 'ENTER PIN',
}

const STEPS: Step[] = ['device', 'badge', 'pin']

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
          setStep('badge')
          setBadgeNumber('')
        }
        return
      }

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

  const currentStepIndex = STEPS.indexOf(step)

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-terminal)]">

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const isActive = step === s
          const isDone = currentStepIndex > i
          return (
            <div key={s} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    'flex h-6 w-6 items-center justify-center border font-[family-name:var(--font-terminal)] text-xs font-bold transition-colors duration-[0.15s]',
                    isActive
                      ? 'border-terminal-accent text-terminal-accent'
                      : isDone
                      ? 'border-terminal-accent-dim text-terminal-accent-dim'
                      : 'border-terminal-border text-terminal-text-dim'
                  ].join(' ')}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  className={[
                    'font-[family-name:var(--font-terminal-label)] text-[0.5rem] uppercase tracking-[0.15em]',
                    isActive ? 'text-terminal-accent' : 'text-terminal-text-dim'
                  ].join(' ')}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    'mb-4 h-px w-8 transition-colors duration-[0.15s]',
                    currentStepIndex > i ? 'bg-terminal-accent-dim' : 'bg-terminal-border'
                  ].join(' ')}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step 1: Device code */}
      {step === 'device' && (
        <form onSubmit={handleDeviceSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="device-code"
              className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.2em] text-terminal-text-dim"
            >
              DEVICE CODE
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
              className="border border-terminal-border bg-black px-4 py-3 font-[family-name:var(--font-terminal)] text-base font-semibold tracking-[0.05em] text-terminal-accent outline-none transition-colors duration-[0.15s] placeholder:text-terminal-text-dim focus:border-terminal-accent"
            />
          </div>
          <button
            type="submit"
            disabled={deviceCode.trim().length < 3}
            className="btn-clip border border-terminal-border bg-terminal-surface px-6 py-3 font-[family-name:var(--font-terminal)] text-sm font-semibold uppercase tracking-[0.08em] text-terminal-text transition-colors duration-[0.15s] hover:border-terminal-accent hover:bg-[#1a1f1a] hover:text-terminal-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            CONTINUE
          </button>
        </form>
      )}

      {/* Step 2: Badge scan */}
      {step === 'badge' && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.2em] text-terminal-text-dim">
              SCAN BADGE OR ENTER BADGE NUMBER
            </p>
          </div>
          <ScanInput
            placeholder="Scan badge…"
            onScan={handleBadgeScan}
            autoFocus
          />
          <button
            type="button"
            onClick={() => { setStep('device'); setError(null) }}
            className="font-[family-name:var(--font-terminal-label)] text-left text-[0.6rem] uppercase tracking-[0.15em] text-terminal-text-dim transition-colors duration-[0.15s] hover:text-terminal-accent-dim"
          >
            ← CHANGE DEVICE CODE
          </button>
        </div>
      )}

      {/* Step 3: PIN */}
      {step === 'pin' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-l-2 border-terminal-accent-dim pl-3">
            <span className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.15em] text-terminal-text-dim">
              BADGE
            </span>
            <span className="font-[family-name:var(--font-terminal)] text-sm font-semibold tracking-[0.05em] text-terminal-text">
              {badgeNumber}
            </span>
          </div>

          {isMobile ? (
            /* Native numeric keyboard on touch devices */
            <div className="flex flex-col gap-2">
              <label
                htmlFor="native-pin"
                className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.2em] text-terminal-text-dim"
              >
                4-DIGIT PIN
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
                className="border border-terminal-border bg-black px-4 py-3 text-center font-[family-name:var(--font-terminal)] text-2xl tracking-[0.5em] text-terminal-accent outline-none transition-colors duration-[0.15s] placeholder:text-terminal-text-dim focus:border-terminal-accent disabled:opacity-50"
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
              className="btn-clip flex items-center justify-center gap-2 border border-terminal-border bg-terminal-surface px-6 py-3 font-[family-name:var(--font-terminal)] text-sm font-semibold uppercase tracking-[0.08em] text-terminal-text transition-colors duration-[0.15s] hover:border-terminal-accent hover:bg-[#1a1f1a] hover:text-terminal-accent disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <span className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.2em]">
                    SIGNING IN
                  </span>
                  <span className="animate-[terminalBlink_1s_ease-in-out_infinite]">_</span>
                </>
              ) : (
                'SIGN IN'
              )}
            </button>
          )}

          {loading && isMobile && (
            <div className="flex items-center gap-2 text-terminal-text-dim">
              <span className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.2em]">
                SIGNING IN
              </span>
              <span className="animate-[terminalBlink_1s_ease-in-out_infinite] text-terminal-accent">_</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => { setStep('badge'); setBadgeNumber(''); setPin(''); setError(null) }}
            className="font-[family-name:var(--font-terminal-label)] text-left text-[0.6rem] uppercase tracking-[0.15em] text-terminal-text-dim transition-colors duration-[0.15s] hover:text-terminal-accent-dim"
          >
            ← RESCAN BADGE
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="border border-terminal-danger bg-terminal-surface px-4 py-2.5"
        >
          <p className="font-[family-name:var(--font-terminal)] text-sm font-semibold tracking-[0.05em] text-terminal-danger">
            {error}
          </p>
        </div>
      )}
    </div>
  )
}
