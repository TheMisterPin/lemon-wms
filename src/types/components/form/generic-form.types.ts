import {
  DefaultValues,
  FieldPath,
  FieldPathValue,
  FieldValues,
  SubmitHandler
} from 'react-hook-form'
import { z } from 'zod'

export interface SelectOption {
  value: string
  label: string
}

export type FormGridColumns = 1 | 2 | 3 | 4

interface BaseFieldConfig<T extends FieldValues, TName extends FieldPath<T> = FieldPath<T>> {
  name: TName
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  colSpan?: FormGridColumns
}

export interface TextFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'text' | 'email' | 'password'
}

export interface NumberFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'number'
}

export interface SelectFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'select'
  options: SelectOption[]
}

export interface DateFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'date'
}

export interface CheckboxFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'checkbox'
}

export type FormFieldConfig<T extends FieldValues> =
  | TextFieldConfig<T>
  | NumberFieldConfig<T>
  | SelectFieldConfig<T>
  | DateFieldConfig<T>
  | CheckboxFieldConfig<T>

export interface GenericFormConfig<T extends FieldValues> {
  fields: FormFieldConfig<T>[]
  defaultValues: DefaultValues<T>
  submitLabel?: string
  columns?: FormGridColumns
}

export interface GenericFormProps<T extends FieldValues> extends GenericFormConfig<T> {
  schema: z.ZodType<T>
  onSubmit: SubmitHandler<T>
  className?: string
  mode?: 'create' | 'edit'
}

export type NestedValue<T extends FieldValues, TName extends FieldPath<T>> = FieldPathValue<T, TName>
