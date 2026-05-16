export type ImportEntity = 'warehouses' | 'zones' | 'bins' | 'users' | 'items' | 'devices'

export type FieldValidationError = {
  field: string
  issue: string
  received: unknown
  expected: string
  enumOptions?: string[]
}

export type InvalidRecord<T = unknown> = {
  record: T
  index: number
  errors: FieldValidationError[]
}

export type ShapeValidationResult<T> = {
  valid: T[]
  invalid: InvalidRecord[]
}

export type ContentValidationResult<T> = {
  valid: T[]
  invalid: InvalidRecord<T>[]
}

export type RelationCheckResult<T> = {
  toInsert: T[]
  duplicates: T[]
  invalid: InvalidRecord<T>[]
}
