import type { OperationTypeValues } from '@/types/components/table/column.types'

import { getRowValue } from './row-access'

/**
 * toFiniteNumber.
 * @param value - Parameter for toFiniteNumber.
 * @returns Result from toFiniteNumber.
 */
function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)

    if (Number.isFinite(n)) {
      return n
    }
  }

  return undefined
}

/**
 * roundResult.
 * @param n - Parameter for roundResult.
 * @param decimalRound? - Parameter for roundResult.
 * @returns Result from roundResult.
 */
function roundResult(n: number, decimalRound?: number): number {
  if (decimalRound === undefined) {
    return n
  }

  const f = 10 ** decimalRound

  return Math.round(n * f) / f
}

/**
 * Numeric result for operation columns (sort + display).
 * Division by zero yields `undefined`. `%` uses first two operands only.
 */
export function evaluateOperation(row: unknown, tv: OperationTypeValues): number | undefined {
  const operands = tv.values.map(path => toFiniteNumber(getRowValue(row, path)))
  const { operation: op } = tv

  if (op === 'fraction') {
    const a = operands[0]
    const b = operands[1]

    if (a === undefined || b === undefined || b === 0) {
      return undefined
    }

    return roundResult(a / b, tv.decimalRound)
  }

  if (operands.some(o => o === undefined)) {
    return undefined
  }

  const nums = operands as number[]

  if (op === '+') {
    return roundResult(nums.reduce((s, n) => s + n, 0), tv.decimalRound)
  }

  if (op === 'x') {
    return roundResult(nums.reduce((p, n) => p * n, 1), tv.decimalRound)
  }

  if (op === '-') {
    if (nums.length < 2) {
      return undefined
    }

    let acc = nums[0]!

    for (let i = 1; i < nums.length; i++) {
      acc -= nums[i]!
    }

    return roundResult(acc, tv.decimalRound)
  }

  if (op === '/') {
    let acc = nums[0]!

    for (let i = 1; i < nums.length; i++) {
      const d = nums[i]!

      if (d === 0) {
        return undefined
      }

      acc = acc / d
    }

    return roundResult(acc, tv.decimalRound)
  }

  if (op === '%') {
    if (nums.length < 2) {
      return undefined
    }

    return roundResult(nums[0]! % nums[1]!, tv.decimalRound)
  }

  return undefined
}
