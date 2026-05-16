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

export function downloadJson<T>(records: T[], filename: string): void {
  const name = filename.endsWith('.json') ? filename : `${filename}.json`
  const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' })
  triggerDownload(blob, name)
}
