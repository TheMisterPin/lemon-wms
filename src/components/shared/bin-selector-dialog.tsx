'use client'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { BinList } from '@/types/warehouse'
import { UniversalButton, UniversalButtonProps } from '../universal-button'

export interface BinSelectorDialogProps {
 buttonConfig : UniversalButtonProps;
 binList : BinList
}
export function BinSelectorDialog(props : BinSelectorDialogProps) {
  const { buttonConfig, binList } = props
  const { type, text, icon, onClick } = buttonConfig

  return (
    <Dialog>
      <DialogTrigger asChild>
        <UniversalButton type={type} text={text} icon={icon} onClick={onClick} variant={buttonConfig.variant} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            Select a Bin
          </DialogTitle>
        </DialogHeader>
        {binList.bins.map((bin) => (
          <div key={bin.id}>
            {bin.name} ({bin.currentCapacity}/{bin.maxCapacity})
          </div>
        ))}
        <DialogFooter className="h-1/6 bg-blue-950">
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
