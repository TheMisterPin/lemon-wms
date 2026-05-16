function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let i = 0

  while (i <= line.length) {
    if (line[i] === '"') {
      // quoted field
      let field = ''
      i++ // skip opening quote
      while (i < line.length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            // escaped quote
            field += '"'
            i += 2
          } else {
            // closing quote
            i++
            break
          }
        } else {
          field += line[i]
          i++
        }
      }
      fields.push(field)
      if (line[i] === ',') i++ // skip comma after closing quote
    } else {
      // unquoted field: read until comma or end
      let field = ''
      while (i < line.length && line[i] !== ',') {
        field += line[i]
        i++
      }
      fields.push(field)
      if (line[i] === ',') i++ // skip comma
    }
  }

  return fields
}

export async function importFromCsv(file: File): Promise<Record<string, string>[]> {
  const text = await file.text()
  // Normalize line endings and split
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
  const nonEmpty = lines.filter((l) => l.trim().length > 0)

  if (nonEmpty.length < 2) {
    throw new Error('CSV file must have a header row and at least one data row.')
  }

  const headers = parseCsvLine(nonEmpty[0])
  if (headers.length === 0 || headers.every((h) => h.trim() === '')) {
    throw new Error('CSV file has no valid header columns.')
  }

  const records: Record<string, string>[] = []
  for (let i = 1; i < nonEmpty.length; i++) {
    const fields = parseCsvLine(nonEmpty[i])
    const record: Record<string, string> = {}
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].trim()
      if (header) {
        record[header] = fields[j] ?? ''
      }
    }
    records.push(record)
  }

  return records
}
