import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ADMIN_EMAILS = ['app.usemia@gmail.com', 'mensagemparadani@gmail.com']
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email ?? ''))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profiles, subs, couponUses, coupons] = await Promise.all([
    supabaseAdmin.from('profiles').select('id, email, is_premium, plano, created_at'),
    supabaseAdmin.from('subscriptions').select('id, plano, status, created_at'),
    supabaseAdmin.from('coupon_uses').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false }),
  ])

  const allProfiles = profiles.data ?? []
  const allSubs     = subs.data ?? []
  const allUses     = couponUses.data ?? []
  const allCoupons  = coupons.data ?? []

  const totalUsers    = allProfiles.length
  const premiumUsers  = allProfiles.filter(p => p.is_premium).length
  const conversionPct = totalUsers > 0 ? Math.round((premiumUsers / totalUsers) * 100) : 0

  // Revenue from coupon_uses
  const totalRevenue  = allUses.reduce((s, u) => s + (u.amount_paid_brl ?? 0), 0)
  const totalDiscount = allUses.reduce((s, u) => s + (u.discount_brl ?? 0), 0)

  // Plan breakdown
  const planBreakdown = { semanal: 0, mensal: 0, anual: 0 }
  allProfiles.filter(p => p.is_premium && p.plano).forEach(p => {
    const k = p.plano as keyof typeof planBreakdown
    if (k in planBreakdown) planBreakdown[k]++
  })

  // Signups per day (last 14 days)
  const signupsPerDay: Record<string, number> = {}
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i)
    signupsPerDay[d.toISOString().split('T')[0]] = 0
  }
  allProfiles.forEach(p => {
    const day = p.created_at?.split('T')[0]
    if (day && day in signupsPerDay) signupsPerDay[day]++
  })

  // Top coupons by uses
  const couponStats = allCoupons.map(c => ({
    code: c.code, type: c.type, uses: c.uses_count, active: c.active,
    discount_percent: c.discount_percent, affiliate_name: c.affiliate_name,
    commission_percent: c.commission_percent,
    revenue: allUses.filter(u => u.coupon_code === c.code).reduce((s, u) => s + (u.amount_paid_brl ?? 0), 0),
    discount: allUses.filter(u => u.coupon_code === c.code).reduce((s, u) => s + (u.discount_brl ?? 0), 0),
  })).sort((a, b) => b.uses - a.uses)

  // Recent users (last 10)
  const recentUsers = [...allProfiles]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
    .map(p => ({ email: p.email, is_premium: p.is_premium, plano: p.plano, created_at: p.created_at }))

  // Active subs by status
  const activeSubs   = allSubs.filter(s => s.status === 'active').length
  const cancelledSubs = allSubs.filter(s => s.status === 'cancelled').length

  return NextResponse.json({
    totalUsers, premiumUsers, conversionPct,
    totalRevenue, totalDiscount,
    planBreakdown, signupsPerDay,
    couponStats, recentUsers,
    activeSubs, cancelledSubs,
    totalCoupons: allCoupons.length,
    totalCouponUses: allUses.length,
  })
}
