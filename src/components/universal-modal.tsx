'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/universal-modal.md
 */


import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { UniversalButton, UniversalButtonProps } from './universal-button'

export interface UniversalModalProps {
  buttonConfig?: UniversalButtonProps
  /** Custom trigger (e.g. warehouse filter button). Use when `buttonConfig` is omitted. */
  trigger?: React.ReactNode
  children: React.ReactNode
  title: string
  footer?: React.ReactNode
  /** Controlled open state. When set, `onOpenChange` should be provided. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentClassName?: string
}

export function UniversalModal(props: UniversalModalProps) {
  const {
    buttonConfig,
    trigger,
    children,
    title,
    footer,
    open,
    onOpenChange,
    contentClassName
  } = props

  const triggerNode =
    trigger
    ?? (buttonConfig ? (
      <UniversalButton
        type={buttonConfig.type}
        text={buttonConfig.text}
        icon={buttonConfig.icon}
        onClick={buttonConfig.onClick}
        variant={buttonConfig.variant}
      />
    ) : null)

  const isControlled = open !== undefined

  return (
    <Dialog open={isControlled ? open : undefined} onOpenChange={onOpenChange}>
      {triggerNode ? <DialogTrigger asChild>{triggerNode}</DialogTrigger> : null}
      <DialogContent className={contentClassName ?? 'sm:max-w-md'}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        {footer ? <DialogFooter className="gap-2 sm:gap-0">{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  )
}
