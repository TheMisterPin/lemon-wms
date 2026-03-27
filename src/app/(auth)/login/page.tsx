export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 p-6">
      <h1 className="text-2xl font-semibold">
Office credential login
      </h1>
      <p className="text-sm text-muted-foreground">
POST credentials to /api/auth/login.
      </p>
    </main>
  )
}
