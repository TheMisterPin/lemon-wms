
'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export type ErrorSeverity = 'info' | 'warning' | 'error';

export interface AppError {
  id: string;
  title: string;
  message: string;
  code?: string;
  details?: unknown;
  severity: ErrorSeverity;
  source?: string; // e.g. "login", "appointments", "api/visits/current"
  timestamp: string;
}

interface ErrorDialogContextValue {
  currentError: AppError | null;
  isOpen: boolean;
  history: AppError[];
  /**
   * Report an error that should be shown to the user.
   * `error` can be an Error instance, a string, or anything JSON-serialisable.
   */
  reportError: (
    error: unknown,
    options?: {
      title?: string;
      severity?: ErrorSeverity;
      source?: string;
      code?: string;
      details?: unknown;
      messageOverride?: string;
    }
  ) => void;
  /** Close the dialog and clear currentError */
  clearError: () => void;
}

const ErrorDialogContext = createContext<ErrorDialogContextValue | undefined>(
  undefined
)

/**
 * Provider that stores the current error + a small history
 * and exposes an API to report and clear errors.
 *
 * Found in `app/layout.tsx`:
 *
 * <ErrorDialogProvider>
 *   <AppShell>...</AppShell>
 *   <ErrorDialogPortal /> // the visual overlay
 * </ErrorDialogProvider>
 */
export const ErrorDialogProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const [currentError, setCurrentError] = useState<AppError | null>(null)
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

      const appError: AppError = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title: options?.title ?? 'Qualcosa è andato storto',
        message,
        code,
        details,
        severity: options?.severity ?? 'error',
        source: options?.source,
        timestamp: now
      }

      setCurrentError(appError)
      setIsOpen(true)
      setHistory((prev) => [appError, ...prev].slice(0, 50)) // keep last 50 errors

      // if (process.env.NODE_ENV !== "production") {
      //   // eslint-disable-next-line no-console
      //   console.error("[AppError]", appError);
      // }
      console.error('[AppError]', appError)
    },
    []
  )

  const clearError = useCallback(() => {
    setIsOpen(false)
    setCurrentError(null)
  }, [])

  const value = useMemo<ErrorDialogContextValue>(
    () => ({
      currentError,
      isOpen,
      history,
      reportError,
      clearError
    }),
    [currentError, isOpen, history, reportError, clearError]
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

/**
 * Helper you can use in async functions:
 *
 * const { reportError } = useErrorDialog();
 * try {
 *   const res = await fetch(...);
 *   if (!res.ok) throw new Error("Login fallito");
 * } catch (err) {
 *   reportError(err, { source: "login" });
 * }
 */
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
