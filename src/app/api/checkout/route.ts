import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const STRIPE_BASE = 'https://api.stripe.com/v1'
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRICE_IDS: Record<string, string> = {
  semanal: process.env.STRIPE_PRICE_SEMANAL!,
  mensal:  process.env.STRIPE_PRICE_MENSAL!,
  anual:   process.env.STRIPE_PRICE_ANUAL!,
}

async function stripePost(path: string, params: [string, string][]) {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const { plano, coupon_code } = await req.json() as { plano: string; coupon_code?: string }
    const priceId = PRICE_IDS[plano]
    if (!priceId) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://malha-mente.vercel.app'

    // Se cupom %, criar Stripe coupon
    let stripeCouponId: string | null = null
    if (coupon_code) {
      const { data: coupon } = await supabaseAdmin
        .schema('logicamente').from('coupons')
        .select('type, discount_percent, active').eq('code', coupon_code.toUpperCase()).single()
      if (coupon?.active && coupon.type === 'percent' && coupon.discount_percent) {
        const sc = await stripePost('/coupons', [
          ['percent_off', String(coupon.discount_percent)],
          ['duration', 'once'],
          ['name', `MalhaMente ${coupon_code.toUpperCase()}`],
        ])
        if (sc.id) stripeCouponId = sc.id
      }
    }

    const params: [string, string][] = [
      ['mode', 'subscription'],
      ['line_items[0][price]', priceId],
      ['line_items[0][quantity]', '1'],
      ['success_url', `${appUrl}/premium?success=1`],
      ['cancel_url',  `${appUrl}/?cancelled=1`],
      ['metadata[plano]', plano],
      ['metadata[user_id]', user?.id ?? ''],
      ['metadata[coupon_code]', coupon_code?.toUpperCase() ?? ''],
      ['subscription_data[metadata][plano]', plano],
      ['subscription_data[metadata][user_id]', user?.id ?? ''],
    ]
    if (user?.email) params.push(['customer_email', user.email])
    if (stripeCouponId) params.push(['discounts[0][coupon]', stripeCouponId])

    const session = await stripePost('/checkout/sessions', params)
    if (!session.url) return NextResponse.json({ error: 'Stripe error', detail: session }, { status: 500 })
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Erro ao criar checkout' }, { status: 500 })
  }
}
