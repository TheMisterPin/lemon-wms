import { describe, expect, it } from 'vitest'

import { verifyImportDataShape } from '@/lib/import-export/verify-import-data-shape'

// ────────────────────────────────────────────────────────────────────────────
// Warehouses
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataShape — warehouses', () => {
  it('returns a valid warehouse in the valid array', () => {
    const result = verifyImportDataShape('warehouses', [{ name: 'Warehouse A', status: 'ACTIVE' }])
    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
    expect(result.valid[0]).toMatchObject({ name: 'Warehouse A', status: 'ACTIVE' })
  })

  it('normalises lowercase enum to uppercase', () => {
    const result = verifyImportDataShape('warehouses', [{ name: 'WH', status: 'active' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).status).toBe('ACTIVE')
  })

  it('assigns default status when status is blank string', () => {
    const result = verifyImportDataShape('warehouses', [{ name: 'WH', status: '' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).status).toBe('ACTIVE')
  })

  it('assigns default status when status is omitted', () => {
    const result = verifyImportDataShape('warehouses', [{ name: 'WH' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).status).toBe('ACTIVE')
  })

  it('rejects an invalid enum value and returns enumOptions', () => {
    const result = verifyImportDataShape('warehouses', [{ name: 'WH', status: 'OPEN' }])
    expect(result.invalid).toHaveLength(1)
    const err = result.invalid[0].errors.find((e) => e.field === 'status')
    expect(err).toBeDefined()
    expect(err?.enumOptions).toEqual(expect.arrayContaining(['ACTIVE', 'INACTIVE', 'ARCHIVED']))
  })

  it('rejects a record missing the required name field', () => {
    const result = verifyImportDataShape('warehouses', [{ status: 'ACTIVE' }])
    expect(result.invalid).toHaveLength(1)
    const err = result.invalid[0].errors.find((e) => e.field === 'name')
    expect(err).toBeDefined()
  })

  it('rejects non-object entries (null, number, string)', () => {
    const result = verifyImportDataShape('warehouses', [null, 42, 'text'])
    expect(result.invalid).toHaveLength(3)
    expect(result.valid).toHaveLength(0)
  })

  it('correctly splits a mixed valid/invalid array', () => {
    const records = [
      { name: 'Good WH', status: 'ACTIVE' },
      { status: 'OPEN' },           // invalid enum + missing name
      { name: 'Another WH' },       // valid (default status)
    ]
    const result = verifyImportDataShape('warehouses', records)
    expect(result.valid).toHaveLength(2)
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].index).toBe(1)
  })

  it('strips and tolerates extra unknown fields', () => {
    const result = verifyImportDataShape('warehouses', [{ name: 'WH', unknownField: 'ignored' }])
    expect(result.valid).toHaveLength(1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Zones
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataShape — zones', () => {
  const validZone = { warehouseId: 'WH-0001', name: 'Zone A', type: 'GENERAL', isActive: true }

  it('returns a valid zone', () => {
    const result = verifyImportDataShape('zones', [validZone])
    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
  })

  it('assigns default type when type is blank', () => {
    const result = verifyImportDataShape('zones', [{ ...validZone, type: '' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).type).toBe('GENERAL')
  })

  it('normalises zone type case', () => {
    const result = verifyImportDataShape('zones', [{ ...validZone, type: 'cold' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).type).toBe('COLD')
  })

  it('rejects invalid zone type and returns enum options', () => {
    const result = verifyImportDataShape('zones', [{ ...validZone, type: 'FREEZER' }])
    expect(result.invalid).toHaveLength(1)
    const err = result.invalid[0].errors.find((e) => e.field === 'type')
    expect(err?.enumOptions).toEqual(
      expect.arrayContaining(['GENERAL', 'COLD', 'HAZMAT', 'QUARANTINE', 'STAGING', 'RETURNS'])
    )
  })

  it('rejects a zone missing warehouseId', () => {
    const result = verifyImportDataShape('zones', [{ name: 'Zone A', type: 'GENERAL' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors.some((e) => e.field === 'warehouseId')).toBe(true)
  })

  it('coerces string "true" to boolean isActive', () => {
    const result = verifyImportDataShape('zones', [{ ...validZone, isActive: 'true' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).isActive).toBe(true)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Bins
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataShape — bins', () => {
  const validBin = {
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0001',
    name: 'Bin A',
    code: 'BIN-0001',
    type: 'GENERAL',
  }

  it('returns a valid bin', () => {
    const result = verifyImportDataShape('bins', [validBin])
    expect(result.valid).toHaveLength(1)
  })

  it('coerces string number to number for maxCapacity', () => {
    const result = verifyImportDataShape('bins', [{ ...validBin, maxCapacity: '100' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).maxCapacity).toBe(100)
  })

  it('rejects negative maxWeightKg', () => {
    const result = verifyImportDataShape('bins', [{ ...validBin, maxWeightKg: -5 }])
    expect(result.invalid).toHaveLength(1)
  })

  it('accepts null maxWeightKg', () => {
    const result = verifyImportDataShape('bins', [{ ...validBin, maxWeightKg: null }])
    expect(result.valid).toHaveLength(1)
  })

  it('assigns default bin type when blank', () => {
    const result = verifyImportDataShape('bins', [{ ...validBin, type: '' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).type).toBe('GENERAL')
  })

  it('rejects invalid bin type with enumOptions', () => {
    const result = verifyImportDataShape('bins', [{ ...validBin, type: 'STORAGE' }])
    expect(result.invalid).toHaveLength(1)
    const err = result.invalid[0].errors.find((e) => e.field === 'type')
    expect(err?.enumOptions).toEqual(
      expect.arrayContaining(['GENERAL', 'RECEIVING', 'OUTGOING', 'QUARANTINE', 'STAGING'])
    )
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataShape — users', () => {
  const validUser = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    role: 'OWNER',
    loginType: 'CREDENTIAL',
    isActive: true,
  }

  it('returns a valid user', () => {
    const result = verifyImportDataShape('users', [validUser])
    expect(result.valid).toHaveLength(1)
  })

  it('rejects an invalid role with enumOptions', () => {
    const result = verifyImportDataShape('users', [{ ...validUser, role: 'ADMIN' }])
    expect(result.invalid).toHaveLength(1)
    const err = result.invalid[0].errors.find((e) => e.field === 'role')
    expect(err?.enumOptions).toEqual(
      expect.arrayContaining(['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER'])
    )
  })

  it('normalises role case', () => {
    const result = verifyImportDataShape('users', [{ ...validUser, role: 'owner' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).role).toBe('OWNER')
  })

  it('assigns default loginType when blank', () => {
    const result = verifyImportDataShape('users', [{ ...validUser, loginType: '' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).loginType).toBe('CREDENTIAL')
  })

  it('rejects when firstName is missing', () => {
    const { firstName: _, ...rest } = validUser
    const result = verifyImportDataShape('users', [rest])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors.some((e) => e.field === 'firstName')).toBe(true)
  })

  it('rejects when role is missing', () => {
    const { role: _, ...rest } = validUser
    const result = verifyImportDataShape('users', [rest])
    expect(result.invalid).toHaveLength(1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Items
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataShape — items', () => {
  const validItem = {
    sku: 'ITEM-0001',
    name: 'Battery AA',
    uom: 'PZ',
    trackingMode: 'NONE',
    isActive: true,
    minQuantity: 0,
  }

  it('returns a valid item', () => {
    const result = verifyImportDataShape('items', [validItem])
    expect(result.valid).toHaveLength(1)
  })

  it('assigns default trackingMode when blank', () => {
    const result = verifyImportDataShape('items', [{ ...validItem, trackingMode: '' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).trackingMode).toBe('NONE')
  })

  it('rejects invalid trackingMode with enumOptions', () => {
    const result = verifyImportDataShape('items', [{ ...validItem, trackingMode: 'BATCH' }])
    expect(result.invalid).toHaveLength(1)
    const err = result.invalid[0].errors.find((e) => e.field === 'trackingMode')
    expect(err?.enumOptions).toEqual(expect.arrayContaining(['NONE', 'LOT', 'SERIAL', 'FIFO']))
  })

  it('coerces string minQuantity to number', () => {
    const result = verifyImportDataShape('items', [{ ...validItem, minQuantity: '10' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).minQuantity).toBe(10)
  })

  it('parses dimensions JSON string into object', () => {
    const result = verifyImportDataShape('items', [
      { ...validItem, dimensions: '{"l":10,"w":5,"h":3}' }
    ])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).dimensions).toMatchObject({ l: 10, w: 5, h: 3 })
  })

  it('rejects when sku is missing', () => {
    const result = verifyImportDataShape('items', [{ name: 'Item', uom: 'PZ', trackingMode: 'NONE' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors.some((e) => e.field === 'sku')).toBe(true)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Devices
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataShape — devices', () => {
  const validDevice = {
    name: 'Device Alpha',
    code: 'DV-ALPHA',
    type: 'FLOOR',
    subType: 'TERMINAL',
  }

  it('returns a valid device', () => {
    const result = verifyImportDataShape('devices', [validDevice])
    expect(result.valid).toHaveLength(1)
  })

  it('assigns default type and subType when blank', () => {
    const result = verifyImportDataShape('devices', [{ ...validDevice, type: '', subType: '' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).type).toBe('FLOOR')
    expect((result.valid[0] as Record<string, unknown>).subType).toBe('TERMINAL')
  })

  it('normalises device type case', () => {
    const result = verifyImportDataShape('devices', [{ ...validDevice, type: 'tablet', subType: 'handheld_scanner' }])
    expect(result.valid).toHaveLength(1)
    expect((result.valid[0] as Record<string, unknown>).type).toBe('TABLET')
    expect((result.valid[0] as Record<string, unknown>).subType).toBe('HANDHELD_SCANNER')
  })

  it('rejects invalid device type with enumOptions', () => {
    const result = verifyImportDataShape('devices', [{ ...validDevice, type: 'DRONE' }])
    expect(result.invalid).toHaveLength(1)
    const err = result.invalid[0].errors.find((e) => e.field === 'type')
    expect(err?.enumOptions).toEqual(expect.arrayContaining(['FLOOR', 'HANDHELD', 'PC', 'TABLET']))
  })

  it('rejects when name is missing', () => {
    const { name: _, ...rest } = validDevice
    const result = verifyImportDataShape('devices', [rest])
    expect(result.invalid).toHaveLength(1)
  })
})
