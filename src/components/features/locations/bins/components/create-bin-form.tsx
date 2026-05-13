'use client'

import { createBinFormConfig } from '@/components/configs/entities/bin/config'
import { CreateLocationFormDialog } from '@/components/features/locations/shared/components/create-location-form-dialog'
import { binFormSchema } from '@/lib/locations'
import type { BinFormValues } from '@/lib/locations'
import type { SelectOption } from '@/types/components/form/generic-form.types'

type CreateBinFormProps = {
  zonesList: SelectOption[]
  onCreateBin: (values: BinFormValues) => Promise<void>
  /** When set, zone is fixed and the field is hidden. */
  lockedZoneId?: string
  inline?: boolean
}

export default function CreateBinForm({
  zonesList,
  onCreateBin,
  lockedZoneId,
  inline
}: CreateBinFormProps) {
  const formConfig = createBinFormConfig(
    zonesList,
    lockedZoneId !== undefined ? { lockedZoneId } : undefined
  )

  return (
    <CreateLocationFormDialog<BinFormValues>
      inline={inline}
      triggerLabel="Add bin"
      title="Create Bin"
      description="Add a bin and assign it to a zone."
      formConfig={formConfig}
      schema={binFormSchema}
      fallbackError="Unable to create bin."
      onSubmit={onCreateBin}
    />
  )
}
