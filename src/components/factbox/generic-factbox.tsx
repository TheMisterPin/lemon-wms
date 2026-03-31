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
      <Card className={[
        'rounded-xl border border-brand-glass-border bg-brand-glass backdrop-blur-sm shadow-lg shadow-black/10',
        className
      ].filter(Boolean).join(' ')}>
        <CardContent className="py-8">
          <p className="text-sm text-brand-subtle text-center">No data selected.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={[
      'rounded-xl border border-brand-glass-border bg-brand-glass backdrop-blur-sm shadow-lg shadow-black/10',
      className
    ].filter(Boolean).join(' ')}>
      {title && (
        <CardHeader className="gap-1 pb-3">
          <CardTitle className="text-sm font-semibold text-brand-text">{title}</CardTitle>
          <CardDescription className="text-brand-subtle text-xs">Details</CardDescription>
        </CardHeader>
      )}
      <CardContent className="flex flex-col gap-4">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="flex flex-col gap-2.5">
            {sectionIndex > 0 && <Separator className="bg-brand-glass-border" />}
            <h4 className="text-[11px] font-semibold tracking-widest text-brand-subtle uppercase">
              {section.title}
            </h4>
            <dl className="flex flex-col gap-2">
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="flex items-start justify-between gap-4 text-sm rounded-lg px-3 py-1.5 transition-colors duration-200 hover:bg-brand-glass-hover"
                >
                  <dt className="text-brand-muted">{field.label}</dt>
                  <dd className="font-medium text-right text-brand-text">{getFieldValue(data, field)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
