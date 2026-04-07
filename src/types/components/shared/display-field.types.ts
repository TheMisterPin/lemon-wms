import { ReactNode } from 'react'
import { FieldPath, FieldValues } from 'react-hook-form'

export type DisplayFieldType =
  | 'text'
  | 'date'
  | 'datetime'
  | 'time'
  | 'boolean'
  | 'progress'
  | 'indicator'
  | 'joinValues'

export interface DisplayFieldBaseConfig {
  label: string
  type?: Exclude<DisplayFieldType, 'progress' | 'indicator' | 'joinValues'>
}

export interface AccessorDisplayFieldConfig<T extends FieldValues> extends DisplayFieldBaseConfig {
  accessor: Extract<keyof T, string>
  accessorPath?: never
  render?: never
}

export interface AccessorPathDisplayFieldConfig<T extends FieldValues> extends DisplayFieldBaseConfig {
  accessor?: never
  accessorPath: FieldPath<T>
  render?: never
}

export interface RenderDisplayFieldConfig<T extends FieldValues> {
  label: string
  accessor?: never
  accessorPath?: never
  render: (data: T) => ReactNode
  type?: never
}

export type IndicatorColorMap = Record<string, string>

export interface IndicatorDisplayFieldConfig<T extends FieldValues> {
  label: string
  accessor?: Extract<keyof T, string>
  accessorPath?: FieldPath<T>
  render?: never
  type: 'indicator'
  indicatorColorMap: IndicatorColorMap
  defaultIndicatorColor?: string
}

export interface ProgressBarRef<T extends FieldValues> {
  current: FieldPath<T>
  max: FieldPath<T>
}

export interface ProgressDisplayFieldConfig<T extends FieldValues> {
  label: string
  accessor?: never
  accessorPath?: never
  render?: never
  type: 'progress'
  progressBarRef: ProgressBarRef<T>
}

export interface JoinValuesRef<T extends FieldValues> {
  first: FieldPath<T>
  second: FieldPath<T>
}

export interface JoinValuesDisplayFieldConfig<T extends FieldValues> {
  label: string
  accessor?: never
  accessorPath?: never
  render?: never
  type: 'joinValues'
  joinValuesRef: JoinValuesRef<T>
  separator?: string
}

export type DisplayFieldConfig<T extends FieldValues> =
  | AccessorDisplayFieldConfig<T>
  | AccessorPathDisplayFieldConfig<T>
  | RenderDisplayFieldConfig<T>
  | IndicatorDisplayFieldConfig<T>
  | ProgressDisplayFieldConfig<T>
  | JoinValuesDisplayFieldConfig<T>
