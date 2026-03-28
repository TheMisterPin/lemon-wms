import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ data: [], message: 'Phase 1 not implemented yet' })
}
export async function POST() {
  return NextResponse.json({ error: 'Phase 1 not implemented yet' }, { status: 501 })
}
