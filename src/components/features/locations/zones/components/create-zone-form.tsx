'use client'

import { createZoneFormConfig } from '@/components/configs/entities/zone/config'
import { CreateLocationFormDialog } from '@/components/features/locations/shared/components/create-location-form-dialog'
import { zoneFormSchema } from '@/lib/locations'
import type { ZoneFormValues } from '@/lib/locations'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type CreateZoneFormProps = {
  warehouseList: SelectOption[]
  onCreateZone: (values: ZoneFormValues) => Promise<void>
  /** When set, warehouse is fixed and the field is hidden (e.g. edit warehouse context). */
  lockedWarehouseId?: string
  inline?: boolean
}

export default function CreateZoneForm({
  warehouseList,
  onCreateZone,
  lockedWarehouseId,
  inline
}: CreateZoneFormProps) {
  const formConfig = createZoneFormConfig(
    warehouseList,
    lockedWarehouseId !== undefined ? { lockedWarehouseId } : undefined
  )

  return (
    <CreateLocationFormDialog<ZoneFormValues>
      inline={inline}
      triggerLabel="Add zone"
      title="Create Zone"
      description="Add a zone and assign it to a warehouse."
      formConfig={formConfig}
      schema={zoneFormSchema}
      fallbackError="Unable to create zone."
      onSubmit={onCreateZone}
    />
  )
}
