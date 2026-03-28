'use client'
import { FieldValues, useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { GenericFormField } from './inputs/dynamic-form-field'
import { GenericFormProps } from '../types/components/form/generic-form.types'

function getColumnsClass(columns: 1 | 2 | 3 | 4 = 2): string {
  switch (columns) {
  case 1:
    return 'grid-cols-1'
  case 3:
    return 'grid-cols-1 md:grid-cols-3'
  case 4:
    return 'grid-cols-1 md:grid-cols-4'
  case 2:
  default:
    return 'grid-cols-1 md:grid-cols-2'
  }
}

function DynamicForm<T extends FieldValues>({
  fields,
  defaultValues,
  onSubmit,
  resolver,
  submitLabel = 'Save',
  className,
  columns = 2
}: GenericFormProps<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<T>({
    defaultValues,
    resolver
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      <div className={`grid gap-4 ${getColumnsClass(columns)}`}>
        {fields.map((field) => (
          <GenericFormField<T>
            key={String(field.name)}
            field={field}
            control={control}
            errors={errors}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default DynamicForm
