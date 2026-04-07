import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function DashboardNotFound() {
  return (
    <main className="flex h-full items-center justify-center bg-linear-50 from-slate-800 to-slate-900 p-6">
      <Card className="w-full max-w-xl border-red-500/70 bg-red-500/10">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <h1 className="text-2xl font-semibold text-red-100">This page doesn&apos;t exist</h1>
          <Button asChild variant="brand">
            <Link href="/dashboard">Back home</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
