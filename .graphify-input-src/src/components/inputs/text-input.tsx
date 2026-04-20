'use client'
import {
  Field,
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
  value?: string | number
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
    <Field>
      <FieldLabel htmlFor={id}>
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
      />
      {description && !error && (
        <FieldDescription>
          {description}
        </FieldDescription>
      )}
      {error && (
        <FieldDescription className="text-red-500">
          {error}
        </FieldDescription>
      )}
    </Field>
  )
}
