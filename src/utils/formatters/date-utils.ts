export function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  if (isNaN(date.getTime())) {
    return ''
  }

  // Use UTC timezone rendering to avoid local timezone shifts when Date was created from a UTC-based string
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}
export function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }

  return !isNaN(date.getTime())
}
