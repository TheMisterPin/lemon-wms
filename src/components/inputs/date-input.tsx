'use client'

import * as React from 'react'

import { CalendarIcon } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { Field, FieldLabel } from '@/components/ui/field'
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
  placeholder?: string
  id?: string
}

export function FormDateInput(props: FormDateInputProps) {
  const { label, value, onChange, placeholder = 'Select date', id } = props
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date | undefined>(value)

  const displayValue = formatDate(value)

  return (
    <Field className="mx-auto w-48">
      <FieldLabel htmlFor={id}>
        {label}
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id={id}
          value={displayValue}
          placeholder={placeholder}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const date = new Date(e.target.value)
            if (isValidDate(date)) {
              onChange?.(date)
              setMonth(date)
            } else {
              onChange?.(undefined)
            }
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <InputGroupAddon align="inline-end">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton id="date-picker" variant="ghost" size="icon-xs" aria-label="Select date">
                <CalendarIcon />
                <span className="sr-only">
                  Select date
                </span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
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
                }}
              />
            </PopoverContent>
          </Popover>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
