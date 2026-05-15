'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/app-error-dialog.md
 */

import { ErrorModal } from '@/components/shared/error-modal'
import type { AppDialogState } from '@/components/shared/use-error-dialog'
import { useErrorDialog } from '@/components/shared/use-error-dialog'

function modalVariantFor(dialog: AppDialogState): 'error' | 'notice' | 'confirm' {
  if (dialog.kind === 'confirm') {
    return 'confirm'
  }

  if (dialog.kind === 'notice') {
    return 'notice'
  }

  return dialog.severity === 'error' ? 'error' : 'notice'
}

function noticeToneFor(dialog: AppDialogState): 'info' | 'warning' {
  if (dialog.kind !== 'error') {
    return 'info'
  }

  return dialog.severity === 'warning' ? 'warning' : 'info'
}

export function AppErrorDialog() {
  const { currentDialog, isOpen, clearError } = useErrorDialog()

  if (!isOpen || currentDialog === null) {
    return null
  }

  const variant = modalVariantFor(currentDialog)

  if (currentDialog.kind === 'confirm') {
    return (
      <ErrorModal
        variant="confirm"
        open
        title={currentDialog.title}
        message={currentDialog.message}
        code={currentDialog.code}
        confirmLabel={currentDialog.confirmLabel}
        cancelLabel={currentDialog.cancelLabel}
        onClose={clearError}
        onConfirm={currentDialog.onConfirm}
      />
    )
  }

  return (
    <ErrorModal
      variant={variant}
      noticeTone={noticeToneFor(currentDialog)}
      open
      title={currentDialog.title}
      message={currentDialog.message}
      code={currentDialog.code}
      details={currentDialog.kind === 'error' ? currentDialog.details : undefined}
      onClose={clearError}
      onRetry={currentDialog.onRetry}
      retryLabel={currentDialog.kind === 'notice' ? currentDialog.retryLabel : undefined}
    />
  )
}
