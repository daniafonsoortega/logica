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

// Normalize DB row to UI-friendly shape regardless of which migration version
function normalizeCoupon(row: Record<string, unknown>) {
  return {
    ...row,
    discount_percent: row.discount_percent ?? row.discount_pct ?? 0,
    uses_count:       row.uses_count       ?? row.uses        ?? 0,
    active:           row.active           ?? true,
    applies_to_plano: row.applies_to_plano ?? null,
    affiliate_name:   row.affiliate_name   ?? null,
    affiliate_email:  row.affiliate_email  ?? null,
    commission_percent: row.commission_percent ?? 0,
    notes:            row.notes            ?? null,
  }
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [c, u] = await Promise.all([
    supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false }),
    supabaseAdmin.from('coupon_uses').select('*').order('created_at', { ascending: false }).limit(200),
  ])
  return NextResponse.json({
    coupons: (c.data ?? []).map(normalizeCoupon),
    uses: u.data ?? [],
  })
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  // Map UI field names to actual DB column names (supports both pre- and post-migration)
  const dbRow: Record<string, unknown> = {
    code:         body.code?.toUpperCase().trim(),
    type:         body.type,
    max_uses:     body.max_uses ? Number(body.max_uses) : null,
    expires_at:   body.expires_at || null,
    description:  body.notes || body.description || null,
  }

  // Use whichever discount column the DB has
  if (body.discount_percent !== undefined) {
    dbRow.discount_percent = Number(body.discount_percent)  // post-migration
    dbRow.discount_pct     = Number(body.discount_percent)  // pre-migration fallback
  }

  // Extended columns — only add if they exist (migration may not have run)
  if (body.applies_to_plano)  dbRow.applies_to_plano   = body.applies_to_plano
  if (body.affiliate_name)    dbRow.affiliate_name      = body.affiliate_name
  if (body.affiliate_email)   dbRow.affiliate_email     = body.affiliate_email
  if (body.commission_percent !== undefined) dbRow.commission_percent = Number(body.commission_percent)
  if (body.active !== undefined) dbRow.active = body.active

  // Try inserting; if new columns cause error, retry without them
  let { error } = await supabaseAdmin.from('coupons').insert(dbRow)
  if (error?.message?.includes('column')) {
    // Fallback: base columns only
    const safeRow = {
      code: dbRow.code, type: dbRow.type,
      discount_pct: dbRow.discount_pct ?? 0,
      max_uses: dbRow.max_uses, expires_at: dbRow.expires_at,
      description: dbRow.description,
    }
    ;({ error } = await supabaseAdmin.from('coupons').insert(safeRow))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { code, active } = await req.json()
  // Try with `active` column; if it doesn't exist, ignore
  const { error } = await supabaseAdmin.from('coupons').update({ active }).eq('code', code)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
