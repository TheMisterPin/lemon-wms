'use client'
import {
  Field,
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
    placeholder = 'Select an option',
    description,
    required,
    disabled,
    error
  } = props

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </FieldLabel>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>
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
