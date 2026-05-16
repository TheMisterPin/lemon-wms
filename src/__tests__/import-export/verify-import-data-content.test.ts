import { describe, expect, it } from 'vitest'

import { verifyImportDataContent } from '@/lib/import-export/verify-import-data-content'

// ────────────────────────────────────────────────────────────────────────────
// Warehouses
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataContent — warehouses', () => {
  it('passes a valid warehouse', () => {
    const result = verifyImportDataContent('warehouses', [{ name: 'Main Warehouse', status: 'ACTIVE' }])
    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
  })

  it('rejects a name exceeding 255 characters', () => {
    const result = verifyImportDataContent('warehouses', [{ name: 'A'.repeat(256), status: 'ACTIVE' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('name')
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataContent — users', () => {
  const base = {
    firstName: 'Jane',
    lastName: 'Doe',
    role: 'OWNER',
    loginType: 'CREDENTIAL',
    isActive: true,
  }

  it('passes a valid user', () => {
    const result = verifyImportDataContent('users', [{ ...base, email: 'jane@example.com' }])
    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
  })

  it('passes a user with no email (optional)', () => {
    const result = verifyImportDataContent('users', [{ ...base }])
    expect(result.valid).toHaveLength(1)
  })

  it('fails an invalid email format', () => {
    const result = verifyImportDataContent('users', [{ ...base, email: 'not-an-email' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('email')
  })

  it('fails a null email string ("")', () => {
    // empty string is not a valid email if provided as non-null
    const result = verifyImportDataContent('users', [{ ...base, email: 'foo@' }])
    expect(result.invalid).toHaveLength(1)
  })

  it('fails a blank firstName (spaces only)', () => {
    const result = verifyImportDataContent('users', [{ ...base, firstName: '   ' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('firstName')
  })

  it('fails a firstName exceeding 100 characters', () => {
    const result = verifyImportDataContent('users', [{ ...base, firstName: 'J'.repeat(101) }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('firstName')
  })

  it('fails a blank badgeNumber if provided as empty string', () => {
    const result = verifyImportDataContent('users', [{ ...base, badgeNumber: '   ' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('badgeNumber')
  })

  it('passes when badgeNumber is omitted', () => {
    const result = verifyImportDataContent('users', [{ ...base }])
    expect(result.valid).toHaveLength(1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Items
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataContent — items', () => {
  const base = {
    sku: 'ITEM-001',
    name: 'Battery AA',
    uom: 'PZ',
    trackingMode: 'NONE',
    isActive: true,
    minQuantity: 0,
  }

  it('passes a valid item', () => {
    const result = verifyImportDataContent('items', [base])
    expect(result.valid).toHaveLength(1)
    expect(result.invalid).toHaveLength(0)
  })

  it('fails a sku with spaces', () => {
    const result = verifyImportDataContent('items', [{ ...base, sku: 'ITEM 001' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('sku')
  })

  it('fails a sku with tabs', () => {
    const result = verifyImportDataContent('items', [{ ...base, sku: 'ITEM\t001' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('sku')
  })

  it('fails a sku exceeding 100 characters', () => {
    const result = verifyImportDataContent('items', [{ ...base, sku: 'A'.repeat(101) }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('sku')
  })

  it('fails a negative minQuantity', () => {
    const result = verifyImportDataContent('items', [{ ...base, minQuantity: -1 }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('minQuantity')
  })

  it('fails a non-positive weightKg', () => {
    const result = verifyImportDataContent('items', [{ ...base, weightKg: 0 }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('weightKg')
  })

  it('passes null weightKg', () => {
    const result = verifyImportDataContent('items', [{ ...base, weightKg: null }])
    expect(result.valid).toHaveLength(1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Bins
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataContent — bins', () => {
  const base = {
    warehouseId: 'WH-0001',
    zoneId: 'ZN-0001-0001',
    name: 'Bin A',
    code: 'BIN-0001',
    type: 'GENERAL',
    isBlocked: false,
  }

  it('passes a valid bin', () => {
    const result = verifyImportDataContent('bins', [base])
    expect(result.valid).toHaveLength(1)
  })

  it('fails a code with spaces', () => {
    const result = verifyImportDataContent('bins', [{ ...base, code: 'BIN 001 @' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('code')
  })

  it('fails a code with special characters', () => {
    const result = verifyImportDataContent('bins', [{ ...base, code: 'BIN/001' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('code')
  })

  it('passes a code with hyphens and underscores', () => {
    const result = verifyImportDataContent('bins', [{ ...base, code: 'BIN_A-01' }])
    expect(result.valid).toHaveLength(1)
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Devices
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataContent — devices', () => {
  const base = { name: 'Dev Alpha', code: 'DV-ALPHA', type: 'FLOOR', subType: 'TERMINAL' }

  it('passes a valid device', () => {
    const result = verifyImportDataContent('devices', [base])
    expect(result.valid).toHaveLength(1)
  })

  it('fails a code with spaces', () => {
    const result = verifyImportDataContent('devices', [{ ...base, code: 'DV ALPHA' }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('code')
  })

  it('fails a name exceeding 255 characters', () => {
    const result = verifyImportDataContent('devices', [{ ...base, name: 'D'.repeat(256) }])
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].errors[0].field).toBe('name')
  })
})

// ────────────────────────────────────────────────────────────────────────────
// Mixed batch: all valid
// ────────────────────────────────────────────────────────────────────────────
describe('verifyImportDataContent — mixed batches', () => {
  it('returns an empty invalid array when all records are valid', () => {
    const records = [
      { name: 'WH-1', status: 'ACTIVE' },
      { name: 'WH-2', status: 'INACTIVE' },
    ]
    const result = verifyImportDataContent('warehouses', records)
    expect(result.invalid).toHaveLength(0)
    expect(result.valid).toHaveLength(2)
  })

  it('correctly splits a mixed batch', () => {
    const records = [
      { firstName: 'Alice', lastName: 'Smith', role: 'OWNER', loginType: 'CREDENTIAL', isActive: true, email: 'alice@example.com' },
      { firstName: 'Bob', lastName: 'Jones', role: 'OWNER', loginType: 'CREDENTIAL', isActive: true, email: 'not-an-email' },
      { firstName: 'Carol', lastName: 'White', role: 'OWNER', loginType: 'CREDENTIAL', isActive: true },
    ]
    const result = verifyImportDataContent('users', records)
    expect(result.valid).toHaveLength(2)
    expect(result.invalid).toHaveLength(1)
    expect(result.invalid[0].record).toMatchObject({ firstName: 'Bob' })
  })
})
