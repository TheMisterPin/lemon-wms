'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/auth/credential-login-form.md
 */


import { Eye, EyeOff, Loader2 } from 'lucide-react'

import { useCredentialLogin } from '@/hooks/dashboard/iam/use-credential-login'

export default function CredentialLoginForm() {
  const {
    fields,
    setEmail,
    setPassword,
    showPassword,
    toggleShowPassword,
    error,
    loading,
    handleSubmit
  } = useCredentialLogin()

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-brand-text">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          placeholder="you@company.com"
          className="rounded-lg border border-brand-input bg-brand-surface px-4 py-2.5 text-brand-text placeholder-brand-subtle outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-brand-text">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={fields.password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            placeholder="••••••••"
            className="w-full rounded-lg border border-brand-input bg-brand-surface px-4 py-2.5 pr-11 text-brand-text placeholder-brand-subtle outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:opacity-50"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-subtle hover:text-brand-muted"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !fields.email || !fields.password}
        className="flex items-center justify-center gap-2 rounded-lg bg-linear-to-r from-brand-primary to-brand-primary-end px-4 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
