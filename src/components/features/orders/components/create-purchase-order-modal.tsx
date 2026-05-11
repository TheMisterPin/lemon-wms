'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/orders/create-purchase-order-modal.md
 */

import { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { z } from 'zod'

import { GenericTable } from '@/components/primitives/tables/generic-table'
import { useErrorDialog } from '@/components/shared/use-error-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { UniversalModal } from '@/components/universal-modal'
import { dashboardApiClient } from '@/lib/axios'
import type { ColumnConfig } from '@/types/components/table/column.types'
import { DEFAULT_GENERIC_TABLE_PAGE_SIZE } from '@/types/components/table/generic-table.types'
import type { ApiResponse } from '@/types/responses/basic-response'

type SupplierOption = { id: string; name: string }
type WarehouseOption = { id: string; name: string }
type SupplierItem = { id: string; sku: string; name: string; uom: string }
type ItemSelection = { checked: boolean; quantity: string }

const step1Schema = z.object({
  orderNo: z.string().trim().min(1, 'Order reference is required.'),
  businessPartyId: z.string().trim().min(1, 'Supplier is required.'),
  warehouseId: z.string().trim().min(1, 'Warehouse is required.')
})

function buildOrderNo(orderType: string, existingOrderCount: number): string {
  const prefix = orderType === 'purchase'
    ? 'PRCH'
    : orderType.slice(0, 4).toUpperCase().padEnd(4, 'X')

  const next = String(existingOrderCount + 1).padStart(4, '0')

  return `${prefix}-${next}`
}

function getApiMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const payload = error.response?.data as ApiResponse<unknown> | undefined
  if (payload?.message && payload.message.trim().length > 0) {
    return payload.message
  }

  return fallback
}

type Props = {
  orderType: string
  existingOrderCount: number
  onCreated: () => Promise<void>
}

export function CreatePurchaseOrderModal({
  orderType,
  existingOrderCount,
  onCreated
}: Props) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingMeta, setIsLoadingMeta] = useState(false)
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([])
  const [items, setItems] = useState<SupplierItem[]>([])
  const [selections, setSelections] = useState<Record<string, ItemSelection>>({})

  const [orderNo, setOrderNo] = useState(buildOrderNo(orderType, existingOrderCount))
  const [businessPartyId, setBusinessPartyId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { reportError } = useErrorDialog()

  useEffect(() => {
    if (!open) {
      return
    }

    setOrderNo(buildOrderNo(orderType, existingOrderCount))
  }, [existingOrderCount, open, orderType])

  useEffect(() => {
    if (!open) {
      return
    }

    async function loadMeta() {
      setIsLoadingMeta(true)
      try {
        const [suppliersRes, warehousesRes] = await Promise.all([
          dashboardApiClient.get<ApiResponse<SupplierOption[]>>('/dashboard/business-parties'),
          dashboardApiClient.get<ApiResponse<Array<{ id: string; name: string }>>>('/dashboard/warehouses')
        ])

        setSuppliers(suppliersRes.data ?? [])
        setWarehouses((warehousesRes.data ?? []).map(row => ({ id: row.id, name: row.name })))
      } catch (error) {
        reportError(error, {
          title: 'Unable to load create form data',
          source: 'dashboard/orders/create-meta',
          messageOverride: getApiMessage(error, 'Unable to load suppliers and warehouses.')
        })
      } finally {
        setIsLoadingMeta(false)
      }
    }

    void loadMeta()
  }, [open, reportError])

  async function loadSupplierItems(nextSupplierId: string) {
    setIsLoadingItems(true)
    setItems([])
    setSelections({})
    try {
      const res = await dashboardApiClient.get<ApiResponse<SupplierItem[]>>(
        `/dashboard/business-parties/${encodeURIComponent(nextSupplierId)}`
      )

      setItems(res.data ?? [])
    } catch (error) {
      reportError(error, {
        title: 'Unable to load supplier items',
        source: 'dashboard/orders/create-items',
        messageOverride: getApiMessage(error, 'Unable to load supplier item catalog.')
      })
    } finally {
      setIsLoadingItems(false)
    }
  }

  const itemRows = useMemo(() => items, [items])

  const itemColumns = useMemo<ColumnConfig<SupplierItem>[]>(() => ([
    {
      label: 'Select',
      cell: (row) => (
        <Checkbox
          id={`po-item-${row.id}`}
          checked={selections[row.id]?.checked === true}
          onCheckedChange={(checked) => {
            setSelections((prev) => ({
              ...prev,
              [row.id]: {
                checked: checked === true,
                quantity: prev[row.id]?.quantity ?? '1'
              }
            }))
          }}
        />
      )
    },
    { label: 'SKU', accessor: 'sku' },
    { label: 'Item', accessor: 'name' },
    { label: 'UOM', accessor: 'uom' },
    {
      label: 'Quantity',
      cell: (row) => (
        <Input
          type="number"
          min={0}
          step="0.01"
          value={selections[row.id]?.quantity ?? ''}
          disabled={selections[row.id]?.checked !== true}
          onChange={(event) => {
            const value = event.target.value
            setSelections((prev) => ({
              ...prev,
              [row.id]: {
                checked: prev[row.id]?.checked === true,
                quantity: value
              }
            }))
          }}
          className="h-8"
          aria-label={`Quantity for ${row.name}`}
        />
      )
    }
  ]), [selections])

  function resetModal() {
    setStep(1)
    setFieldErrors({})
    setBusinessPartyId('')
    setWarehouseId('')
    setItems([])
    setSelections({})
    setOpen(false)
  }

  async function handleNextStep() {
    const parsed = step1Schema.safeParse({ orderNo, businessPartyId, warehouseId })
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]
        if (typeof path === 'string') {
          nextErrors[path] = issue.message
        }
      }
      setFieldErrors(nextErrors)

      return
    }

    setFieldErrors({})
    await loadSupplierItems(businessPartyId)
    setStep(2)
  }

  async function handleCreate() {
    const baseParsed = step1Schema.safeParse({ orderNo, businessPartyId, warehouseId })
    if (!baseParsed.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of baseParsed.error.issues) {
        const path = issue.path[0]
        if (typeof path === 'string') {
          nextErrors[path] = issue.message
        }
      }
      setFieldErrors(nextErrors)

      return
    }

    const selectedLines = items
      .filter(item => selections[item.id]?.checked === true)
      .map(item => ({
        itemId: item.id,
        itemName: item.name,
        baseQuantity: Number(selections[item.id]?.quantity ?? 0)
      }))

    const linesSchema = z.array(
      z.object({
        itemId: z.string().min(1),
        itemName: z.string().min(1),
        baseQuantity: z.number().positive('Quantity must be a positive number.')
      })
    ).min(1, 'Select at least one item.')

    const linesParsed = linesSchema.safeParse(selectedLines)
    if (!linesParsed.success) {
      setFieldErrors({ lines: linesParsed.error.issues[0]?.message ?? 'Invalid lines.' })

      return
    }

    setIsSubmitting(true)
    setFieldErrors({})

    try {
      const res = await dashboardApiClient.post<ApiResponse<unknown>>(
        '/dashboard/orders/purchase/create',
        {
          orderNo,
          businessPartyId,
          warehouseId,
          lines: selectedLines
        }
      )

      if (!res.success) {
        reportError(new Error(res.message || 'Create failed.'), {
          title: 'Unable to create purchase order',
          source: 'dashboard/orders/create'
        })

        return
      }

      await onCreated()
      resetModal()
    } catch (error) {
      reportError(error, {
        title: 'Unable to create purchase order',
        source: 'dashboard/orders/create',
        messageOverride: getApiMessage(error, 'Unable to create purchase order.')
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const footer = step === 1 ? (
    <>
      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button type="button" onClick={() => void handleNextStep()} disabled={isLoadingMeta}>
        Continue
        <ChevronRight className="size-4" />
      </Button>
    </>
  ) : (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setStep(1)}
        disabled={isSubmitting}
      >
        <ChevronLeft className="size-4" />
        Back
      </Button>
      <Button
        type="button"
        onClick={() => void handleCreate()}
        disabled={isSubmitting || isLoadingItems}
      >
        Create purchase order
      </Button>
    </>
  )

  return (
    <UniversalModal
      title="New purchase order"
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetModal()

          return
        }

        setOpen(true)
      }}
      contentClassName="sm:max-w-5xl"
      trigger={(
        <Button type="button" data-icon="inline-start">
          <Plus className="size-4" />
          New purchase order
        </Button>
      )}
      footer={footer}
    >
      {step === 1 ? (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-brand-form-label">Order reference</label>
            <Input
              value={orderNo}
              onChange={event => setOrderNo(event.target.value)}
              aria-invalid={Boolean(fieldErrors.orderNo)}
            />
            {fieldErrors.orderNo ? (
              <p className="text-sm text-rose-400">{fieldErrors.orderNo}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-brand-form-label">Supplier</label>
            <Select
              value={businessPartyId}
              onValueChange={value => setBusinessPartyId(value)}
            >
              <SelectTrigger aria-invalid={Boolean(fieldErrors.businessPartyId)}>
                <SelectValue placeholder="Select supplier..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Suppliers</SelectLabel>
                  {suppliers.map(option => (
                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldErrors.businessPartyId ? (
              <p className="text-sm text-rose-400">{fieldErrors.businessPartyId}</p>
            ) : null}
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-brand-form-label">Warehouse</label>
            <Select
              value={warehouseId}
              onValueChange={value => setWarehouseId(value)}
            >
              <SelectTrigger aria-invalid={Boolean(fieldErrors.warehouseId)}>
                <SelectValue placeholder="Select warehouse..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Warehouses</SelectLabel>
                  {warehouses.map(option => (
                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldErrors.warehouseId ? (
              <p className="text-sm text-rose-400">{fieldErrors.warehouseId}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {fieldErrors.lines ? (
            <p className="text-sm text-rose-400">{fieldErrors.lines}</p>
          ) : null}
          <GenericTable
            columns={itemColumns}
            records={itemRows}
            pageSize={DEFAULT_GENERIC_TABLE_PAGE_SIZE}
            search={{
              fields: ['sku', 'name', 'uom'],
              placeholder: 'Search supplier items...'
            }}
            emptyMessage={isLoadingItems ? 'Loading supplier items...' : 'No supplier items found.'}
          />
        </div>
      )}
    </UniversalModal>
  )
}
