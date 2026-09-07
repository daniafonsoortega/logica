import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' })

// Price IDs criados no Stripe Dashboard
const PRICE_IDS: Record<string, string> = {
  semanal: process.env.STRIPE_PRICE_SEMANAL!,
  mensal:  process.env.STRIPE_PRICE_MENSAL!,
  anual:   process.env.STRIPE_PRICE_ANUAL!,
}

export async function POST(req: NextRequest) {
  try {
    const { plano } = await req.json() as { plano: string }
    const priceId = PRICE_IDS[plano]
    if (!priceId) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

    // Pega o usuário autenticado (opcional — checkout pode ser anônimo)
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium?success=1`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/?cancelled=1`,
      ...(user?.email && { customer_email: user.email }),
      metadata: { user_id: user?.id ?? '', plano },
      subscription_data: { metadata: { user_id: user?.id ?? '', plano } },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Erro ao criar checkout' }, { status: 500 })
  }
}
