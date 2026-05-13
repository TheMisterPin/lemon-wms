type DecimalLike = { toNumber(): number }

export function toQty(value: DecimalLike): number {
  return Math.round(value.toNumber() * 100) / 100
}

type LineWithPickQuantities = {
  baseQuantity: DecimalLike
  pickLines: Array<{ quantity: DecimalLike }>
}

export function sumPickLineQuantities(pickLines: Array<{ quantity: DecimalLike }>): number {
  return pickLines.reduce((sum, row) => sum + toQty(row.quantity), 0)
}

export function computePickLineProgressPercent(lines: LineWithPickQuantities[]): number {
  if (lines.length === 0) {
    return 0
  }

  const done = lines.filter((line) => {
    const handled = sumPickLineQuantities(line.pickLines)

    return handled >= toQty(line.baseQuantity)
  }).length

  return Math.round((done / lines.length) * 100)
}
