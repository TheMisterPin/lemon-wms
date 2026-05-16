'use client'

import { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

type Props = {
  onFile: (file: File) => void
  accept?: string
  disabled?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const ACCEPTED_TYPES = ['.json', '.csv']

function isValidFileType(file: File): boolean {
  return ACCEPTED_TYPES.some((ext) => file.name.toLowerCase().endsWith(ext))
}

export function FileDropZone({ onFile, accept = '.json,.csv', disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [typeError, setTypeError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelected(selected: File) {
    if (!isValidFileType(selected)) {
      setTypeError(`Only .json and .csv files are accepted. Got: ${selected.name}`)
      return
    }
    setTypeError(null)
    setFile(selected)
    onFile(selected)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelected(dropped)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFileSelected(selected)
  }

  function clearFile() {
    setFile(null)
    setTypeError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) inputRef.current?.click() }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors duration-200',
          disabled ? 'cursor-not-allowed opacity-50' : '',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/20'
            : 'border-dash-border hover:border-dash-muted hover:bg-dash-card2',
        ].join(' ')}
      >
        <Upload size={24} className="shrink-0 text-dash-muted" />
        <p className="text-sm font-medium text-dash-text">
          Drag & drop or click to select
        </p>
        <p className="text-xs text-dash-muted">Accepts .json and .csv files</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {typeError && (
        <p className="text-xs text-red-500">{typeError}</p>
      )}

      {file && !typeError && (
        <div className="flex items-center justify-between gap-2 rounded-md border border-dash-border bg-dash-card2 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-dash-text">{file.name}</p>
            <p className="text-xs text-dash-muted">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clearFile() }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-dash-muted hover:text-dash-text"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
