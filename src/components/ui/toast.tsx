/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/ui/toast.md
 */

import * as React from 'react'

export interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  variant?: 'default' | 'destructive'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement

export {}
