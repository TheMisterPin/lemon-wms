'use client'

import { useRef, type KeyboardEvent } from 'react'

type ScanInputProps = {
  placeholder?: string
  onScan: (value: string) => void
  autoFocus?: boolean
  disabled?: boolean
}

export default function ScanInput({
  placeholder = 'Scan or type…',
  onScan,
  autoFocus = true,
  disabled = false
}: ScanInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const value = inputRef.current?.value.trim() ?? ''
      if (value) {
        onScan(value)
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }
    }
  }

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      autoFocus={autoFocus}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck={false}
      className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-lg text-zinc-100 placeholder-zinc-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}
