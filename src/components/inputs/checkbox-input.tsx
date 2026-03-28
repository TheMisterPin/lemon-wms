'use client'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Field,
  FieldDescription,
  FieldLabel
} from '@/components/ui/field'
interface CheckboxInputProps {
  id: string
  label: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  description?: string
  disabled?: boolean
  error?: string
}
export function CheckboxInput({
  id,
  label,
  checked,
  onCheckedChange,
  description,
  disabled,
  error
}: CheckboxInputProps) {
  return (
    <Field>
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange?.(Boolean(value))}
          disabled={disabled}
          aria-invalid={!!error}
        />
        <div className="space-y-1">
          <FieldLabel htmlFor={id}>
            {label}
          </FieldLabel>
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
        </div>
      </div>
    </Field>
  )
}
