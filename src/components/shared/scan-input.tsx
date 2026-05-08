'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/scan-input.md
 */


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
      className="w-full rounded-lg border border-brand-input bg-brand-surface px-4 py-3 text-lg text-brand-text placeholder-brand-subtle outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
    />
  )
}
