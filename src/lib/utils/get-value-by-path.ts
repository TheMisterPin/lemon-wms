export function getValueByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined
    }
    return (acc as Record<string, unknown>)[key]
  }, obj)
}

export function formatDisplayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—'
  }
  if (value instanceof Date) {
    return value.toLocaleDateString()
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }
  return String(value)
}
