import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRECOS: Record<string, number> = { semanal: 490, mensal: 1290, anual: 8900 }

export async function GET(req: NextRequest) {
  const code  = req.nextUrl.searchParams.get('code')?.toUpperCase().trim()
  const plano = req.nextUrl.searchParams.get('plano') ?? 'mensal'
  if (!code) return NextResponse.json({ valid: false, error: 'Código em falta' })

  const { data: coupon, error } = await supabaseAdmin
    .from('coupons').select('*').eq('code', code).single()

  if (error || !coupon) return NextResponse.json({ valid: false, error: 'Cupom inválido' })

  // Support both column name conventions (migration may or may not have run)
  const isActive     = coupon.active !== undefined ? coupon.active : true // default active if column missing
  const discountPct  = coupon.discount_percent ?? coupon.discount_pct ?? 0
  const usesCount    = coupon.uses_count ?? coupon.uses ?? 0
  const appliesToPlano = coupon.applies_to_plano ?? null
  const affiliateName  = coupon.affiliate_name ?? null

  if (!isActive)
    return NextResponse.json({ valid: false, error: 'Cupom inativo' })
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return NextResponse.json({ valid: false, error: 'Cupom expirado' })
  if (coupon.max_uses !== null && usesCount >= coupon.max_uses)
    return NextResponse.json({ valid: false, error: 'Cupom esgotado' })
  if (appliesToPlano && appliesToPlano !== plano)
    return NextResponse.json({ valid: false, error: `Cupom válido só para o plano ${appliesToPlano}` })

  const original    = PRECOS[plano] ?? 1290
  const pct         = discountPct
  const discountBrl = Math.round(original * pct / 100)
  const finalBrl    = Math.max(0, original - discountBrl)

  return NextResponse.json({
    valid:            true,
    type:             coupon.type,
    discount_percent: pct,
    discount_brl:     discountBrl,
    final_brl:        finalBrl,
    affiliate_name:   affiliateName,
    message:          coupon.type === 'free_access'
      ? 'Acesso gratuito! 🎉'
      : `${pct}% de desconto — R$${(original/100).toFixed(2).replace('.',',')} → R$${(finalBrl/100).toFixed(2).replace('.',',')}`,
  })
}
