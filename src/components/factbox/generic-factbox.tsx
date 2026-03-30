'use client'

import { FieldValues } from 'react-hook-form'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDisplayValue, getValueByPath } from '@/lib/utils/get-value-by-path'
import {
  FactboxFieldConfig,
  GenericFactboxProps
} from '@/types/components/factbox/generic-factbox.types'

function getFieldValue<T extends FieldValues>(data: T, field: FactboxFieldConfig<T>): React.ReactNode {
  if (field.render) {
    return field.render(data)
  }
  if (field.accessorPath) {
    return formatDisplayValue(getValueByPath(data, field.accessorPath))
  }
  if (field.accessor) {
    return formatDisplayValue(data[field.accessor])
  }

  return '—'
}

export function GenericFactbox<T extends FieldValues>({
  data,
  sections,
  title,
  className
}: GenericFactboxProps<T>) {
  if (!data) {
    return (
      <Card className={className}>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data selected.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="gap-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription>Details</CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-3">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="flex flex-col gap-2">
            {sectionIndex > 0 && <Separator />}
            <h4 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {section.title}
            </h4>
            <dl className="flex flex-col gap-1.5">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="flex items-start justify-between gap-4 text-sm">
                  <dt className="text-muted-foreground">{field.label}</dt>
                  <dd className="font-medium text-right">{getFieldValue(data, field)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
