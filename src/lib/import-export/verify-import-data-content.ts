import type { ContentValidationResult, FieldValidationError, ImportEntity, InvalidRecord } from './types'

const CODE_PATTERN = /^[A-Za-z0-9\-_]+$/
const NO_SPACES_PATTERN = /^\S+$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type ContentChecker<T> = (record: T, index: number) => FieldValidationError[]

function err(field: string, issue: string, received: unknown, expected: string): FieldValidationError {
  return { field, issue, received, expected }
}

function checkWarehouseContent(record: Record<string, unknown>): FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const name = record.name
  if (typeof name === 'string' && name.trim().length === 0) {
    errors.push(err('name', 'Name cannot be blank', name, 'non-empty string'))
  }
  if (typeof name === 'string' && name.trim().length > 255) {
    errors.push(err('name', 'Name exceeds 255 characters', name, 'string ≤ 255 chars'))
  }
  return errors
}

function checkZoneContent(record: Record<string, unknown>): FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const name = record.name
  if (typeof name === 'string' && name.trim().length === 0) {
    errors.push(err('name', 'Name cannot be blank', name, 'non-empty string'))
  }
  if (typeof name === 'string' && name.trim().length > 255) {
    errors.push(err('name', 'Name exceeds 255 characters', name, 'string ≤ 255 chars'))
  }
  const warehouseId = record.warehouseId
  if (typeof warehouseId === 'string' && warehouseId.trim().length === 0) {
    errors.push(err('warehouseId', 'warehouseId cannot be blank', warehouseId, 'non-empty string'))
  }
  return errors
}

function checkBinContent(record: Record<string, unknown>): FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const code = record.code
  if (typeof code === 'string' && !CODE_PATTERN.test(code)) {
    errors.push(err('code', 'Code must only contain letters, numbers, hyphens, and underscores', code, 'alphanumeric, hyphens, underscores'))
  }
  const name = record.name
  if (typeof name === 'string' && name.trim().length === 0) {
    errors.push(err('name', 'Name cannot be blank', name, 'non-empty string'))
  }
  if (typeof name === 'string' && name.trim().length > 255) {
    errors.push(err('name', 'Name exceeds 255 characters', name, 'string ≤ 255 chars'))
  }
  if (record.maxWeightKg !== null && record.maxWeightKg !== undefined && typeof record.maxWeightKg === 'number' && record.maxWeightKg < 0) {
    errors.push(err('maxWeightKg', 'maxWeightKg must be non-negative', record.maxWeightKg, 'number ≥ 0'))
  }
  if (record.maxVolumeM3 !== null && record.maxVolumeM3 !== undefined && typeof record.maxVolumeM3 === 'number' && record.maxVolumeM3 < 0) {
    errors.push(err('maxVolumeM3', 'maxVolumeM3 must be non-negative', record.maxVolumeM3, 'number ≥ 0'))
  }
  if (record.maxCapacity !== null && record.maxCapacity !== undefined && typeof record.maxCapacity === 'number' && record.maxCapacity < 0) {
    errors.push(err('maxCapacity', 'maxCapacity must be non-negative', record.maxCapacity, 'integer ≥ 0'))
  }
  return errors
}

function checkUserContent(record: Record<string, unknown>): FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const firstName = record.firstName
  if (typeof firstName === 'string' && firstName.trim().length === 0) {
    errors.push(err('firstName', 'First name cannot be blank', firstName, 'non-empty string'))
  }
  if (typeof firstName === 'string' && firstName.trim().length > 100) {
    errors.push(err('firstName', 'First name exceeds 100 characters', firstName, 'string ≤ 100 chars'))
  }
  const lastName = record.lastName
  if (typeof lastName === 'string' && lastName.trim().length === 0) {
    errors.push(err('lastName', 'Last name cannot be blank', lastName, 'non-empty string'))
  }
  if (typeof lastName === 'string' && lastName.trim().length > 100) {
    errors.push(err('lastName', 'Last name exceeds 100 characters', lastName, 'string ≤ 100 chars'))
  }
  const email = record.email
  if (email !== null && email !== undefined && email !== '' && typeof email === 'string' && !EMAIL_PATTERN.test(email)) {
    errors.push(err('email', 'Must be a valid email address', email, 'valid email'))
  }
  const badgeNumber = record.badgeNumber
  if (badgeNumber !== null && badgeNumber !== undefined && typeof badgeNumber === 'string' && badgeNumber.trim().length === 0) {
    errors.push(err('badgeNumber', 'Badge number cannot be blank if provided', badgeNumber, 'non-empty string or omit the field'))
  }
  return errors
}

function checkItemContent(record: Record<string, unknown>): FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const sku = record.sku
  if (typeof sku === 'string' && !NO_SPACES_PATTERN.test(sku)) {
    errors.push(err('sku', 'SKU must not contain spaces', sku, 'string without spaces'))
  }
  if (typeof sku === 'string' && sku.trim().length === 0) {
    errors.push(err('sku', 'SKU cannot be blank', sku, 'non-empty string'))
  }
  if (typeof sku === 'string' && sku.length > 100) {
    errors.push(err('sku', 'SKU exceeds 100 characters', sku, 'string ≤ 100 chars'))
  }
  const name = record.name
  if (typeof name === 'string' && name.trim().length === 0) {
    errors.push(err('name', 'Name cannot be blank', name, 'non-empty string'))
  }
  if (typeof name === 'string' && name.trim().length > 255) {
    errors.push(err('name', 'Name exceeds 255 characters', name, 'string ≤ 255 chars'))
  }
  if (record.minQuantity !== null && record.minQuantity !== undefined && typeof record.minQuantity === 'number' && record.minQuantity < 0) {
    errors.push(err('minQuantity', 'minQuantity must be non-negative', record.minQuantity, 'number ≥ 0'))
  }
  if (record.weightKg !== null && record.weightKg !== undefined && typeof record.weightKg === 'number' && record.weightKg <= 0) {
    errors.push(err('weightKg', 'weightKg must be positive', record.weightKg, 'number > 0'))
  }
  return errors
}

function checkDeviceContent(record: Record<string, unknown>): FieldValidationError[] {
  const errors: FieldValidationError[] = []
  const name = record.name
  if (typeof name === 'string' && name.trim().length === 0) {
    errors.push(err('name', 'Name cannot be blank', name, 'non-empty string'))
  }
  if (typeof name === 'string' && name.trim().length > 255) {
    errors.push(err('name', 'Name exceeds 255 characters', name, 'string ≤ 255 chars'))
  }
  const code = record.code
  if (typeof code === 'string' && !CODE_PATTERN.test(code)) {
    errors.push(err('code', 'Code must only contain letters, numbers, hyphens, and underscores', code, 'alphanumeric, hyphens, underscores'))
  }
  return errors
}

const CONTENT_CHECKERS: Record<ImportEntity, ContentChecker<Record<string, unknown>>> = {
  warehouses: checkWarehouseContent,
  zones: checkZoneContent,
  bins: checkBinContent,
  users: checkUserContent,
  items: checkItemContent,
  devices: checkDeviceContent,
}

export function verifyImportDataContent<T extends Record<string, unknown>>(
  entity: ImportEntity,
  records: T[]
): ContentValidationResult<T> {
  const checker = CONTENT_CHECKERS[entity] as ContentChecker<T>
  const valid: T[] = []
  const invalid: InvalidRecord<T>[] = []

  for (let i = 0; i < records.length; i++) {
    const errors = checker(records[i], i)
    if (errors.length === 0) {
      valid.push(records[i])
    } else {
      invalid.push({ record: records[i], index: i, errors })
    }
  }

  return { valid, invalid }
}
