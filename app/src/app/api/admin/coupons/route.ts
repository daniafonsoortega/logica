import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const ADMIN_EMAILS = ['app.usemia@gmail.com', 'mensagemparadani@gmail.com']
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && ADMIN_EMAILS.includes(user.email ?? '')
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [c, u] = await Promise.all([
    supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('coupon_uses').select('*').order('created_at', { ascending: false }).limit(200),
  ])
  return NextResponse.json({ coupons: c.data ?? [], uses: u.data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { error } = await supabaseAdmin.from('coupons').insert(body)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { code, active } = await req.json()
  await supabaseAdmin.from('coupons').update({ active }).eq('code', code)
  return NextResponse.json({ ok: true })
}
