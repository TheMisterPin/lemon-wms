'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuthStore } from '@/lib/auth/store'
import type { AuthUser } from '@/types'

type LoginResponse = {
  accessToken: string
  user: AuthUser
  error?: string
}

export function useCredentialLogin() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data: LoginResponse = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Login failed')
        return
      }

      setAuth(data.accessToken, data.user)

      const role = data.user.role
      if (role === 'WAREHOUSE_MANAGER' || role === 'WAREHOUSE_WORKER') {
        router.push('/warehouse')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Unable to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return {
    fields: { email, password },
    setEmail,
    setPassword,
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    error,
    loading,
    handleSubmit
  }
}
