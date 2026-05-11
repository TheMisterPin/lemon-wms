'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/inputs/form-select-input.md
 */


import {
  Field,
  FieldError,
  FieldDescription,
  FieldLabel
} from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
export interface FormSelectInputElement {
  value: string
  label: string
}
interface FormSelectInputProps {
  id: string
  label: string
  options: FormSelectInputElement[]
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: boolean
  error?: string
}
export function FormSelectInput(props: FormSelectInputProps) {
  const {
    id,
    label,
    options,
    value,
    onChange,
    onBlur,
    placeholder = 'Select an option',
    description,
    required,
    disabled,
    error
  } = props

  return (
    <Field data-invalid={!!error || undefined} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id} className="text-sm font-medium text-brand-form-label">
        {label}
        {required ? ' *' : ''}
      </FieldLabel>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          className="h-auto min-h-11 w-full rounded-lg border-brand-form-border bg-brand-form-surface px-4 py-2.5 text-brand-form-text data-[placeholder]:text-brand-form-placeholder focus-visible:border-brand-form-focus focus-visible:ring-1 focus-visible:ring-brand-form-focus"
          aria-invalid={!!error}
          onBlur={onBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="border-brand-form-border bg-brand-form-surface text-brand-form-text">
          <SelectGroup>
            <SelectLabel className="text-brand-form-description">
              {label}
            </SelectLabel>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {description && !error && (
        <FieldDescription className="text-sm text-brand-form-description">{description}</FieldDescription>
      )}
      <FieldError className="rounded-lg border border-brand-form-error-border bg-brand-form-error-surface px-4 py-2.5 text-sm text-brand-form-error-text">{error}</FieldError>
    </Field>
  )
}
