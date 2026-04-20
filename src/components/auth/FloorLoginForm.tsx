'use client'

import { useRef } from 'react'

import { Loader2 } from 'lucide-react'

import { useFloorLoginFlow } from '@/components/auth/use-floor-login-flow'
import NumericKeypad from '@/components/shared/NumericKeypad'
import ScanInput from '@/components/shared/ScanInput'
import { useIsMobile } from '@/components/shared/use-mobile'

type Step = 'device' | 'badge' | 'pin'

const STEPS: Step[] = ['device', 'badge', 'pin']

export default function FloorLoginForm() {
  const isMobile = useIsMobile()
  const deviceInputRef = useRef<HTMLInputElement>(null)

  const {
    step,
    deviceCode,
    setDeviceCode,
    badgeNumber,
    pin,
    error,
    loading,
    handleDeviceSubmit,
    handleBadgeScan,
    handlePinConfirm,
    handleKeypadPinChange,
    handleNativePinChange,
    handleChangeUser,
    goBackToDevice
  } = useFloorLoginFlow()

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                step === s
                  ? 'bg-linear-to-br from-brand-primary to-brand-primary-end text-white'
                  : STEPS.indexOf(step) > i
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
          {step === 'device' ? 'Device name' : step === 'badge' ? 'Scan badge' : 'Enter PIN'}
        </span>
      </div>

      {/* Step 1: Device code */}
      {step === 'device' && (
        <form onSubmit={handleDeviceSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="device-code" className="text-sm font-medium text-brand-text">
              Device name
            </label>
            <input
              id="device-code"
              ref={deviceInputRef}
              type="text"
              autoFocus
              value={deviceCode}
              onChange={(e) => setDeviceCode(e.target.value)}
              placeholder="e.g. ZONE-3-TERMINAL"
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
          <ScanInput placeholder="Scan badge…" onScan={handleBadgeScan} autoFocus />
          <button
            type="button"
            onClick={goBackToDevice}
            className="text-sm text-brand-subtle hover:text-brand-muted"
          >
            ← Change device name
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
            <NumericKeypad
              value={pin}
              onChange={handleKeypadPinChange}
              onConfirm={handlePinConfirm}
              onChangeUser={handleChangeUser}
              maxLength={4}
              masked
              disabled={loading}
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
            onClick={handleChangeUser}
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
