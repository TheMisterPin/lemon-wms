'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { FieldValues, Resolver, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { FieldGroup } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

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
  schema,
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
    resolver: zodResolver(schema as never) as unknown as Resolver<T>
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('flex flex-col gap-5', className)}>
      <FieldGroup className={cn('grid gap-5', getColumnsClass(columns))}>
        {fields.map((field) => (
          <GenericFormField<T>
            key={String(field.name)}
            field={field}
            control={control}
            errors={errors}
          />
        ))}
      </FieldGroup>
      <div className="mt-2 flex">
        <Button type="submit" variant="brand" size="sm" disabled={isSubmitting} className="w-1/3 mx-auto rounded-lg font-semibold">
          {isSubmitting ? (
            <>
              <Spinner data-icon="inline-start" />
              Saving...
            </>
          ) : submitLabel}
        </Button>
      </div>
    </form>
  )
}

export { DynamicForm as GenericForm }
export default DynamicForm
