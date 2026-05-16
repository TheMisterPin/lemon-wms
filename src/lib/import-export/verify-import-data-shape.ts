import { z } from 'zod'

import type { FieldValidationError, ImportEntity, InvalidRecord, ShapeValidationResult } from './types'

// Normalizes a string enum field: converts to uppercase, treats blank/null as the default.
function enumField<T extends [string, ...string[]]>(values: T, defaultValue?: T[number]) {
  return z.preprocess((val): unknown => {
    if (val === '' || val === null || val === undefined) {
      return defaultValue ?? val
    }
    if (typeof val === 'string') return val.trim().toUpperCase()
    return val
  }, defaultValue !== undefined ? z.enum(values).default(defaultValue) : z.enum(values))
}

// Coerces boolean from string ('true'/'1'/true/1) with a default.
function boolField(defaultValue: boolean) {
  return z.preprocess(
    (val): unknown => {
      if (val === '' || val === null || val === undefined) return defaultValue
      if (typeof val === 'boolean') return val
      if (typeof val === 'number') return val !== 0
      if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1'
      return defaultValue
    },
    z.boolean().default(defaultValue)
  )
}

// Coerces an optional non-negative decimal (handles CSV strings).
const optionalPositiveDecimal = z.preprocess((val): unknown => {
  if (val === '' || val === null || val === undefined) return undefined
  const n = Number(val)
  return Number.isNaN(n) ? val : n
}, z.number().nonnegative().optional().nullable())

// Coerces an optional non-negative integer.
const optionalNonNegativeInt = z.preprocess((val): unknown => {
  if (val === '' || val === null || val === undefined) return undefined
  const n = Number(val)
  return Number.isNaN(n) ? val : n
}, z.number().int().nonnegative().optional().nullable())

const WAREHOUSE_STATUSES = ['ACTIVE', 'INACTIVE', 'ARCHIVED'] as const
const ZONE_TYPES = ['GENERAL', 'COLD', 'HAZMAT', 'QUARANTINE', 'STAGING', 'RETURNS'] as const
const BIN_TYPES = ['GENERAL', 'RECEIVING', 'OUTGOING', 'QUARANTINE', 'STAGING'] as const
const ROLES = ['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER'] as const
const LOGIN_TYPES = ['CREDENTIAL', 'BADGE_PIN', 'BOTH'] as const
const TRACKING_MODES = ['NONE', 'LOT', 'SERIAL', 'FIFO'] as const
const DEVICE_TYPES = ['FLOOR', 'HANDHELD', 'PC', 'TABLET'] as const
const DEVICE_SUBTYPES = ['TERMINAL', 'HANDHELD_SCANNER', 'TROLLEY'] as const
const AUTH_STATUSES = ['PENDING', 'AUTHORIZED', 'REJECTED'] as const

const warehouseImportSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  address: z.string().trim().max(1000).optional().nullable(),
  timezone: z.string().trim().max(100).optional().nullable(),
  currency: z.string().trim().max(10).optional().nullable(),
  status: enumField([...WAREHOUSE_STATUSES] as [string, ...string[]], 'ACTIVE'),
})

const zoneImportSchema = z.object({
  warehouseId: z.string().trim().min(1, 'warehouseId is required'),
  name: z.string().trim().min(1, 'Name is required').max(255),
  type: enumField([...ZONE_TYPES] as [string, ...string[]], 'GENERAL'),
  isActive: boolField(true),
})

const binImportSchema = z.object({
  warehouseId: z.string().trim().min(1, 'warehouseId is required'),
  zoneId: z.string().trim().min(1, 'zoneId is required'),
  name: z.string().trim().min(1, 'Name is required').max(255),
  code: z.string().trim().min(1, 'Code is required').max(80),
  type: enumField([...BIN_TYPES] as [string, ...string[]], 'GENERAL'),
  isBlocked: boolField(false),
  maxWeightKg: optionalPositiveDecimal,
  maxVolumeM3: optionalPositiveDecimal,
  maxCapacity: optionalNonNegativeInt,
})

const userImportSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Must be a valid email address').optional().nullable(),
  role: enumField([...ROLES] as [string, ...string[]]),
  loginType: enumField([...LOGIN_TYPES] as [string, ...string[]], 'CREDENTIAL'),
  isActive: boolField(true),
})

const itemImportSchema = z.object({
  sku: z.string().trim().min(1, 'SKU is required').max(100),
  name: z.string().trim().min(1, 'Name is required').max(255),
  barcode: z.string().trim().max(100).optional().nullable(),
  categoryId: z.string().trim().optional().nullable(),
  trackingMode: enumField([...TRACKING_MODES] as [string, ...string[]], 'NONE'),
  uom: z.string().trim().min(1, 'Unit of measure is required'),
  weightKg: optionalPositiveDecimal,
  dimensions: z.preprocess((val): unknown => {
    if (val === '' || val === null || val === undefined) return undefined
    if (typeof val === 'object') return val
    if (typeof val === 'string') {
      try { return JSON.parse(val) } catch { return val }
    }
    return val
  }, z.any()),
  minQuantity: z.preprocess((val): unknown => {
    if (val === '' || val === null || val === undefined) return 0
    const n = Number(val)
    return Number.isNaN(n) ? val : n
  }, z.number().nonnegative().default(0)),
  isActive: boolField(true),
  supplierId: z.string().trim().optional().nullable(),
})

const deviceImportSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  code: z.string().trim().min(1, 'Code is required').max(80),
  warehouseId: z.string().trim().optional().nullable(),
  zoneId: z.string().trim().optional().nullable(),
  type: enumField([...DEVICE_TYPES] as [string, ...string[]], 'FLOOR'),
  subType: enumField([...DEVICE_SUBTYPES] as [string, ...string[]], 'TERMINAL'),
  authorized: boolField(false),
  authorizationStatus: enumField([...AUTH_STATUSES] as [string, ...string[]], 'PENDING'),
})

const ENTITY_SCHEMAS: Record<ImportEntity, z.ZodObject<z.ZodRawShape>> = {
  warehouses: warehouseImportSchema,
  zones: zoneImportSchema,
  bins: binImportSchema,
  users: userImportSchema,
  items: itemImportSchema,
  devices: deviceImportSchema,
}

const ENUM_OPTIONS: Partial<Record<ImportEntity, Record<string, string[]>>> = {
  warehouses: { status: [...WAREHOUSE_STATUSES] },
  zones: { type: [...ZONE_TYPES] },
  bins: { type: [...BIN_TYPES] },
  users: { role: [...ROLES], loginType: [...LOGIN_TYPES] },
  items: { trackingMode: [...TRACKING_MODES] },
  devices: { type: [...DEVICE_TYPES], subType: [...DEVICE_SUBTYPES], authorizationStatus: [...AUTH_STATUSES] },
}

function extractFieldErrors(error: z.ZodError, record: unknown, entity: ImportEntity): FieldValidationError[] {
  const enumOpts = ENUM_OPTIONS[entity] ?? {}
  return error.issues.map((issue): FieldValidationError => {
    const field = (issue.path as (string | number)[]).join('.') || '(root)'
    const received = (issue.path as (string | number)[]).reduce<unknown>(
      (obj, key) => (obj != null && typeof obj === 'object' ? (obj as Record<string, unknown>)[key as string] : undefined),
      record
    )

    // Zod v4: enum mismatch is "invalid_value" with a "values" array
    if (issue.code === 'invalid_value') {
      const vals = (issue as { values?: unknown[] }).values ?? []
      const opts = vals.filter((o): o is string => typeof o === 'string')
      return {
        field,
        issue: `Invalid value "${String(received)}" for "${field}". Valid values: ${opts.join(', ')}`,
        received,
        expected: opts.join(' | '),
        enumOptions: opts.length > 0 ? opts : enumOpts[field],
      }
    }
    if (issue.code === 'invalid_type') {
      const expected = (issue as { expected?: string }).expected ?? 'unknown'
      return {
        field,
        issue: `Expected ${expected}`,
        received,
        expected,
      }
    }
    if (issue.code === 'too_small') {
      const min = (issue as { minimum?: number | bigint }).minimum
      const origin = (issue as { origin?: string }).origin
      if (origin === 'string' && (min === 1 || Number(min) === 1)) {
        return {
          field,
          issue: `"${field}" is required and cannot be empty`,
          received,
          expected: 'non-empty string',
        }
      }
    }

    // Include enum options hint for fields we know are enums
    const enumOptions = enumOpts[field]
    return {
      field,
      issue: issue.message,
      received,
      expected: '',
      ...(enumOptions ? { enumOptions } : {}),
    }
  })
}

export function verifyImportDataShape<T>(
  entity: ImportEntity,
  records: unknown[]
): ShapeValidationResult<T> {
  const schema = ENTITY_SCHEMAS[entity]
  const valid: T[] = []
  const invalid: InvalidRecord[] = []

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    if (rec === null || typeof rec !== 'object' || Array.isArray(rec)) {
      invalid.push({
        record: rec,
        index: i,
        errors: [{ field: '(root)', issue: 'Record must be an object', received: typeof rec, expected: 'object' }],
      })
      continue
    }

    const result = schema.safeParse(rec)
    if (result.success) {
      valid.push(result.data as T)
    } else {
      invalid.push({
        record: rec,
        index: i,
        errors: extractFieldErrors(result.error, rec, entity),
      })
    }
  }

  return { valid, invalid }
}

export {
  WAREHOUSE_STATUSES,
  ZONE_TYPES,
  BIN_TYPES,
  ROLES,
  LOGIN_TYPES,
  TRACKING_MODES,
  DEVICE_TYPES,
  DEVICE_SUBTYPES,
  AUTH_STATUSES,
}
