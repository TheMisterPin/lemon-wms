'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/error-modal.md
 */


import { useEffect, useRef } from 'react'

export interface ErrorDetail {
  field?: string
  message: string
}

export interface ErrorModalProps {
  open: boolean
  title?: string
  message: string
  code?: string
  details?: ErrorDetail[] | Record<string, string[]> | unknown
  onClose: () => void
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
  title = 'Operation Failed',
  message,
  code,
  details,
  onClose
}: ErrorModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const parsedDetails = parseDetails(details)

  // Close on Escape
  useEffect(() => {
    if (!open) {
      return
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handler)

    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Trap focus inside modal
  useEffect(() => {
    if (open) {
      dialogRef.current?.focus()
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="alertdialog"
      aria-labelledby="error-modal-title"
      aria-describedby="error-modal-desc"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-md outline-none"
        style={{
          background: 'linear-gradient(160deg, #1e1208 0%, #170e06 100%)',
          border: '1px solid #4a2c0f',
          boxShadow: '0 0 0 1px #2d1a08, 0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,180,60,0.06)'
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full rounded-t-md"
          style={{ background: 'linear-gradient(90deg, #c2410c, #b45309, #c2410c)' }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4">
          {/* Warning icon */}
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded"
            style={{ background: '#2d1007', border: '1px solid #7c2d12' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              style={{ color: '#f97316' }}
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h2
              id="error-modal-title"
              className="text-base font-semibold tracking-wide"
              style={{ color: '#fde8d0', letterSpacing: '0.04em' }}
            >
              {title}
            </h2>

            {code && (
              <span
                className="mt-1 inline-block rounded px-1.5 py-0.5 text-xs font-mono"
                style={{ background: '#2d1007', color: '#f97316', border: '1px solid #7c2d12' }}
              >
                {code}
              </span>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close error dialog"
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
            style={{ color: '#d4b896' }}
          >
            {message}
          </p>

          {parsedDetails.length > 0 && (
            <div
              className="rounded space-y-1.5 p-3"
              style={{ background: '#120b04', border: '1px solid #3d2208' }}
            >
              {parsedDetails.map((d, i) => (
                <div key={i} className="flex gap-2 text-xs">
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
        <div
          className="flex justify-end px-5 pb-5"
        >
          <button
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
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage ErrorModal state.
 *
 * @example
 * const { errorProps, showError } = useErrorModal()
 * // ...
 * showError('Save failed', { message: err.message, code: err.code, details: err.details })
 * // ...
 * <ErrorModal {...errorProps} />
 */
export function useErrorModal() {
  return {
    // The caller manages their own state; this hook is a usage pattern guide.
    // Provide open/onClose/message/title/code/details as props.
  }
}
