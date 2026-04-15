import { createBinOperationsFromItem } from './create-bin-operations-from-item'
import type { AddItemsToBinArgs } from '../types'

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
