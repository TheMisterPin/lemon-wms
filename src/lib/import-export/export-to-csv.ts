function serializeCell(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function escapeCsvCell(value: string): string {
  const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')
  if (!needsQuotes) return value
  return `"${value.replace(/"/g, '""')}"`
}

function recordsToCsv<T extends Record<string, unknown>>(records: T[]): string {
  if (records.length === 0) return ''
  const headers = Object.keys(records[0])
  const headerRow = headers.map(escapeCsvCell).join(',')
  const dataRows = records.map((record) =>
    headers.map((h) => escapeCsvCell(serializeCell(record[h]))).join(',')
  )
  return [headerRow, ...dataRows].join('\r\n')
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadCsv<T extends Record<string, unknown>>(records: T[], filename: string): void {
  const name = filename.endsWith('.csv') ? filename : `${filename}.csv`
  const csv = recordsToCsv(records)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, name)
}
