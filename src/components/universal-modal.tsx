'use client'

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
 buttonConfig : UniversalButtonProps;
children: React.ReactNode;
title : string;
}

export function UniversalModal(props : UniversalModalProps) {
  const { buttonConfig, children, title } = props
  const { type, text, icon, onClick } = buttonConfig
  return (
    <Dialog>
      <DialogTrigger asChild>
        <UniversalButton type={type} text={text} icon={icon} onClick={onClick} variant={buttonConfig.variant} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter className="h-1/6 bg-blue-950">

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
