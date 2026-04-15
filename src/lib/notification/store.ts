'use client'

import { create } from 'zustand'

import type { ErrorType } from '@/generated/prisma'
import { apiClient } from '@/lib/axios'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationVariant = 'success' | 'warning' | 'error' | 'confirm'

interface NotificationState {
  open: boolean
  variant: NotificationVariant
  title: string
  message: string
  errorType?: ErrorType
  onConfirm?: () => void
}

interface NotificationStore extends NotificationState {
  show: (payload: Omit<NotificationState, 'open'>) => void
  dismiss: () => void
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useNotificationStore = create<NotificationStore>((set) => ({
  open: false,
  variant: 'success',
  title: '',
  message: '',
  errorType: undefined,
  onConfirm: undefined,

  show: (payload) =>
    set({
      open: true,
      variant: payload.variant,
      title: payload.title,
      message: payload.message,
      errorType: payload.errorType,
      onConfirm: payload.onConfirm
    }),

  dismiss: () =>
    set({
      open: false,
      onConfirm: undefined,
      errorType: undefined
    })
}))

// ---------------------------------------------------------------------------
// Helper: persist error to DB via API (fire-and-forget)
// ---------------------------------------------------------------------------

/**
 * persistError.
 * @param message - Parameter for persistError.
 * @param type - Parameter for persistError.
 * @param stack? - Parameter for persistError.
 * @returns Result from persistError.
 */
function persistError(message: string, type: ErrorType, stack?: string) {
  // Intentionally not awaited — we never block the UI on logging
  apiClient
    .post('/errors', { message, stack, type })
    .catch(() => {
      // Silently fail — console.error in dev only
      if (process.env.NODE_ENV === 'development') {
        console.error('[notification/store] Failed to persist error to DB')
      }
    })
}

// ---------------------------------------------------------------------------
// Exported convenience functions — callable from anywhere
// ---------------------------------------------------------------------------

/**
 * showSuccess.
 * @param message - Parameter for showSuccess.
 * @returns Result from showSuccess.
 */
export function showSuccess(message: string) {
  useNotificationStore.getState().show({
    variant: 'success',
    title: 'Success',
    message
  })
}

/**
 * showWarning.
 * @param message - Parameter for showWarning.
 * @returns Result from showWarning.
 */
export function showWarning(message: string) {
  useNotificationStore.getState().show({
    variant: 'warning',
    title: 'Warning',
    message
  })
}

/**
 * Show an error dialog.
 *
 * Overloads:
 *   showError("Something went wrong")
 *   showError({ type: "SERVER", message: "User Not Found" }, true)
 *   showError(err)          // Error or AxiosError — auto-extracts
 *   showError(err, true)    // same + log to DB
 */
export function showError(
  input: string | Error | { type: ErrorType; message: string },
  logError?: boolean
) {
  let message: string
  let errorType: ErrorType = 'UNKNOWN'
  let stack: string | undefined

  if (typeof input === 'string') {
    message = input
  } else if (input instanceof Error) {
    // AxiosError check — axios attaches `isAxiosError` and `response`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axiosErr = input as any
    if (axiosErr.isAxiosError) {
      message =
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        'Network error'
      errorType = axiosErr.response ? 'SERVER' : 'NETWORK'
    } else {
      message = input.message || 'An unexpected error occurred'
      errorType = 'CLIENT'
    }
    stack = input.stack
  } else {
    // { type, message } object
    message = input.message
    errorType = input.type
  }

  useNotificationStore.getState().show({
    variant: 'error',
    title: 'Error',
    message,
    errorType
  })

  if (logError) {
    persistError(message, errorType, stack)
  }
}

/**
 * showConfirm.
 * @param message - Parameter for showConfirm.
 * @param onConfirm - Parameter for showConfirm.
 * @returns Result from showConfirm.
 */
export function showConfirm(message: string, onConfirm: () => void) {
  useNotificationStore.getState().show({
    variant: 'confirm',
    title: 'Confirm',
    message,
    onConfirm
  })
}

/**
 * dismiss.
 * @returns Result from dismiss.
 */
export function dismiss() {
  useNotificationStore.getState().dismiss()
}
