export function formatDate(date: Date | undefined) {
  if (!date) {
    return ''
  }

  return date.toLocaleDateString('en-US', {
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
