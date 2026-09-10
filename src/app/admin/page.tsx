'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import {
  Users, TrendingUp, Tag, BarChart2, ToggleLeft, ToggleRight,
  RefreshCw, LogOut, CreditCard, Percent, UserCheck
} from 'lucide-react'

const ADMIN_EMAILS = ['app.usemia@gmail.com', 'mensagemparadani@gmail.com']

interface Metrics {
  totalUsers: number; premiumUsers: number; conversionPct: number
  totalRevenue: number; totalDiscount: number
  planBreakdown: Record<string, number>
  signupsPerDay: Record<string, number>
  couponStats: CouponStat[]; recentUsers: RecentUser[]
  activeSubs: number; cancelledSubs: number
  totalCoupons: number; totalCouponUses: number
}
interface CouponStat {
  code: string; type: string; uses: number; active: boolean
  discount_percent: number | null; affiliate_name: string | null
  commission_percent: number; revenue: number; discount: number
}
interface RecentUser { email: string | null; is_premium: boolean; plano: string | null; created_at: string }
interface Coupon {
  code: string; type: string; discount_percent: number | null
  applies_to_plano: string | null; max_uses: number | null; uses_count: number
  expires_at: string | null; affiliate_email: string | null; affiliate_name: string | null
  commission_percent: number; active: boolean; notes: string | null; created_at: string
}
interface CouponUse {
  id: string; coupon_code: string; user_email: string | null; plano: string | null
  amount_paid_brl: number | null; discount_brl: number | null; created_at: string
}

const PLAN_COLORS: Record<string, string> = {
  semanal: 'bg-blue-100 text-blue-700',
  mensal: 'bg-purple-100 text-purple-700',
  anual: 'bg-green-100 text-green-700',
}

export default function AdminPage() {
  const [auth, setAuth]         = useState<boolean | null>(null)
  const [metrics, setMetrics]   = useState<Metrics | null>(null)
  const [coupons, setCoupons]   = useState<Coupon[]>([])
  const [uses, setUses]         = useState<CouponUse[]>([])
  const [tab, setTab]           = useState<'dashboard' | 'cupons' | 'usuarios'>('dashboard')
  const [couponTab, setCouponTab] = useState<'list' | 'new'>('list')
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')
  const [form, setForm] = useState({
    code: '', type: 'percent', discount_percent: '20',
    applies_to_plano: '', max_uses: '', expires_at: '',
    affiliate_email: '', affiliate_name: '', commission_percent: '0', notes: '',
  })

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const ok = ADMIN_EMAILS.includes(data.user?.email ?? '')
      setAuth(ok)
      if (ok) loadAll()
    })
  }, [])

  async function loadAll() {
    setLoading(true)
    const [m, c] = await Promise.all([
      fetch('/api/admin/metrics').then(r => r.json()),
      fetch('/api/admin/coupons').then(r => r.json()),
    ])
    setMetrics(m)
    setCoupons(c.coupons ?? [])
    setUses(c.uses ?? [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMsg('')
    const res = await fetch('/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: form.code.toUpperCase().trim(), type: form.type,
        discount_percent: form.type === 'percent' ? parseInt(form.discount_percent) : null,
        applies_to_plano: form.applies_to_plano || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        affiliate_email: form.affiliate_email || null,
        affiliate_name: form.affiliate_name || null,
        commission_percent: parseInt(form.commission_percent) || 0,
        notes: form.notes || null, active: true,
      }),
    })
    const data = await res.json()
    if (data.ok) {
      setMsg('✅ Cupom criado!'); loadAll()
      setForm({ code:'', type:'percent', discount_percent:'20', applies_to_plano:'', max_uses:'', expires_at:'', affiliate_email:'', affiliate_name:'', commission_percent:'0', notes:'' })
      setCouponTab('list')
    } else { setMsg('Erro: ' + (data.error ?? 'desconhecido')) }
    setSaving(false)
  }

  async function toggleCoupon(code: string, current: boolean) {
    await fetch('/api/admin/coupons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, active: !current }) })
    loadAll()
  }

  async function signOut() { await supabase.auth.signOut(); window.location.href = '/' }

  const fmtBrl = (c: number) => `R$${(c / 100).toFixed(2).replace('.', ',')}`
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' })

  if (auth === null) return <div className="min-h-screen flex items-center justify-center text-gray-400">Verificando acesso...</div>
  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-4xl">🔒</div>
        <h1 className="text-xl font-bold text-gray-900">Acesso restrito</h1>
        <p className="text-gray-500 text-sm">Esta área é exclusiva para administradores.</p>
        <a href="/" className="inline-block text-blue-600 hover:underline text-sm">← Voltar ao app</a>
      </div>
    </div>
  )

  const m = metrics

  // Mini bar chart for signups
  function MiniBar({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data)
    const max = Math.max(...entries.map(([, v]) => v), 1)
    return (
      <div className="flex items-end gap-0.5 h-16">
        {entries.map(([day, count]) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div
              className="w-full bg-blue-500 rounded-sm opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ height: `${Math.max((count / max) * 48, count > 0 ? 4 : 1)}px` }}
            />
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
              {day.slice(5)} · {count}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg text-blue-700">🧠 Admin</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-gray-500">MalhaMente</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadAll} className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors" title="Atualizar">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={signOut} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
              <LogOut size={15} /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'cupons',    label: '🎟️ Cupons' },
            { id: 'usuarios',  label: '👥 Usuários' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ─────────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Usuários totais', value: m?.totalUsers ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Premium ativos', value: m?.premiumUsers ?? '—', icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Conversão', value: m ? `${m.conversionPct}%` : '—', icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Receita total', value: m ? fmtBrl(m.totalRevenue) : '—', icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-3">
                  <div className={`${card.bg} p-2.5 rounded-xl`}>
                    <card.icon size={20} className={card.color} />
                  </div>
                  <div>
                    <div className={`text-2xl font-black ${card.color}`}>{card.value}</div>
                    <div className="text-xs text-gray-400">{card.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cadastros por dia */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BarChart2 size={16} className="text-blue-500" /> Cadastros (14 dias)
                </h3>
                {m ? <MiniBar data={m.signupsPerDay} /> : <div className="h-16 bg-gray-50 rounded animate-pulse" />}
                {m && (
                  <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                    <span>{Object.keys(m.signupsPerDay)[0]?.slice(5)}</span>
                    <span>hoje</span>
                  </div>
                )}
              </div>

              {/* Breakdown de planos */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-purple-500" /> Planos ativos
                </h3>
                {m ? (
                  <div className="space-y-3">
                    {Object.entries(m.planBreakdown).map(([plano, count]) => {
                      const total = m.premiumUsers || 1
                      const pct   = Math.round((count / total) * 100)
                      return (
                        <div key={plano}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={`font-semibold px-2 py-0.5 rounded-full ${PLAN_COLORS[plano] ?? 'bg-gray-100'}`}>{plano}</span>
                            <span className="text-gray-500">{count} usuário{count !== 1 ? 's' : ''} · {pct}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                    {m.premiumUsers === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum usuário premium ainda</p>}
                  </div>
                ) : <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />)}</div>}
              </div>
            </div>

            {/* Stats secundários */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Subs activas',      value: m?.activeSubs ?? '—',     color: 'text-green-600' },
                { label: 'Subs canceladas',   value: m?.cancelledSubs ?? '—',  color: 'text-red-500' },
                { label: 'Cupons criados',    value: m?.totalCoupons ?? '—',   color: 'text-blue-600' },
                { label: 'Usos de cupom',     value: m?.totalCouponUses ?? '—',color: 'text-purple-600' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Top cupons */}
            {m && m.couponStats.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-blue-500" /> Performance dos cupons
                </h3>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 border-b border-gray-100">
                    {['Código','Tipo','Usos','Receita gerada','Desconto dado','Afiliado'].map(h => <th key={h} className="pb-2 text-left font-medium">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {m.couponStats.slice(0,8).map(c => (
                      <tr key={c.code} className={!c.active ? 'opacity-40' : ''}>
                        <td className="py-2 font-mono font-bold text-blue-700">{c.code}</td>
                        <td className="py-2">{c.type === 'free_access' ? '🆓' : `${c.discount_percent}%`}</td>
                        <td className="py-2 font-semibold">{c.uses}</td>
                        <td className="py-2 text-green-600 font-medium">{fmtBrl(c.revenue)}</td>
                        <td className="py-2 text-orange-500">-{fmtBrl(c.discount)}</td>
                        <td className="py-2 text-gray-400 text-xs">{c.affiliate_name ?? '—'}{c.commission_percent > 0 ? ` (${c.commission_percent}%)` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CUPONS ────────────────────────────────────────────────────── */}
        {tab === 'cupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Gestão de Cupons</h2>
              <div className="flex gap-2">
                {(['list','new'] as const).map(t => (
                  <button key={t} onClick={() => setCouponTab(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${couponTab===t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
                    {t === 'list' ? `Cupons (${coupons.length})` : '+ Criar cupom'}
                  </button>
                ))}
              </div>
            </div>

            {msg && <div className={`p-3 rounded-lg text-sm font-medium ${msg.startsWith('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

            {couponTab === 'list' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                    <tr>{['Código','Tipo','Desc.','Plano','Usos','Afiliado','Comissão','Status',''].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map(c => (
                      <tr key={c.code} className={!c.active ? 'opacity-40' : ''}>
                        <td className="px-4 py-3 font-mono font-bold text-blue-700">{c.code}</td>
                        <td className="px-4 py-3">{c.type === 'free_access' ? '🆓 Grátis' : '% Desc.'}</td>
                        <td className="px-4 py-3">{c.type === 'percent' ? `${c.discount_percent}%` : '100%'}</td>
                        <td className="px-4 py-3 text-gray-500">{c.applies_to_plano ?? 'todos'}</td>
                        <td className="px-4 py-3 font-medium">{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{c.affiliate_name ?? '—'}</td>
                        <td className="px-4 py-3">{c.commission_percent > 0 ? `${c.commission_percent}%` : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {c.active ? 'ativo' : 'inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleCoupon(c.code, c.active)} className="text-gray-400 hover:text-gray-700">
                            {c.active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Nenhum cupom ainda. Cria o primeiro!</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {couponTab === 'new' && (
              <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Código *</label>
                    <input value={form.code} required onChange={e => setForm(p => ({...p, code: e.target.value.toUpperCase()}))}
                      placeholder="BLOGUEIRA20"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Tipo *</label>
                    <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="percent">Desconto %</option>
                      <option value="free_access">Acesso 100% grátis</option>
                    </select>
                  </div>
                  {form.type === 'percent' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Desconto %</label>
                      <input type="number" min="1" max="99" value={form.discount_percent}
                        onChange={e => setForm(p => ({...p, discount_percent: e.target.value}))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Plano (vazio = todos)</label>
                    <select value={form.applies_to_plano} onChange={e => setForm(p => ({...p, applies_to_plano: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Todos os planos</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Máx. usos (vazio = ∞)</label>
                    <input type="number" min="1" value={form.max_uses} placeholder="ex: 50"
                      onChange={e => setForm(p => ({...p, max_uses: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Expira em (vazio = nunca)</label>
                    <input type="date" value={form.expires_at} onChange={e => setForm(p => ({...p, expires_at: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nome do afiliado</label>
                    <input value={form.affiliate_name} placeholder="João Influencer"
                      onChange={e => setForm(p => ({...p, affiliate_name: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Email do afiliado</label>
                    <input type="email" value={form.affiliate_email} placeholder="joao@email.com"
                      onChange={e => setForm(p => ({...p, affiliate_email: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Comissão % do afiliado</label>
                    <input type="number" min="0" max="100" value={form.commission_percent}
                      onChange={e => setForm(p => ({...p, commission_percent: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Notas internas</label>
                    <input value={form.notes} placeholder="Ex: parceria podcast X · ref 2026-09"
                      onChange={e => setForm(p => ({...p, notes: e.target.value}))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button type="submit" disabled={saving}
                  className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
                  {saving ? 'Criando...' : 'Criar cupom'}
                </button>
              </form>
            )}

            {/* Usos recentes */}
            {couponTab === 'list' && uses.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
                <div className="px-4 py-3 border-b border-gray-100 font-semibold text-sm text-gray-700">Usos recentes</div>
                <table className="w-full text-sm">
                  <thead><tr className="text-xs text-gray-400 bg-gray-50">
                    {['Código','Usuário','Plano','Pagou','Desconto','Data'].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {uses.slice(0, 20).map(u => (
                      <tr key={u.id}>
                        <td className="px-4 py-2 font-mono font-bold text-blue-700">{u.coupon_code}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs truncate max-w-[160px]">{u.user_email ?? '—'}</td>
                        <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[u.plano ?? ''] ?? 'bg-gray-100 text-gray-500'}`}>{u.plano ?? '—'}</span></td>
                        <td className="px-4 py-2 font-medium">{fmtBrl(u.amount_paid_brl ?? 0)}</td>
                        <td className="px-4 py-2 text-green-600 font-medium">-{fmtBrl(u.discount_brl ?? 0)}</td>
                        <td className="px-4 py-2 text-gray-400 text-xs">{fmtDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USUÁRIOS ──────────────────────────────────────────────────── */}
        {tab === 'usuarios' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Usuários recentes</h2>
              <span className="text-sm text-gray-400">{m?.totalUsers ?? '—'} total</span>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                  <tr>{['Email','Status','Plano','Cadastro'].map(h => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(m?.recentUsers ?? []).map((u, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-gray-700">{u.email ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_premium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {u.is_premium ? '⭐ Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.plano
                          ? <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAN_COLORS[u.plano] ?? 'bg-gray-100'}`}>{u.plano}</span>
                          : <span className="text-gray-400 text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                  {!m && [1,2,3,4,5].map(i => (
                    <tr key={i}><td colSpan={4} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
