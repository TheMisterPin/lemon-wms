export function humanizeEnum(value: string): string {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase())
}
export function formatTs(value?: string): string {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}
