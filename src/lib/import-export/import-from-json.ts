export async function importFromJson(file: File): Promise<unknown[]> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('File is not valid JSON.')
  }
  if (!Array.isArray(parsed)) {
    throw new Error('JSON file must contain an array at the top level.')
  }
  return parsed
}
