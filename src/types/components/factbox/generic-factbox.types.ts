import { ReactNode } from 'react'

export interface BaseFactboxFieldConfig<T> {
  label: string
}

export interface AccessorFactboxFieldConfig<T> extends BaseFactboxFieldConfig<T> {
  accessor: keyof T & string
  accessorPath?: never
  render?: never
}

export interface AccessorPathFactboxFieldConfig<T> extends BaseFactboxFieldConfig<T> {
  accessor?: never
  accessorPath: string
  render?: never
}

export interface RenderFactboxFieldConfig<T> extends BaseFactboxFieldConfig<T> {
  accessor?: never
  accessorPath?: never
  render: (data: T) => ReactNode
}

export type FactboxFieldConfig<T> =
  | AccessorFactboxFieldConfig<T>
  | AccessorPathFactboxFieldConfig<T>
  | RenderFactboxFieldConfig<T>

export interface FactboxSectionConfig<T> {
  title: string
  fields: FactboxFieldConfig<T>[]
}

export interface GenericFactboxProps<T> {
  data: T | null | undefined
  sections: FactboxSectionConfig<T>[]
  title?: string
  className?: string
}
