import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const STRIPE_BASE = 'https://api.stripe.com/v1'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Verificação de assinatura Stripe sem SDK (HMAC-SHA256)
async function verifyStripeSignature(body: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = sigHeader.split(',')
    const tPart = parts.find(p => p.startsWith('t='))
    const v1Part = parts.find(p => p.startsWith('v1='))
    if (!tPart || !v1Part) return false

    const timestamp = tPart.slice(2)
    const signature = v1Part.slice(3)
    const payload = `${timestamp}.${body}`

    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const computed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
    const hex = Array.from(new Uint8Array(computed)).map(b => b.toString(16).padStart(2, '0')).join('')
    return hex === signature
  } catch { return false }
}

function calcPremiumUntil(plano: string): string {
  const now = new Date()
  if (plano === 'semanal') now.setDate(now.getDate() + 7)
  else if (plano === 'mensal') now.setMonth(now.getMonth() + 1)
  else if (plano === 'anual') now.setFullYear(now.getFullYear() + 1)
  return now.toISOString()
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature') ?? ''

  const valid = await verifyStripeSignature(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const event = JSON.parse(body)

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId  = session.metadata?.user_id
    const plano   = session.metadata?.plano
    if (!userId || !plano) return NextResponse.json({ ok: true })

    const premiumUntil = calcPremiumUntil(plano)
    await supabaseAdmin.schema('logicamente').from('profiles')
      .upsert({ id: userId, is_premium: true, plano, premium_until: premiumUntil, stripe_customer_id: session.customer })

    if (session.subscription) {
      await supabaseAdmin.schema('logicamente').from('subscriptions')
        .upsert({ id: session.subscription, user_id: userId, plano, status: 'active', current_period_end: premiumUntil })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub    = event.data.object
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabaseAdmin.schema('logicamente').from('profiles')
        .update({ is_premium: false, plano: null, premium_until: null }).eq('id', userId)
      await supabaseAdmin.schema('logicamente').from('subscriptions')
        .update({ status: 'cancelled' }).eq('id', sub.id)
    }
  }

  return NextResponse.json({ ok: true })
}
