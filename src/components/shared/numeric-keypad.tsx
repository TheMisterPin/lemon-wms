'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/shared/numeric-keypad.md
 */


// TODO: `onChangeUser` is a login-specific concern that couples this generic
// keypad to auth semantics. Refactor to generic secondary-action props:
//   onSecondaryAction?: () => void
//   secondaryActionLabel?: string
// The floor login form can then pass onSecondaryAction={handleChangeUser} and
// secondaryActionLabel="Change user" without leaking domain knowledge here.

// TODO: The '⌫' and '✓' emoji have no aria-label, making them inaccessible to
// screen readers. Add aria-label="Delete" and aria-label="Confirm" to those buttons.

// TODO: Add a `disabled?: boolean` prop so callers can lock the keypad during
// async operations (e.g. while submitLogin is in flight). Currently the keypad
// stays fully interactive while the loading spinner is shown above.

type NumericKeypadProps = {
  value: string
  onChange: (value: string) => void
  onConfirm: () => void
  onChangeUser?: () => void
  maxLength?: number
  masked?: boolean
  disabled?: boolean
  emptyLabel?: string
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'backspace', '0', 'confirm'] as const

export default function NumericKeypad({
  value,
  onChange,
  onConfirm,
  onChangeUser,
  maxLength = 4,
  masked = false,
  disabled = false,
  emptyLabel = 'Enter PIN'
}: NumericKeypadProps) {
  const handleKey = (key: string) => {
    if (disabled) {
      return
    }

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
      <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-zinc-100 min-h-13">
        {displayValue || <span className="text-zinc-600 tracking-normal text-base">{emptyLabel}</span>}
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
              disabled={disabled}
              aria-label={isBackspace ? 'Delete' : isConfirm ? 'Confirm' : key}
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

      {onChangeUser ? (
        <button
          type="button"
          disabled={disabled}
          onClick={onChangeUser}
          className="h-12 rounded-lg border border-zinc-700 bg-zinc-900 text-sm font-medium text-zinc-100 transition-colors hover:bg-zinc-800 active:bg-zinc-950"
        >
          Change user
        </button>
      ) : null}
    </div>
  )
}
