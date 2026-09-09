import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'

const STRIPE_BASE = 'https://api.stripe.com/v1'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function stripePost(path: string, params: [string, string][]) {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })
  return res.json()
}

async function stripeGet(path: string) {
  const res = await fetch(`${STRIPE_BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://logica-mente.vercel.app'

    // Buscar stripe_customer_id do perfil
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Fallback: procurar cliente no Stripe pelo email
    if (!customerId && user.email) {
      const search = await stripeGet(`/customers?email=${encodeURIComponent(user.email)}&limit=1`)
      if (search.data?.length > 0) {
        customerId = search.data[0].id
        // Guardar para uso futuro
        await supabaseAdmin.from('profiles')
          .update({ stripe_customer_id: customerId })
          .eq('id', user.id)
      }
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'Nenhuma assinatura Stripe encontrada para este utilizador.' },
        { status: 404 }
      )
    }

    const session = await stripePost('/billing_portal/sessions', [
      ['customer', customerId],
      ['return_url', `${appUrl}/perfil`],
    ])

    if (!session.url) {
      return NextResponse.json({ error: 'Erro ao criar portal Stripe', detail: session }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe-portal]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
