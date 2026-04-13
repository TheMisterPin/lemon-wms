import type { ColumnStyleConfig, StyleCondition, StyleIfRule } from '@/types/components/table/column.types'
import type { RowStyleIfRule } from '@/types/components/table/generic-table.types'

import { getRowValue } from './row-access'

function toComparableNumber(value: unknown): number | undefined {
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

export function evaluateStyleCondition(
  condition: StyleCondition,
  cellValue: unknown,
  ruleValue?: unknown
): boolean {
  switch (condition) {
  case 'truthy':
    return Boolean(cellValue) && cellValue !== ''
  case 'falsy':
    return !cellValue || cellValue === ''
  case 'eq':
    return cellValue === ruleValue || String(cellValue) === String(ruleValue)
  case 'neq':
    return !(cellValue === ruleValue || String(cellValue) === String(ruleValue))
  case 'positive': {
    const n = toComparableNumber(cellValue)

    return n !== undefined && n > 0
  }
  case 'negative': {
    const n = toComparableNumber(cellValue)

    return n !== undefined && n < 0
  }
  case 'gt': {
    const a = toComparableNumber(cellValue)
    const b = toComparableNumber(ruleValue)

    return a !== undefined && b !== undefined && a > b
  }
  case 'lt': {
    const a = toComparableNumber(cellValue)
    const b = toComparableNumber(ruleValue)

    return a !== undefined && b !== undefined && a < b
  }
  case 'gte': {
    const a = toComparableNumber(cellValue)
    const b = toComparableNumber(ruleValue)

    return a !== undefined && b !== undefined && a >= b
  }
  case 'lte': {
    const a = toComparableNumber(cellValue)
    const b = toComparableNumber(ruleValue)

    return a !== undefined && b !== undefined && a <= b
  }
  default:
    return false
  }
}

export function resolveColumnStyleClassNames(
  styles: ColumnStyleConfig | undefined,
  cellValue: unknown
): string {
  if (!styles) {
    return ''
  }

  const parts: string[] = []

  if (styles.className) {
    parts.push(styles.className)
  }

  for (const rule of styles.styleIf ?? []) {
    if (evaluateStyleRule(rule, cellValue)) {
      parts.push(rule.className)
    }
  }

  return parts.filter(Boolean).join(' ')
}

function evaluateStyleRule(rule: StyleIfRule, cellValue: unknown): boolean {
  return evaluateStyleCondition(rule.condition, cellValue, rule.value)
}

export function resolveRowStyleClassNames(
  row: unknown,
  rules: RowStyleIfRule[],
  defaultClassName?: string
): string {
  const parts: string[] = []

  if (defaultClassName) {
    parts.push(defaultClassName)
  }

  for (const rule of rules) {
    const v = getRowValue(row, rule.accessor)

    if (evaluateStyleCondition(rule.condition, v, rule.value)) {
      parts.push(rule.className)
      break
    }
  }

  return parts.filter(Boolean).join(' ')
}
