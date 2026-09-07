'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Zap, Infinity as InfinityIcon, BarChart2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

const PLANOS = [
  { id: 'semanal', label: 'Semanal', preco: 'R$4,90',  periodo: '/semana', destaque: false, desc: 'Teste por uma semana' },
  { id: 'mensal',  label: 'Mensal',  preco: 'R$12,90', periodo: '/mês',    destaque: false, desc: 'Mais popular' },
  { id: 'anual',   label: 'Anual',   preco: 'R$89',    periodo: '/ano',    destaque: true,  desc: 'Economize 43%' },
]

const FEATURES = [
  { icon: InfinityIcon, text: 'Desafios ilimitados por dia' },
  { icon: Zap,          text: 'Sem anúncios' },
  { icon: BarChart2,    text: 'Histórico e estatísticas detalhadas' },
  { icon: Users,        text: 'Competir com amigos' },
]

function PremiumContent() {
  const params  = useSearchParams()
  const success = params.get('success')
  const [loading, setLoading] = useState<string | null>(null)
  const [coupon, setCoupon]   = useState('')
  const [couponMsg, setCouponMsg] = useState('')

  useEffect(() => {
    if (success && typeof window !== 'undefined') localStorage.setItem('lm_premium', 'true')
  }, [success])

  if (success) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-black text-gray-900">Bem-vindo ao Premium!</h1>
        <p className="text-gray-500 max-w-sm mx-auto">Seu acesso ilimitado está ativo. Treine quantas vezes quiser.</p>
        <Link href="/" className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">Começar agora →</Link>
      </div>
    )
  }

  async function handleCheckout(planoId: string) {
    setLoading(planoId)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${location.origin}/auth/callback?next=/premium` },
        })
        return
      }
      const res  = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano: planoId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Erro ao iniciar checkout. Tente novamente.')
    } catch { alert('Erro de conexão. Tente novamente.') }
    finally   { setLoading(null) }
  }

  async function handleCoupon() {
    if (!coupon.trim()) return
    const res  = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon.trim() }),
    })
    const data = await res.json()
    if (data.valid) {
      setCouponMsg('✅ Cupom válido! ' + (data.description ?? ''))
    } else {
      setCouponMsg('❌ Cupom inválido ou expirado.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-5xl">⚡</div>
        <h1 className="text-4xl font-black text-gray-900">LogicaMente Premium</h1>
        <p className="text-gray-500 text-lg">Treine sem limites. Evolua mais rápido.</p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 px-4 py-3 shadow-sm">
            <Icon size={18} className="text-blue-600 shrink-0" />
            <span className="text-sm text-gray-700">{text}</span>
          </div>
        ))}
      </div>

      {/* Plans */}
      <div className="space-y-3">
        {PLANOS.map(plano => (
          <button
            key={plano.id}
            onClick={() => handleCheckout(plano.id)}
            disabled={loading === plano.id}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left
              ${plano.destaque
                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.01]'
                : 'border-gray-200 bg-white text-gray-900 hover:border-blue-400'
              }`}
          >
            <div>
              <div className="font-bold text-base">{plano.label}</div>
              <div className={`text-xs mt-0.5 ${plano.destaque ? 'text-blue-100' : 'text-gray-400'}`}>{plano.desc}</div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black">{plano.preco}</span>
              <span className={`text-xs ml-1 ${plano.destaque ? 'text-blue-100' : 'text-gray-400'}`}>{plano.periodo}</span>
            </div>
            {loading === plano.id && <span className="ml-3 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          </button>
        ))}
      </div>

      {/* Coupon */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-gray-700">Tem um cupom de desconto?</p>
        <div className="flex gap-2">
          <input
            value={coupon}
            onChange={e => setCoupon(e.target.value)}
            placeholder="Digite o código"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCoupon}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Aplicar
          </button>
        </div>
        {couponMsg && <p className="text-xs text-gray-600">{couponMsg}</p>}
      </div>

      <p className="text-center text-xs text-gray-400">
        Cobrança via Stripe · Cancele quando quiser · Sem multa
      </p>
    </div>
  )
}

export default function PremiumPage() {
  return <Suspense><PremiumContent /></Suspense>
}
