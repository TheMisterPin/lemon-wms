'use client'

import { Checkbox } from '@/components/ui/checkbox'
import {
  FieldContent,
  Field,
  FieldError,
  FieldDescription,
  FieldLabel
} from '@/components/ui/field'

interface CheckboxInputProps {
  id: string
  label: string
  value?: boolean
  onChange?: (checked: boolean) => void
  onBlur?: () => void
  description?: string
  disabled?: boolean
  error?: string
}

export function CheckboxInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  description,
  disabled,
  error
}: CheckboxInputProps) {
  return (
    <Field
      orientation="horizontal"
      data-invalid={!!error || undefined}
      data-disabled={disabled || undefined}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={value}
          onCheckedChange={(checked) => onChange?.(Boolean(checked))}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error}
        />
        <FieldContent>
          <FieldLabel htmlFor={id}>
            {label}
          </FieldLabel>
          {description && !error && (
            <FieldDescription>{description}</FieldDescription>
          )}
          <FieldError>{error}</FieldError>
        </FieldContent>
      </div>
    </Field>
  )
}
