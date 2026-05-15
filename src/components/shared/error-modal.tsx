'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/error-modal.md
 */

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

export interface ErrorDetail {
  field?: string
  message: string
}

export type ErrorModalVariant = 'error' | 'notice' | 'confirm'

export interface ErrorModalProps {
  open: boolean
  /** Visual / interaction mode; driven by `useErrorDialog` / `AppErrorDialog`. */
  variant?: ErrorModalVariant
  /** Accent for `notice` variant only. */
  noticeTone?: 'info' | 'warning'
  title?: string
  message: string
  code?: string
  details?: ErrorDetail[] | Record<string, string[]> | unknown
  onClose: () => void
  /** Shown beside dismiss when variant is not `confirm`. */
  onRetry?: () => void
  retryLabel?: string
  /** `confirm` only — runs before `onClose` on success. */
  onConfirm?: () => void | Promise<void>
  confirmLabel?: string
  cancelLabel?: string
}

function parseDetails(raw: unknown): ErrorDetail[] {
  if (!raw) {
    return []
  }

  // Zod flatten() shape: { fieldErrors: { field: string[] }, formErrors: string[] }
  if (typeof raw === 'object' && raw !== null && 'fieldErrors' in raw) {
    const { fieldErrors, formErrors } = raw as {
      fieldErrors: Record<string, string[]>
      formErrors: string[]
    }
    const out: ErrorDetail[] = (formErrors ?? []).map((m) => ({ message: m }))

    for (const [field, messages] of Object.entries(fieldErrors ?? {})) {
      for (const message of messages) {
        out.push({ field, message })
      }
    }

    return out
  }

  // Plain record
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    return Object.entries(raw as Record<string, unknown>).flatMap(([field, val]) => {
      if (Array.isArray(val)) {
        return val.map((m) => ({ field, message: String(m) }))
      }

      return [{ field, message: String(val) }]
    })
  }

  // Array of strings or ErrorDetail
  if (Array.isArray(raw)) {
    return raw.map((item) =>
      typeof item === 'string'
        ? { message: item }
        : { field: item.field, message: item.message }
    )
  }

  return []
}

export function ErrorModal({
  open,
  variant = 'error',
  noticeTone = 'info',
  title = 'Operation Failed',
  message,
  code,
  details,
  onClose,
  onRetry,
  retryLabel = 'Retry',
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel'
}: ErrorModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const parsedDetails = parseDetails(details)
  const [confirmBusy, setConfirmBusy] = useState(false)

  const isConfirm = variant === 'confirm'
  const role = isConfirm ? 'dialog' : 'alertdialog'

  const accent =
    variant === 'confirm'
      ? {
        bar: 'linear-gradient(90deg, #0e7490, #0891b2, #0e7490)',
        iconBg: '#082f38',
        iconBorder: '#155e75',
        iconColor: '#22d3ee',
        codeBg: '#082f38',
        codeBorder: '#155e75',
        codeColor: '#67e8f9'
      }
      : variant === 'notice' && noticeTone === 'warning'
        ? {
          bar: 'linear-gradient(90deg, #b45309, #ca8a04, #b45309)',
          iconBg: '#2d1007',
          iconBorder: '#92400e',
          iconColor: '#fbbf24',
          codeBg: '#2d1007',
          codeBorder: '#92400e',
          codeColor: '#fbbf24'
        }
        : variant === 'notice'
          ? {
            bar: 'linear-gradient(90deg, #1d4ed8, #2563eb, #1d4ed8)',
            iconBg: '#0f172a',
            iconBorder: '#1e40af',
            iconColor: '#93c5fd',
            codeBg: '#0f172a',
            codeBorder: '#1e40af',
            codeColor: '#bfdbfe'
          }
          : {
            bar: 'linear-gradient(90deg, #c2410c, #b45309, #c2410c)',
            iconBg: '#2d1007',
            iconBorder: '#7c2d12',
            iconColor: '#f97316',
            codeBg: '#2d1007',
            codeBorder: '#7c2d12',
            codeColor: '#f97316'
          }

  // Close on Escape
  useEffect(() => {
    if (!open) {
      return
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!confirmBusy) {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handler)

    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose, confirmBusy])

  // Trap focus inside modal
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setConfirmBusy(false)
    }
  }, [open])

  const handleConfirmClick = async () => {
    if (!onConfirm || confirmBusy) {
      return
    }

    setConfirmBusy(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setConfirmBusy(false)
    }
  }

  if (!open) {
    return null
  }

  const panelChrome: CSSProperties =
    variant === 'confirm'
      ? {
        background: 'linear-gradient(165deg, #091217 0%, #050a0e 100%)',
        border: '1px solid rgba(45,212,191,0.32)',
        boxShadow:
          '0 0 0 1px rgba(45,212,191,0.1), 0 28px 64px rgba(0,0,0,0.78), inset 0 1px 0 rgba(255,255,255,0.05)'
      }
      : {
        background: 'linear-gradient(160deg, #1e1208 0%, #170e06 100%)',
        border: '1px solid #4a2c0f',
        boxShadow: '0 0 0 1px #2d1a08, 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,180,60,0.06)'
      }

  const bodyColor = variant === 'confirm' ? '#e2e8f0' : '#d4b896'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role={role}
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => {
          if (!confirmBusy) {
            onClose()
          }
        }}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-xl outline-none"
        style={{
          ...panelChrome,
          borderRadius: '14px'
        }}
      >
        {/* Top accent bar */}
        <div className="h-1 w-full rounded-t-[13px]"
          style={{ background: accent.bar }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4">
          {/* Leading icon */}
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded"
            style={{ background: accent.iconBg, border: `1px solid ${accent.iconBorder}` }}
          >
            {variant === 'confirm' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                style={{ color: accent.iconColor }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : variant === 'notice' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                style={{ color: accent.iconColor }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                style={{ color: accent.iconColor }}
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2
              id="error-modal-title"
              className="text-base font-semibold tracking-tight"
              style={{
                color: variant === 'confirm' ? '#f8fafc' : '#fde8d0',
                letterSpacing: variant === 'confirm' ? '0.02em' : '0.04em'
              }}
            >
              {title}
            </h2>

            {code ? (
              <span
                className="mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-mono"
                style={{
                  background: accent.codeBg,
                  color: accent.codeColor,
                  border: `1px solid ${accent.codeBorder}`
                }}
              >
                {code}
              </span>
            ) : null}
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              if (!confirmBusy) {
                onClose()
              }
            }}
            aria-label="Close dialog"
            className="ml-auto shrink-0 rounded p-1 transition-colors"
            style={{ color: '#9a7355' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fde8d0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9a7355')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#2d1a08', margin: '0 20px' }} />

        {/* Body */}
        <div id="error-modal-desc" className="px-5 py-4 space-y-3">
          <p
            className="text-sm leading-relaxed"
            style={{ color: bodyColor }}
          >
            {message}
          </p>

          {parsedDetails.length > 0 && (
            <div
              className="rounded space-y-1.5 p-3"
              style={{ background: '#120b04', border: '1px solid #3d2208' }}
            >
              {parsedDetails.map((d, i) => (
                <div
                  key={`error-detail:${i}:${d.field ?? 'msg'}:${d.message.slice(0, 64)}`}
                  className="flex gap-2 text-xs"
                >
                  {d.field && (
                    <span
                      className="shrink-0 font-mono font-medium"
                      style={{ color: '#f97316' }}
                    >
                      {d.field}
                    </span>
                  )}
                  <span style={{ color: '#c4956a' }}>{d.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-end gap-2 px-5 pb-5">
          {isConfirm ? (
            <>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => {
                  if (!confirmBusy) {
                    onClose()
                  }
                }}
                className="rounded px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
                style={{
                  background: '#120b04',
                  color: '#d4b896',
                  border: '1px solid #3d2208'
                }}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={confirmBusy}
                onClick={() => void handleConfirmClick()}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(45,212,191,0.5)',
                  color: '#ecfeff'
                }}
              >
                {confirmBusy ? 'Working…' : confirmLabel}
              </button>
            </>
          ) : (
            <>
              {onRetry ? (
                <button
                  type="button"
                  onClick={() => {
                    onRetry()
                    onClose()
                  }}
                  className="rounded px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: '#120b04',
                    color: '#fde8d0',
                    border: '1px solid #4a2c0f'
                  }}
                >
                  {retryLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="rounded px-4 py-2 text-sm font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, #7c2d12, #92400e)',
                  color: '#fde8d0',
                  border: '1px solid #b45309',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #9a3412, #b45309)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7c2d12, #92400e)'
                }}
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Prefer `useErrorDialog` + `AppErrorDialog` for app-wide alerts, notices, and confirms.
 * Use `ErrorModal` directly only for isolated local UI.
 */
export function useErrorModal() {
  return {}
}
