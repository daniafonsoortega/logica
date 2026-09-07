import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const STRIPE_BASE = 'https://api.stripe.com/v1'

const PRICE_IDS: Record<string, string> = {
  semanal: process.env.STRIPE_PRICE_SEMANAL!,
  mensal:  process.env.STRIPE_PRICE_MENSAL!,
  anual:   process.env.STRIPE_PRICE_ANUAL!,
}

async function stripePost(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params).toString()
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const { plano } = await req.json() as { plano: string }
    const priceId = PRICE_IDS[plano]
    if (!priceId) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://logica-mente.vercel.app'

    const params: Record<string, string> = {
      mode: 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      success_url: `${appUrl}/premium?success=1`,
      cancel_url:  `${appUrl}/?cancelled=1`,
      'metadata[plano]': plano,
      'metadata[user_id]': user?.id ?? '',
      'subscription_data[metadata][plano]': plano,
      'subscription_data[metadata][user_id]': user?.id ?? '',
    }
    if (user?.email) params.customer_email = user.email

    const session = await stripePost('/checkout/sessions', params)
    if (!session.url) return NextResponse.json({ error: 'Stripe error', detail: session }, { status: 500 })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Erro ao criar checkout' }, { status: 500 })
  }
}
