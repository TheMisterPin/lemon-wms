'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/inputs/form-date-input.md
 */

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import {
  Field,
  FieldError,
  FieldDescription,
  FieldLabel
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/components/ui/input-group'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { formatDate, isValidDate } from '@/utils/formatters/date-utils'
interface FormDateInputProps {
  label: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  onBlur?: () => void
  placeholder?: string
  id: string
  description?: string
  required?: boolean
  disabled?: boolean
  error?: string
}
export function FormDateInput(props: FormDateInputProps) {
  const {
    label,
    value,
    onChange,
    onBlur,
    placeholder = 'Select date',
    id,
    description,
    required,
    disabled,
    error
  } = props
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(value)
  const displayValue = formatDate(value)

  return (
    <Field data-invalid={!!error || undefined} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id} className="text-sm font-medium text-brand-form-label">
        {label}
        {required ? ' *' : ''}
      </FieldLabel>
      <InputGroup className="min-h-11 rounded-lg border-brand-form-border bg-brand-form-surface focus-within:border-brand-form-focus focus-within:ring-1 focus-within:ring-brand-form-focus">
        <InputGroupInput
          id={id}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className="px-4 py-2.5 text-brand-form-text placeholder:text-brand-form-placeholder"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const date = new Date(e.target.value)
            if (isValidDate(date)) {
              onChange?.(date)
              setMonth(date)
            } else {
              onChange?.(undefined)
            }
          }}
          onBlur={onBlur}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown' && !disabled) {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                id={`${id}-date-picker`}
                variant="ghost"
                size="icon-xs"
                className="text-brand-form-description hover:bg-brand-border hover:text-brand-form-text"
                aria-label="Select date"
                disabled={disabled}
                onBlur={onBlur}
              >
                <CalendarIcon data-icon="inline-end" />
                <span className="sr-only">
Select date
                </span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden border-brand-form-border bg-brand-form-surface p-0 text-brand-form-text"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              <Calendar
                mode="single"
                selected={value}
                month={month}
                onMonthChange={setMonth}
                onSelect={(date: Date | undefined) => {
                  onChange?.(date)
                  setMonth(date)
                  setOpen(false)
                  onBlur?.()
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
      {description && !error && (
        <FieldDescription className="text-sm text-brand-form-description">{description}</FieldDescription>
      )}
      <FieldError className="rounded-lg border border-brand-form-error-border bg-brand-form-error-surface px-4 py-2.5 text-sm text-brand-form-error-text">{error}</FieldError>
    </Field>
  )
}
