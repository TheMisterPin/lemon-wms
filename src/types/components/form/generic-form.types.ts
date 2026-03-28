import {
  DefaultValues,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Resolver,
  SubmitHandler
} from 'react-hook-form'
export interface SelectOption {
  value: string
  label: string
}
interface BaseFieldConfig<T extends FieldValues> {
  name: FieldPath<T>
  label: string
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  colSpan?: 1 | 2 | 3 | 4
}
export interface TextFieldConfig<T extends FieldValues> extends BaseFieldConfig<T> {
  type: 'text' | 'number' | 'email' | 'password'
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
  | SelectFieldConfig<T>
  | DateFieldConfig<T>
  | CheckboxFieldConfig<T>
export interface GenericFormProps<T extends FieldValues> {
  fields: FormFieldConfig<T>[]
  defaultValues: DefaultValues<T>
  onSubmit: SubmitHandler<T>
  resolver?: Resolver<T>
  submitLabel?: string
  className?: string
  columns?: 1 | 2 | 3 | 4
}
export type NestedValue<T extends FieldValues, TName extends FieldPath<T>> = FieldPathValue<T, TName>
