import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyStripeSignature(body: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const parts = sigHeader.split(',')
    const ts    = parts.find(p => p.startsWith('t='))?.slice(2)
    const v1    = parts.find(p => p.startsWith('v1='))?.slice(3)
    if (!ts || !v1) return false
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}.${body}`))
    const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
    return hex === v1
  } catch { return false }
}

function premiumUntil(plano: string) {
  const d = new Date()
  if (plano === 'semanal') d.setDate(d.getDate() + 7)
  else if (plano === 'mensal') d.setMonth(d.getMonth() + 1)
  else if (plano === 'anual') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}

const PRECOS: Record<string, number> = { semanal: 490, mensal: 1290, anual: 8900 }

export async function POST(req: NextRequest) {
  const body  = await req.text()
  const sig   = req.headers.get('stripe-signature') ?? ''
  const valid = await verifyStripeSignature(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })

  const event = JSON.parse(body)

  if (event.type === 'checkout.session.completed') {
    const s = event.data.object
    const { user_id: uid, plano, coupon_code } = s.metadata ?? {}
    if (!uid || !plano) return NextResponse.json({ ok: true })

    const until = premiumUntil(plano)
    await supabaseAdmin.from('profiles')
      .upsert({ id: uid, is_premium: true, plano, premium_until: until, stripe_customer_id: s.customer })
    if (s.subscription)
      await supabaseAdmin.from('subscriptions')
        .upsert({ id: s.subscription, user_id: uid, plano, status: 'active', current_period_end: until })

    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('discount_percent, uses_count').eq('code', coupon_code).single()
      if (coupon) {
        const original    = PRECOS[plano] ?? 1290
        const discountBrl = coupon.discount_percent ? Math.round(original * coupon.discount_percent / 100) : 0
        await supabaseAdmin.from('coupon_uses').insert({
          coupon_code, user_id: uid, plano,
          stripe_session_id: s.id,
          amount_paid_brl: s.amount_total ?? (original - discountBrl),
          discount_brl: discountBrl,
        })
        await supabaseAdmin.from('coupons')
          .update({ uses_count: (coupon.uses_count ?? 0) + 1 }).eq('code', coupon_code)
      }
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const s   = event.data.object
    const uid = s.metadata?.user_id
    if (uid) {
      await supabaseAdmin.from('profiles')
        .update({ is_premium: false, plano: null, premium_until: null }).eq('id', uid)
      await supabaseAdmin.from('subscriptions')
        .update({ status: 'cancelled' }).eq('id', s.id)
    }
  }

  return NextResponse.json({ ok: true })
}
