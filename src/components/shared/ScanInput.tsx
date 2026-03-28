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
      className="w-full border border-terminal-border bg-black px-4 py-3 font-[family-name:var(--font-terminal)] text-base font-semibold tracking-[0.05em] text-terminal-accent outline-none transition-colors duration-[0.15s] placeholder:text-terminal-text-dim focus:border-terminal-accent disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}
