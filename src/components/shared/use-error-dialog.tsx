'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/hook/shared/use-error-dialog.md
 */

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ErrorSeverity = 'info' | 'warning' | 'error'

export interface AppError {
  id: string
  title: string
  message: string
  code?: string
  details?: unknown
  severity: ErrorSeverity
  source?: string
  timestamp: string
}

export type AppDialogState =
  | {
      kind: 'error'
      id: string
      title: string
      message: string
      code?: string
      details?: unknown
      severity: ErrorSeverity
      source?: string
      timestamp: string
      onRetry?: () => void
    }
  | {
      kind: 'notice'
      title: string
      message: string
      code?: string
      onRetry?: () => void
      retryLabel?: string
    }
  | {
      kind: 'confirm'
      title: string
      message: string
      code?: string
      confirmLabel?: string
      cancelLabel?: string
      onConfirm: () => void | Promise<void>
    }

interface ErrorDialogContextValue {
  currentDialog: AppDialogState | null
  isOpen: boolean
  history: AppError[]
  reportError: (
    error: unknown,
    options?: {
      title?: string
      severity?: ErrorSeverity
      source?: string
      code?: string
      details?: unknown
      messageOverride?: string
      onRetry?: () => void
    }
  ) => void
  reportNotice: (opts: {
    title?: string
    message: string
    code?: string
    onRetry?: () => void
    retryLabel?: string
  }) => void
  requestConfirm: (opts: {
    title?: string
    message: string
    code?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void | Promise<void>
  }) => void
  clearError: () => void
}

const ErrorDialogContext = createContext<ErrorDialogContextValue | undefined>(
  undefined
)

export const ErrorDialogProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const [currentDialog, setCurrentDialog] = useState<AppDialogState | null>(null)
  const [history, setHistory] = useState<AppError[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const reportError: ErrorDialogContextValue['reportError'] = useCallback(
    (error, options) => {
      const now = new Date().toISOString()

      let message = 'Errore imprevisto.'
      const code = options?.code
      let details = options?.details

      if (options?.messageOverride) {
        message = options.messageOverride
      } else if (error instanceof Error) {
        message = error.message || message
        if (!details && error.stack) {
          details = error.stack
        }
      } else if (typeof error === 'string') {
        message = error
      } else if (error !== null) {
        try {
          message = JSON.stringify(error)
        } catch {
          // ignore
        }
      }

      const severity = options?.severity ?? 'error'
      const title =
        options?.title ?? (severity === 'warning' ? 'Attention' : 'Qualcosa è andato storto')

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`

      const dialog: AppDialogState = {
        kind: 'error',
        id,
        title,
        message,
        code,
        details,
        severity,
        source: options?.source,
        timestamp: now,
        onRetry: options?.onRetry
      }

      const appError: AppError = {
        id,
        title,
        message,
        code,
        details,
        severity,
        source: options?.source,
        timestamp: now
      }

      setCurrentDialog(dialog)
      setIsOpen(true)
      setHistory((prev) => [appError, ...prev].slice(0, 50))
      console.error('[AppError]', appError)
    },
    []
  )

  const reportNotice = useCallback<ErrorDialogContextValue['reportNotice']>((opts) => {
    setCurrentDialog({
      kind: 'notice',
      title: opts.title ?? 'Notice',
      message: opts.message,
      code: opts.code,
      onRetry: opts.onRetry,
      retryLabel: opts.retryLabel
    })
    setIsOpen(true)
  }, [])

  const requestConfirm = useCallback<ErrorDialogContextValue['requestConfirm']>((opts) => {
    setCurrentDialog({
      kind: 'confirm',
      title: opts.title ?? 'Confirm',
      message: opts.message,
      code: opts.code,
      confirmLabel: opts.confirmLabel,
      cancelLabel: opts.cancelLabel,
      onConfirm: opts.onConfirm
    })
    setIsOpen(true)
  }, [])

  const clearError = useCallback(() => {
    setIsOpen(false)
    setCurrentDialog(null)
  }, [])

  const value = useMemo<ErrorDialogContextValue>(
    () => ({
      currentDialog,
      isOpen,
      history,
      reportError,
      reportNotice,
      requestConfirm,
      clearError
    }),
    [currentDialog, isOpen, history, reportError, reportNotice, requestConfirm, clearError]
  )

  return (
    <ErrorDialogContext.Provider value={value}>
      {children}
    </ErrorDialogContext.Provider>
  )
}

export function useErrorDialog(): ErrorDialogContextValue {
  const ctx = useContext(ErrorDialogContext)
  if (!ctx) {
    throw new Error(
      'useErrorDialog must be used within an ErrorDialogProvider'
    )
  }

  return ctx
}

export function withErrorReporting<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  reportError: ErrorDialogContextValue['reportError'],
  options?: { source?: string; title?: string }
) {
  return async (...args: TArgs): Promise<TReturn | null> => {
    try {
      return await fn(...args)
    } catch (err) {
      reportError(err, {
        source: options?.source,
        title: options?.title
      })

      return null
    }
  }
}
