'use client'
import {
  Control,
  Controller,
  FieldErrors,
  FieldPath,
  FieldValues
} from 'react-hook-form'
import { CheckboxInput } from './checkbox-input'
import { FormDateInput } from './form-date-input'
import { FormSelectInput } from './form-select-input'
import { TextInput } from './TextInput'
import { FormFieldConfig } from '../../types/components/form/generic-form.types'
interface GenericFormFieldProps<T extends FieldValues> {
  field: FormFieldConfig<T>
  control: Control<T>
  errors: FieldErrors<T>
}

function getNestedErrorValue(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (!acc || typeof acc !== 'object') {
      return undefined
    }

    return (acc as Record<string, unknown>)[key]
  }, value)
}

function getErrorMessage<T extends FieldValues>(
  errors: FieldErrors<T>,
  name: FieldPath<T>
): string | undefined {
  const error = getNestedErrorValue(errors, String(name))
  if (!error || typeof error !== 'object') {
    return undefined
  }
  const maybeMessage = (error as { message?: unknown }).message

  return typeof maybeMessage === 'string' ? maybeMessage : undefined
}

function getColSpanClass(colSpan?: 1 | 2 | 3 | 4): string {
  switch (colSpan) {
  case 2:
    return 'md:col-span-2'
  case 3:
    return 'md:col-span-3'
  case 4:
    return 'md:col-span-4'
  default:
    return ''
  }
}

function GenericFormField<T extends FieldValues>({
  field,
  control,
  errors
}: GenericFormFieldProps<T>) {
  if (field.hidden) {
    return null
  }
  const error = getErrorMessage(errors, field.name)
  const id = String(field.name).replace(/\./g, '-')

  return (
    <div className={getColSpanClass(field.colSpan)}>
      <Controller
        name={field.name}
        control={control}
        render={({ field: rhfField }) => {
          switch (field.type) {
          case 'text':
          case 'email':
          case 'password':
          case 'number':
            return (
              <TextInput
                id={id}
                label={field.label}
                type={field.type}
                placeholder={field.placeholder}
                description={field.description}
                required={field.required}
                disabled={field.disabled}
                value={rhfField.value ?? ''}
                onChange={(value) => {
                  if (field.type === 'number') {
                    rhfField.onChange(value === '' ? undefined : Number(value))

                    return
                  }
                  rhfField.onChange(value)
                }}
                onBlur={rhfField.onBlur}
                error={error}
              />
            )
          case 'select':
            return (
              <FormSelectInput
                id={id}
                label={field.label}
                options={field.options}
                value={typeof rhfField.value === 'string' ? rhfField.value : ''}
                onChange={rhfField.onChange}
                placeholder={field.placeholder}
                description={field.description}
                required={field.required}
                disabled={field.disabled}
                error={error}
              />
            )
          case 'date':
            return (
              <FormDateInput
                id={id}
                label={field.label}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(rhfField.value as any) instanceof Date ? rhfField.value : undefined}
                onChange={rhfField.onChange}
                placeholder={field.placeholder}
                description={field.description}
                required={field.required}
                disabled={field.disabled}
                error={error}
              />
            )
          case 'checkbox':
            return (
              <CheckboxInput
                id={id}
                label={field.label}
                checked={Boolean(rhfField.value)}
                onCheckedChange={rhfField.onChange}
                description={field.description}
                disabled={field.disabled}
                error={error}
              />
            )
          default:
            return <></>
          }
        }}
      />
    </div>
  )
}
export { GenericFormField }
