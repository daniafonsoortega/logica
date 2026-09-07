import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-06-30.basil' })

// Service role para escrever diretamente no DB sem RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[webhook] assinatura inválida:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.CheckoutSession
    const userId  = session.metadata?.user_id
    const plano   = session.metadata?.plano
    if (!userId || !plano) return NextResponse.json({ ok: true })

    // Calcula premium_until com base no plano
    const premiumUntil = calcPremiumUntil(plano)

    await supabaseAdmin.schema('logicamente').from('profiles')
      .upsert({ id: userId, is_premium: true, plano, premium_until: premiumUntil, stripe_customer_id: session.customer as string })

    const subId = session.subscription as string
    if (subId) {
      await supabaseAdmin.schema('logicamente').from('subscriptions')
        .upsert({ id: subId, user_id: userId, plano, status: 'active', current_period_end: premiumUntil })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub    = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabaseAdmin.schema('logicamente').from('profiles')
        .update({ is_premium: false, plano: null, premium_until: null })
        .eq('id', userId)
      await supabaseAdmin.schema('logicamente').from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', sub.id)
    }
  }

  return NextResponse.json({ ok: true })
}

function calcPremiumUntil(plano: string): string {
  const now = new Date()
  switch (plano) {
    case 'semanal': now.setDate(now.getDate() + 7);   break
    case 'mensal':  now.setMonth(now.getMonth() + 1);  break
    case 'anual':   now.setFullYear(now.getFullYear() + 1); break
  }
  return now.toISOString()
}
