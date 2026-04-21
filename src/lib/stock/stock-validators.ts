export function decimalToNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  if (typeof value === 'object' && value !== null) {
    const parsed = Number(value.toString())
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

export function normalizePositiveQuantity(quantity: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Quantity must be greater than zero')
  }

  return Number(quantity)
}
