'use client'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDisplayValue, getValueByPath } from '@/lib/utils/get-value-by-path'
import {
  FactboxFieldConfig,
  GenericFactboxProps
} from '@/types/components/factbox/generic-factbox.types'

function getFieldValue<T>(data: T, field: FactboxFieldConfig<T>): React.ReactNode {
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

export function GenericFactbox<T>({
  data,
  sections,
  title,
  className
}: GenericFactboxProps<T>) {
  if (!data) {
    return (
      <Card className={`p-4 ${className ?? ''}`}>
        <p className="text-sm text-muted-foreground">No data selected.</p>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className ?? ''}`}>
      {title && (
        <>
          <h3 className="text-sm font-semibold mb-3">{title}</h3>
          <Separator className="mb-3" />
        </>
      )}
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {sectionIndex > 0 && <Separator className="my-3" />}
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {section.title}
          </h4>
          <dl className="space-y-1.5">
            {section.fields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="flex justify-between text-sm">
                <dt className="text-muted-foreground">{field.label}</dt>
                <dd className="font-medium text-right">{getFieldValue(data, field)}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </Card>
  )
}
