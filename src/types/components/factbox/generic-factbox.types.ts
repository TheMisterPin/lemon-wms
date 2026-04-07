import { FieldValues } from 'react-hook-form'

import type { DisplayFieldConfig } from '@/types/components/shared/display-field.types'

export type FactboxFieldConfig<T extends FieldValues> = DisplayFieldConfig<T>

export interface FactboxSectionConfig<T extends FieldValues> {
  title: string
  fields: FactboxFieldConfig<T>[]
}

export interface GenericFactboxProps<T extends FieldValues> {
  data: T | null | undefined
  sections: FactboxSectionConfig<T>[]
  title?: string
  className?: string
}
