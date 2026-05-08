'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/notification-dialog.md
 */


import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  XCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  useNotificationStore,
  type NotificationVariant
} from '@/lib/notification/store'

const variantConfig: Record<
  NotificationVariant,
  { icon: React.ReactNode; color: string; titleColor: string }
> = {
  success: {
    icon: <CheckCircle2 className="size-6 text-[var(--color-dash-green)]" />,
    color: 'text-[var(--color-dash-green)]',
    titleColor: 'text-[var(--color-dash-green)]'
  },
  warning: {
    icon: <AlertTriangle className="size-6 text-[var(--color-dash-amber)]" />,
    color: 'text-[var(--color-dash-amber)]',
    titleColor: 'text-[var(--color-dash-amber)]'
  },
  error: {
    icon: <XCircle className="size-6 text-[var(--color-dash-red)]" />,
    color: 'text-[var(--color-dash-red)]',
    titleColor: 'text-[var(--color-dash-red)]'
  },
  confirm: {
    icon: <CircleHelp className="size-6 text-[var(--color-dash-blue)]" />,
    color: 'text-[var(--color-dash-blue)]',
    titleColor: 'text-[var(--color-dash-blue)]'
  }
}

export default function NotificationDialog() {
  const { open, variant, title, message, errorType, onConfirm, dismiss } =
    useNotificationStore()

  const config = variantConfig[variant]

  function handleConfirm() {
    onConfirm?.()
    dismiss()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && dismiss()}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <DialogTitle className={config.titleColor}>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-sm">
            {message}
          </DialogDescription>
          {variant === 'error' && errorType && (
            <span className="mt-1 inline-block w-fit rounded bg-[var(--color-dash-red-dim)] px-2 py-0.5 text-xs font-medium text-[var(--color-dash-red-text)]">
              {errorType}
            </span>
          )}
        </DialogHeader>

        <DialogFooter className="pt-2">
          {variant === 'confirm' ? (
            <>
              <Button variant="outline" onClick={dismiss}>
                Cancel
              </Button>
              <Button variant="brand" onClick={handleConfirm}>
                Confirm
              </Button>
            </>
          ) : (
            <Button variant="brand" onClick={dismiss}>
              OK
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
