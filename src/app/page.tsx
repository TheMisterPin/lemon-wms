import Link from 'next/link'
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold">
Lemon WMS
      </h1>
      <p className="text-muted-foreground">
Foundation phase bootstrap with split Office and Floor experiences.
      </p>
      <div className="flex gap-4">
        <Link className="rounded bg-black px-4 py-2 text-white" href="/login">
          Office Login
        </Link>
        <Link className="rounded bg-zinc-800 px-4 py-2 text-white" href="/floor">
          Floor Login
        </Link>
      </div>
    </main>
  )
}
