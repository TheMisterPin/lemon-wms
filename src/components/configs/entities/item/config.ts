/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/misc/configs/entities/item/config.md
 */

import type { ItemFormValues, WARItem } from '@/lib/catalog/items/items-schemas'
import type { FactboxSectionConfig } from '@/types/components/factbox/generic-factbox.types'
import type { GenericFormConfig, SelectOption } from '@/types/components/form/generic-form.types'
import type { ColumnConfig } from '@/types/components/table/column.types'

export const trackingModeOptions: SelectOption[] = [
  { value: 'NONE', label: 'None (fungible)' },
  { value: 'LOT', label: 'Lot / batch' },
  { value: 'SERIAL', label: 'Serial number' },
  { value: 'FIFO', label: 'FIFO' }
]

export const uomOptions: SelectOption[] = [
  { value: 'PZ', label: 'PZ - Pieces' },
  { value: 'MT', label: 'MT - Meters' },
  { value: 'KGS', label: 'KGS - Kilograms' }
]

export const itemFormConfig: GenericFormConfig<ItemFormValues> = {
  columns: 2,
  submitLabel: 'Save item',
  defaultValues: {
    sku: '',
    name: '',
    description: null,
    barcode: null,
    categoryId: '',
    trackingMode: 'NONE',
    uom: 'PZ',
    weightKg: null,
    dimensions: null,
    minQuantity: 0,
    isActive: true,
    supplierId: null
  },
  fields: [
    {
      name: 'sku',
      label: 'SKU',
      type: 'text',
      placeholder: 'SKU-000001',
      required: true
    },
    {
      name: 'name',
      label: 'Item name',
      type: 'text',
      placeholder: 'Widget Type A',
      required: true
    },
    {
      name: 'trackingMode',
      label: 'Tracking mode',
      type: 'select',
      options: trackingModeOptions,
      required: true
    },
    {
      name: 'uom',
      label: 'Unit of measure',
      type: 'select',
      options: uomOptions,
      description: 'Uses the seeded UnitOfMeasure catalog.',
      required: true
    },
    {
      name: 'categoryId',
      label: 'Category',
      type: 'text',
      placeholder: 'CAT-0001',
      required: true
    },
    {
      name: 'supplierId',
      label: 'Supplier ID',
      type: 'text',
      placeholder: 'SUP-0001'
    },
    {
      name: 'minQuantity',
      label: 'Min stock level',
      type: 'number',
      placeholder: '0'
    },
    {
      name: 'weightKg',
      label: 'weightKg (kg)',
      type: 'number',
      placeholder: '1.5'
    },
    {
      name: 'barcode',
      label: 'Barcode',
      type: 'text',
      placeholder: '5901234123457'
    },
    {
      name: 'isActive',
      label: 'Active',
      type: 'checkbox'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      placeholder: 'Optional description',
      colSpan: 2
    }
  ]
}

export const itemTableColumns: ColumnConfig<WARItem>[] = [
  { label: 'SKU', accessor: 'sku' },
  { label: 'Name', accessor: 'name' },
  { label: 'Tracking', accessor: 'trackingMode' },
  { label: 'UOM', accessor: 'uom' },
  { label: 'Min qty', accessor: 'minQuantity' },
  { label: 'Active', accessor: 'isActive', type: 'boolean' },
  { label: 'Created', accessor: 'createdAt', type: 'date' }
]

export const itemFactboxSections: FactboxSectionConfig<WARItem>[] = [
  {
    title: 'Identity',
    fields: [
      { label: 'SKU', accessor: 'sku' },
      { label: 'Name', accessor: 'name' },
      { label: 'Barcode', accessor: 'barcode' },
      { label: 'Description', accessor: 'description' }
    ]
  },
  {
    title: 'Stock settings',
    fields: [
      { label: 'Tracking mode', accessor: 'trackingMode' },
      { label: 'Unit of measure', accessor: 'uom' },
      { label: 'Min quantity', accessor: 'minQuantity' },
      { label: 'weightKg (kg)', accessor: 'weightKg' },
      { label: 'Active', accessor: 'isActive' },
      { label: 'Category', accessor: 'categoryId' },
      { label: 'Supplier', accessor: 'supplierId' },
      { label: 'Created', accessor: 'createdAt' },
      { label: 'Deleted at', accessor: 'deletedAt' }
    ]
  }
]

export const itemCrudConfig = {
  form: itemFormConfig,
  table: itemTableColumns,
  factbox: itemFactboxSections
} as const
