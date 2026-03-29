import Link from 'next/link'

const accessOptions = [
  {
    href: '/login',
    label: 'Office Login',
    description: 'Managers and back-office team members.'
  },
  {
    href: '/floor',
    label: 'Floor Login',
    description: 'Warehouse operators with badge + PIN access.'
  }
]

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="text-4xl font-black tracking-tight text-zinc-100">LEMON</span>
            <span className="rounded bg-amber-500 px-2 py-1 text-xs font-black uppercase tracking-widest text-zinc-950">
              WMS
            </span>
          </div>
          <p className="text-sm text-zinc-400">Warehouse Management System</p>
          <p className="mt-2 text-sm text-zinc-500">
            Choose your portal to continue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {accessOptions.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className="group rounded-xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-amber-500/60 hover:bg-zinc-900"
            >
              <p className="text-base font-semibold text-zinc-100 transition-colors group-hover:text-amber-400">
                {option.label}
              </p>
              <p className="mt-1 text-sm text-zinc-500">{option.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
