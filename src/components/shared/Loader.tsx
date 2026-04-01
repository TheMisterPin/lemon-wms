import React from 'react'

export default function Loader(text?: string) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="size-8 rounded-full border-2 border-brand-primary/30 border-t-brand-primary animate-spin" />
      <p className="text-sm text-brand-muted">
        {text ?? 'Loading...'}
      </p>
    </div>
  )
}
