import type { AddItemsToBinArgs } from '@/types/stock'
import { createBinOperationsFromItem } from './create-bin-operations-from-item'

/**
 * addItemsToBin.
 * @param args - Parameter for addItemsToBin.
 * @returns Result from addItemsToBin.
 */
export async function addItemsToBin(args: AddItemsToBinArgs) {
  return createBinOperationsFromItem({
    ...args,
    operation: 'adjustment'
  })
}
