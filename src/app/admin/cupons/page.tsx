'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Tag, Users, TrendingUp, ToggleLeft, ToggleRight } from 'lucide-react'

const ADMIN_EMAILS = ['app.usemia@gmail.com', 'daniafonsoortega@amazon.com']

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

export default function AdminCuponsPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [coupons, setCoupons]       = useState<Coupon[]>([])
  const [uses, setUses]             = useState<CouponUse[]>([])
  const [tab, setTab]               = useState<'list' | 'new' | 'uses'>('list')
  const [saving, setSaving]         = useState(false)
  const [msg, setMsg]               = useState('')
  const [form, setForm] = useState({
    code: '', type: 'percent', discount_percent: '20',
    applies_to_plano: '', max_uses: '', expires_at: '',
    affiliate_email: '', affiliate_name: '', commission_percent: '0', notes: '',
  })

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? ''
      setAuthorized(ADMIN_EMAILS.includes(email))
      if (ADMIN_EMAILS.includes(email)) loadData()
    })
  }, [])

  async function loadData() {
    const res = await fetch('/api/admin/coupons')
    const data = await res.json()
    setCoupons(data.coupons ?? [])
    setUses(data.uses ?? [])
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
      setMsg('✅ Cupom criado!'); loadData()
      setForm({ code:'', type:'percent', discount_percent:'20', applies_to_plano:'', max_uses:'', expires_at:'', affiliate_email:'', affiliate_name:'', commission_percent:'0', notes:'' })
      setTab('list')
    } else { setMsg('Erro: ' + (data.error ?? 'desconhecido')) }
    setSaving(false)
  }

  async function toggleActive(code: string, current: boolean) {
    await fetch('/api/admin/coupons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, active: !current }) })
    loadData()
  }

  if (authorized === null) return <div className="p-8 text-gray-400">Verificando acesso...</div>
  if (!authorized)         return <div className="p-8 text-red-500 font-semibold">Acesso negado.</div>

  const totalRevenue  = uses.reduce((s, u) => s + (u.amount_paid_brl ?? 0), 0)
  const totalDiscount = uses.reduce((s, u) => s + (u.discount_brl ?? 0), 0)
  const fmtBrl = (c: number) => `R$${(c/100).toFixed(2).replace('.',',')}`

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2"><Tag className="text-blue-600" /> Cupons & Afiliados</h1>
        <div className="flex gap-2 text-sm">
          {(['list','new','uses'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${tab===t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t === 'list' ? `Cupons (${coupons.length})` : t === 'new' ? '+ Criar' : `Usos (${uses.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cupons ativos', value: coupons.filter(c=>c.active).length, icon: Tag, color: 'text-blue-600' },
          { label: 'Receita c/ desconto', value: fmtBrl(totalRevenue), icon: TrendingUp, color: 'text-green-600' },
          { label: 'Desconto concedido', value: fmtBrl(totalDiscount), icon: Users, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm font-medium ${msg.startsWith('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{msg}</div>}

      {/* Lista */}
      {tab === 'list' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>{['Código','Tipo','Desc.','Plano','Usos','Afiliado','Comissão','',''].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map(c => (
                <tr key={c.code} className={`${!c.active ? 'opacity-40' : ''}`}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">{c.code}</td>
                  <td className="px-4 py-3">{c.type === 'free_access' ? '🆓 Grátis' : '% Desc.'}</td>
                  <td className="px-4 py-3">{c.type === 'percent' ? `${c.discount_percent}%` : '100%'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.applies_to_plano ?? 'todos'}</td>
                  <td className="px-4 py-3 font-medium">{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.affiliate_name ?? '—'}</td>
                  <td className="px-4 py-3">{c.commission_percent > 0 ? `${c.commission_percent}%` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{c.active ? 'ativo' : 'inativo'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.code, c.active)} className="text-gray-400 hover:text-gray-700">
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

      {/* Criar */}
      {tab === 'new' && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label:'Código *', key:'code', type:'text', placeholder:'BLOGUEIRA20', upper:true, required:true },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                <input value={(form as any)[f.key]} required={f.required}
                  onChange={e => setForm(p => ({...p, [f.key]: f.upper ? e.target.value.toUpperCase() : e.target.value}))}
                  placeholder={f.placeholder} type={f.type}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
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
              <input type="number" min="1" value={form.max_uses} placeholder="100"
                onChange={e => setForm(p => ({...p, max_uses: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Expira em (vazio = nunca)</label>
              <input type="date" value={form.expires_at}
                onChange={e => setForm(p => ({...p, expires_at: e.target.value}))}
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
              <label className="block text-xs font-semibold text-gray-500 mb-1">Comissão % afiliado</label>
              <input type="number" min="0" max="100" value={form.commission_percent}
                onChange={e => setForm(p => ({...p, commission_percent: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Notas internas</label>
              <input value={form.notes} placeholder="Ex: parceria podcast X — ref 2026-09"
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

      {/* Usos */}
      {tab === 'uses' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>{['Código','Usuário','Plano','Pagou','Desconto','Data'].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {uses.map(u => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-mono font-bold text-blue-700">{u.coupon_code}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[150px]">{u.user_email ?? '—'}</td>
                  <td className="px-4 py-3">{u.plano ?? '—'}</td>
                  <td className="px-4 py-3 font-medium">{fmtBrl(u.amount_paid_brl ?? 0)}</td>
                  <td className="px-4 py-3 text-green-600 font-medium">-{fmtBrl(u.discount_brl ?? 0)}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
              {uses.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhum uso ainda</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
