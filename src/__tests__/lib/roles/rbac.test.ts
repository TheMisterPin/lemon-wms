import { describe, expect, it } from 'vitest'

import { DomainError } from '@/lib/errors'
import {
  assertCan,
  assertCanAssignRole,
  can,
  canAssignRole,
  canMessageByRole,
  canOfficeManagerAssignRole,
  RbacPermission
} from '@/lib/roles'

describe('can', () => {
  it('Owner has every permission', () => {
    expect(can('OWNER', RbacPermission.ARCHIVE_WAREHOUSE)).toBe(true)
    expect(can('OWNER', RbacPermission.ORDER_EXECUTE_FLOOR)).toBe(true)
    expect(can('OWNER', RbacPermission.REPORT_VIEW_ACTIVITY_AUDIT)).toBe(true)
  })

  it('OM matches matrix exclusions', () => {
    expect(can('OFFICE_MANAGER', RbacPermission.CREATE_WAREHOUSE)).toBe(false)
    expect(can('OFFICE_MANAGER', RbacPermission.ORDER_EXECUTE_FLOOR)).toBe(false)
    expect(can('OFFICE_MANAGER', RbacPermission.ITEM_CREATE)).toBe(true)
    expect(can('OFFICE_MANAGER', RbacPermission.REPORT_VIEW_ACTIVITY_AUDIT)).toBe(true)
  })

  it('OW is draft + reports only for writes', () => {
    expect(can('OFFICE_WORKER', RbacPermission.ORDER_DRAFT_CREATE)).toBe(true)
    expect(can('OFFICE_WORKER', RbacPermission.REPORT_VIEW)).toBe(true)
    expect(can('OFFICE_WORKER', RbacPermission.ORDER_CONFIRM_RELEASE)).toBe(false)
    expect(can('OFFICE_WORKER', RbacPermission.REPORT_VIEW_ACTIVITY_AUDIT)).toBe(false)
  })

  it('WM has floor + warehouse deletes, not office item edit', () => {
    expect(can('WAREHOUSE_MANAGER', RbacPermission.ORDER_EXECUTE_FLOOR)).toBe(true)
    expect(can('WAREHOUSE_MANAGER', RbacPermission.DELETE_WAREHOUSE_RECORD)).toBe(true)
    expect(can('WAREHOUSE_MANAGER', RbacPermission.ITEM_EDIT)).toBe(false)
    expect(can('WAREHOUSE_MANAGER', RbacPermission.USER_CHANGE_ROLE)).toBe(false)
  })

  it('WW only executes on floor', () => {
    expect(can('WAREHOUSE_WORKER', RbacPermission.ORDER_EXECUTE_FLOOR)).toBe(true)
    expect(can('WAREHOUSE_WORKER', RbacPermission.REPORT_VIEW)).toBe(false)
    expect(can('WAREHOUSE_WORKER', RbacPermission.ORDER_DRAFT_CREATE)).toBe(false)
  })
})

describe('assertCan', () => {
  it('throws DomainError 403 when denied', () => {
    expect(() =>
      assertCan('OFFICE_WORKER', RbacPermission.ORDER_CANCEL)
    ).toThrow(DomainError)
    try {
      assertCan('OFFICE_WORKER', RbacPermission.ORDER_CANCEL)
    } catch (e) {
      expect(e).toMatchObject({ status: 403, code: 'FORBIDDEN' })
    }
  })
})

describe('canAssignRole', () => {
  it('Owner assigns any', () => {
    expect(canAssignRole('OWNER', 'OWNER')).toBe(true)
    expect(canAssignRole('OWNER', 'WAREHOUSE_MANAGER')).toBe(true)
  })

  it('OM blocked from Owner and WM', () => {
    expect(canOfficeManagerAssignRole('OWNER')).toBe(false)
    expect(canOfficeManagerAssignRole('WAREHOUSE_MANAGER')).toBe(false)
    expect(canOfficeManagerAssignRole('OFFICE_WORKER')).toBe(true)
  })
})

describe('assertCanAssignRole', () => {
  it('OM cannot assign WM', () => {
    expect(() =>
      assertCanAssignRole('OFFICE_MANAGER', 'WAREHOUSE_MANAGER')
    ).toThrow(DomainError)
  })
})

describe('canMessageByRole', () => {
  it('Owner to anyone', () => {
    expect(canMessageByRole('OWNER', 'WAREHOUSE_WORKER')).toBe(true)
  })

  it('OW only OM', () => {
    expect(canMessageByRole('OFFICE_WORKER', 'OFFICE_MANAGER')).toBe(true)
    expect(canMessageByRole('OFFICE_WORKER', 'WAREHOUSE_WORKER')).toBe(false)
  })

  it('WW to WM or WW', () => {
    expect(canMessageByRole('WAREHOUSE_WORKER', 'WAREHOUSE_MANAGER')).toBe(true)
    expect(canMessageByRole('WAREHOUSE_WORKER', 'OFFICE_MANAGER')).toBe(false)
  })
})
