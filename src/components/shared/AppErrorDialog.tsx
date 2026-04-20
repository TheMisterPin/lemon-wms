'use client'

import { ErrorModal } from '@/components/shared/ErrorModal'
import { useErrorDialog } from '@/components/shared/use-error-dialog'

export function AppErrorDialog() {
  const { currentError, isOpen, clearError } = useErrorDialog()

  return (
    <ErrorModal
      open={isOpen && currentError !== null}
      title={currentError?.title}
      message={currentError?.message ?? ''}
      code={currentError?.code}
      details={currentError?.details}
      onClose={clearError}
    />
  )
}
