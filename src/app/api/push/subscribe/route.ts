import { NextResponse } from 'next/server'

// In production, persist subscriptions to a database (Supabase, etc.)
// For now, log and return OK — replace with real storage
export async function POST(req: Request) {
  try {
    const sub = await req.json()
    console.log('[push] new subscription:', JSON.stringify(sub).slice(0, 80))
    // TODO: save sub to Supabase table `push_subscriptions`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
