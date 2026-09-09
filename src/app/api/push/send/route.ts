import { NextResponse } from 'next/server'

// Called by Vercel cron (daily challenge reminder) or manually
// Requires: web-push npm package + VAPID keys in env
export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: load subscriptions from Supabase, send with web-push
  // import webpush from 'web-push'
  // webpush.setVapidDetails(...)
  // await Promise.allSettled(subs.map(s => webpush.sendNotification(s, payload)))

  return NextResponse.json({ ok: true, message: 'Push not yet wired to DB' })
}
