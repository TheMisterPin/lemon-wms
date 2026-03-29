'use client'

type NumericKeypadProps = {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  maxLength?: number
  masked?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace', '0', 'confirm'] as const

export default function NumericKeypad({
  value,
  onChange,
  onConfirm,
  maxLength = 4,
  masked = false
}: NumericKeypadProps) {
  const handleKey = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1))
      return
    }
    if (key === 'confirm') {
      onConfirm()
      return
    }
    if (value.length < maxLength) {
      onChange(value + key)
    }
  }

  const displayValue = masked ? '•'.repeat(value.length) : value

  return (
    <div className="flex flex-col gap-3">
      {/* Display */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-zinc-100 min-h-[52px]">
        {displayValue || <span className="text-zinc-600 tracking-normal text-base">Enter PIN</span>}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => {
          const isConfirm = key === 'confirm'
          const isBackspace = key === 'backspace'

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleKey(key)}
              className={[
                'flex h-14 items-center justify-center rounded-lg text-xl font-semibold transition-colors select-none',
                isConfirm
                  ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 active:bg-amber-600'
                  : isBackspace
                  ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600 active:bg-zinc-800'
                  : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-900'
              ].join(' ')}
            >
              {isBackspace ? '⌫' : isConfirm ? '✓' : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
