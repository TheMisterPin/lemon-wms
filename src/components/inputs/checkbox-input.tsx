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
      className="min-h-11 rounded-lg border border-brand-form-border bg-brand-form-surface px-4 py-2.5"
    >
      <div className="flex min-h-6 items-center gap-3">
        <Checkbox
          id={id}
          checked={value}
          onCheckedChange={(checked) => onChange?.(Boolean(checked))}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error}
          className="border-brand-form-border bg-brand-form-surface data-[state=checked]:border-brand-form-focus data-[state=checked]:bg-brand-form-focus data-[state=checked]:text-brand-button-text"
        />
        <FieldContent>
          <FieldLabel htmlFor={id} className="text-sm font-medium text-brand-form-label">
            {label}
          </FieldLabel>
          {description && !error && (
            <FieldDescription className="text-sm text-brand-form-description">{description}</FieldDescription>
          )}
          <FieldError className="rounded-lg border border-brand-form-error-border bg-brand-form-error-surface px-4 py-2.5 text-sm text-brand-form-error-text">{error}</FieldError>
        </FieldContent>
      </div>
    </Field>
  )
}
