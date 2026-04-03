export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }

  return !isNaN(date.getTime())
}

export type DateInput = Date | string | number | null | undefined
export type DateDisplayType = 'date' | 'datetime' | 'time'

const DATE_LOCALE = 'en-US'
const UTC_TIME_ZONE = 'UTC'

export function parseDateValue(value: DateInput): Date | undefined {
  if (value instanceof Date) {
    return isValidDate(value) ? value : undefined
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)

    return isValidDate(date) ? date : undefined
  }

  return undefined
}

export function formatDateValue(value: DateInput, displayType: DateDisplayType): string {
  const date = parseDateValue(value)

  if (!date) {
    return ''
  }

  if (displayType === 'time') {
    return date.toLocaleTimeString(DATE_LOCALE, {
      timeZone: UTC_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (displayType === 'datetime') {
    return date.toLocaleString(DATE_LOCALE, {
      timeZone: UTC_TIME_ZONE,
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Use UTC timezone rendering to avoid local timezone shifts when Date was created from a UTC-based string.
  return date.toLocaleDateString(DATE_LOCALE, {
    timeZone: UTC_TIME_ZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export function formatDate(date: Date | undefined) {
  return formatDateValue(date, 'date')
}

export function formatDateTime(value: DateInput) {
  return formatDateValue(value, 'datetime')
}

export function formatTime(value: DateInput) {
  return formatDateValue(value, 'time')
}
