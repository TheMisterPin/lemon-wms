export const SEED_ORDER_WAREHOUSE_COUNT = 4
export const SEED_ORDER_MIN_PER_WAREHOUSE = 4
export const SEED_ORDER_MAX_PER_WAREHOUSE = 15

/** Deterministic count in [4, 15] from warehouse id and order kind (same input → same output). */
export function warehouseOrderSeedCount(warehouseId: string, kind: 'sales' | 'purchase' | 'transfer'): number {
  const key = `${warehouseId}:${kind}`
  let h = 0

  for (let i = 0; i < key.length; i += 1) {
    h = Math.imul(31, h) + key.charCodeAt(i) | 0
  }

  const span = SEED_ORDER_MAX_PER_WAREHOUSE - SEED_ORDER_MIN_PER_WAREHOUSE + 1

  return SEED_ORDER_MIN_PER_WAREHOUSE + (Math.abs(h) % span)
}
