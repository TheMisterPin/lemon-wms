'use client'

import { createZoneFormConfig } from '@/components/configs/entities/zone/config'
import { CreateLocationFormDialog } from '@/components/features/locations/shared/components/create-location-form-dialog'
import { zoneFormSchema } from '@/lib/locations'
import type { ZoneFormValues } from '@/lib/locations'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type CreateZoneFormProps = {
  warehouseList: SelectOption[]
  onCreateZone: (values: ZoneFormValues) => Promise<void>
}

export default function CreateZoneForm({ warehouseList, onCreateZone }: CreateZoneFormProps) {
  const formConfig = createZoneFormConfig(warehouseList)

  return (
    <CreateLocationFormDialog<ZoneFormValues>
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
