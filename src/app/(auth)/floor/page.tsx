export default function FloorLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen min-w-[375px] max-w-md flex-col justify-center gap-3 p-6">
      <h1 className="text-2xl font-semibold">Floor badge + PIN login</h1>
      <p className="text-sm text-muted-foreground">Use device code, badge number, and 4-digit PIN with /api/auth/floor/login.</p>
    </main>
  )
}
