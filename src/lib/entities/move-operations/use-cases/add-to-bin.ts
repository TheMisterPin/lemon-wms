import { createBinOperationsFromItem } from './create-bin-operations-from-item'
import type { AddItemsToBinArgs } from '../types'

export async function addItemsToBin(args: AddItemsToBinArgs) {
  return createBinOperationsFromItem({
    ...args,
    operation: 'adjustment'
  })
}
