import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function premiumUntil(plano: string) {
  const d = new Date()
  if (plano === 'semanal') d.setDate(d.getDate() + 7)
  else if (plano === 'mensal') d.setMonth(d.getMonth() + 1)
  else if (plano === 'anual') d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}

export async function POST(req: NextRequest) {
  const { code, plano = 'mensal' } = await req.json() as { code: string; plano: string }
  const upperCode = code.toUpperCase().trim()

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login necessário' }, { status: 401 })

  const { data: coupon } = await supabaseAdmin
    .from('coupons').select('*').eq('code', upperCode).single()

  // Support both active column conventions
  const isActive = coupon?.active !== undefined ? coupon.active : true
  if (!coupon || !isActive || coupon.type !== 'free_access')
    return NextResponse.json({ error: 'Cupom inválido para acesso gratuito' }, { status: 400 })

  const usesCount = coupon.uses_count ?? coupon.uses ?? 0
  if (coupon.max_uses !== null && usesCount >= coupon.max_uses)
    return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 })

  const until = premiumUntil(plano)

  // Update profile — try with premium columns; fall back gracefully if columns missing
  const profileUpdate: Record<string, unknown> = { id: user.id, email: user.email }
  try {
    await supabaseAdmin.from('profiles')
      .upsert({ ...profileUpdate, is_premium: true, plano, premium_until: until })
  } catch {
    // Columns not yet migrated — update base profile only
    await supabaseAdmin.from('profiles').upsert(profileUpdate)
  }

  // Record usage
  await supabaseAdmin.from('coupon_uses').insert({
    coupon_code: upperCode, user_id: user.id, user_email: user.email,
    plano, amount_paid_brl: 0,
    discount_brl: ({ semanal: 490, mensal: 1290, anual: 8900 } as Record<string,number>)[plano] ?? 1290,
  })

  // Increment uses — support both column name conventions
  const usesField = coupon.uses_count !== undefined ? 'uses_count' : 'uses'
  await supabaseAdmin.from('coupons')
    .update({ [usesField]: usesCount + 1 }).eq('code', upperCode)

  return NextResponse.json({ ok: true, premium_until: until })
}
