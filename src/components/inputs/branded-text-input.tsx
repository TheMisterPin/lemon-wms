'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/inputs/text-input.md
 */


import {
  Field,
  FieldError,
  FieldDescription,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

interface TextInputProps {
  label: string
  id: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  value?: string | number | undefined
  onChange?: (value: string) => void
  onBlur?: () => void
  error?: string
}

export function TextInput({
  label,
  id,
  type = 'text',
  placeholder,
  description,
  required,
  disabled,
  value,
  onChange,
  onBlur,
  error
}: TextInputProps) {
  return (
    <Field data-invalid={!!error || undefined} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id} className="text-sm font-medium text-brand-form-label">
        {label}
        {required ? ' *' : ''}
      </FieldLabel>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className="h-auto min-h-11 rounded-lg border-brand-form-border bg-brand-form-surface px-4 py-2.5 text-brand-form-text placeholder:text-brand-form-placeholder focus-visible:border-brand-form-focus focus-visible:ring-1 focus-visible:ring-brand-form-focus"
      />
      {description && !error && (
        <FieldDescription className="text-sm text-brand-form-description">{description}</FieldDescription>
      )}
      <FieldError className="rounded-lg border border-brand-form-error-border bg-brand-form-error-surface px-4 py-2.5 text-sm text-brand-form-error-text">{error}</FieldError>
    </Field>
  )
}
