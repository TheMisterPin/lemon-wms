import { ReactNode } from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'

export interface BaseFactboxFieldConfig {
  label: string
}

export interface AccessorFactboxFieldConfig<T extends FieldValues> extends BaseFactboxFieldConfig {
  accessor: Extract<keyof T, string>
  accessorPath?: never
  render?: never
}

export interface AccessorPathFactboxFieldConfig<T extends FieldValues> extends BaseFactboxFieldConfig {
  accessor?: never
  accessorPath: FieldPath<T>
  render?: never
}

export interface RenderFactboxFieldConfig<T extends FieldValues> extends BaseFactboxFieldConfig {
  accessor?: never
  accessorPath?: never
  render: (data: T) => ReactNode
}

export type FactboxFieldConfig<T extends FieldValues> =
  | AccessorFactboxFieldConfig<T>
  | AccessorPathFactboxFieldConfig<T>
  | RenderFactboxFieldConfig<T>

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
