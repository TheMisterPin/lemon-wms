'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

import { useAuthStore } from '@/lib/auth/store'
import type { AuthDevice, AuthLocation, AuthUser } from '@/types'

type Step = 'device' | 'badge' | 'pin'

type LoginResponse = {
  accessToken: string
  user: AuthUser
  location: AuthLocation
  device: AuthDevice
  error?: string
}

const DEVICE_CODE_KEY = 'wms_device_code'
const LAST_FLOOR_LOGIN_KEY = 'wms_floor_last_login'

const lastFloorLoginSchema = z.object({
  deviceCode: z.string(),
  badgeNumber: z.string()
})

type LastFloorLogin = z.infer<typeof lastFloorLoginSchema>

function readLastFloorLogin(): LastFloorLogin | null {
  try {
    const raw = localStorage.getItem(LAST_FLOOR_LOGIN_KEY)
    if (!raw) {
      return null
    }
    const result = lastFloorLoginSchema.safeParse(JSON.parse(raw))

    return result.success ? result.data : null
  } catch {
    return null
  }
}

export function useFloorLoginFlow() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [step, setStep] = useState<Step>('device')
  const [deviceCode, setDeviceCode] = useState('')
  const [badgeNumber, setBadgeNumber] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Auto-populate device code and skip ahead if previously logged in
  useEffect(() => {
    const saved = localStorage.getItem(DEVICE_CODE_KEY)
    if (saved) {
      setDeviceCode(saved)
      const lastLogin = readLastFloorLogin()
      if (lastLogin && lastLogin.deviceCode === saved) {
        setBadgeNumber(lastLogin.badgeNumber)
        setStep('pin')

        return
      }
      setStep('badge')
    }
  }, [])

  const handleChangeUser = () => {
    setStep('badge')
    setBadgeNumber('')
    setPin('')
    setError(null)
    localStorage.removeItem(LAST_FLOOR_LOGIN_KEY)
  }

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
      localStorage.setItem(
        LAST_FLOOR_LOGIN_KEY,
        JSON.stringify({ deviceCode: deviceCode.trim(), badgeNumber: data.user.badgeNumber } satisfies LastFloorLogin)
      )

      setAuth(data.accessToken, data.user, { location: data.location, device: data.device })
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

  return {
    step,
    deviceCode,
    setDeviceCode,
    badgeNumber,
    pin,
    setPin,
    error,
    loading,
    handleDeviceSubmit,
    handleBadgeScan,
    handlePinConfirm,
    handleNativePinChange,
    handleChangeUser,
    goBackToDevice: () => {
      setStep('device'); setError(null)
    }
  }
}
