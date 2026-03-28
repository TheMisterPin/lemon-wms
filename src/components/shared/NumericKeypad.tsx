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
      <div className="border border-terminal-accent bg-black px-4 py-3 text-center font-[family-name:var(--font-terminal)] text-2xl font-semibold tracking-[0.5em] text-terminal-accent min-h-[52px]">
        {displayValue || (
          <span className="font-[family-name:var(--font-terminal-label)] text-[0.6rem] uppercase tracking-[0.2em] text-terminal-text-dim">
            ENTER PIN
          </span>
        )}
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
                'btn-clip flex h-14 items-center justify-center font-[family-name:var(--font-terminal)] text-xl font-semibold select-none transition-colors duration-[0.15s]',
                isConfirm
                  ? 'border border-terminal-accent bg-terminal-surface text-terminal-accent hover:bg-[#1a1f1a]'
                  : isBackspace
                  ? 'border border-terminal-border bg-terminal-surface text-terminal-danger hover:border-terminal-danger'
                  : 'border border-terminal-border bg-terminal-surface text-terminal-text hover:border-terminal-accent hover:text-terminal-accent'
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
