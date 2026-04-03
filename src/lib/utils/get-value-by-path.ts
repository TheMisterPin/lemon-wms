import { FieldPath, FieldPathValue, FieldValues } from 'react-hook-form'

export const EMPTY_DISPLAY_VALUE = '—'

export function getValueByPath<T extends FieldValues, TPath extends FieldPath<T>>(
  obj: T | unknown,
  path: TPath
): FieldPathValue<T, TPath> | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined
    }

    return (acc as Record<string, unknown>)[key]
  }, obj) as FieldPathValue<T, TPath> | undefined
}

export function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return EMPTY_DISPLAY_VALUE
  }
  if (value instanceof Date) {
    return value.toLocaleDateString()
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  return String(value)
}
