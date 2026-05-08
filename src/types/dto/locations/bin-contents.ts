import type { BinWithContent } from '@/lib/locations'

export type BinContentLineDto = BinWithContent['content'][number]

export type BinContentTableRowDto = BinContentLineDto & {
  statusQuantity: number
}
