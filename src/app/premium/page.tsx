'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Zap, Infinity as InfinityIcon, BarChart2, Users, Crown, Settings } from 'lucide-react'
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

const PLANO_LABELS: Record<string, string> = {
  semanal: 'Semanal',
  mensal:  'Mensal',
  anual:   'Anual',
}

function PremiumContent() {
  const params  = useSearchParams()
  const success = params.get('success')

  const [loading,       setLoading]       = useState<string | null>(null)
  const [coupon,        setCoupon]        = useState('')
  const [couponMsg,     setCouponMsg]     = useState('')
  const [couponValid,   setCouponValid]   = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState('')
  const [isPremium,     setIsPremium]     = useState(false)
  const [plano,         setPlano]         = useState<string | null>(null)
  const [premiumUntil,  setPremiumUntil]  = useState<string | null>(null)
  const [checkingPlan,  setCheckingPlan]  = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (success && typeof window !== 'undefined') {
      localStorage.setItem('lm_premium', 'true')
    }
    async function checkPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('is_premium, plano, premium_until')
          .eq('id', user.id)
          .single()
        if (data?.is_premium) {
          setIsPremium(true)
          setPlano(data.plano ?? null)
          setPremiumUntil(data.premium_until
            ? new Date(data.premium_until).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
            : null)
        }
      }
      setCheckingPlan(false)
    }
    checkPlan()
  }, [success])

  async function handlePortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error ?? 'Erro ao abrir portal. Tente novamente.')
    } catch { alert('Erro de conexão. Tente novamente.') }
    finally { setPortalLoading(false) }
  }

  // Tela de sucesso (logo após subscrever)
  if (success) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">Bem-vindo ao Premium!</h1>
        <p className="text-gray-500 max-w-sm mx-auto">Seu acesso ilimitado está ativo. Treine quantas vezes quiser.</p>
        <Link href="/" className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
          Começar agora →
        </Link>
      </div>
    )
  }

  // A verificar plano...
  if (checkingPlan) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Utilizador já é Premium — mostrar gestão da assinatura
  if (isPremium) {
    return (
      <div className="max-w-lg mx-auto py-12 space-y-8">
        <div className="text-center space-y-3">
          <div className="text-6xl">👑</div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Você é Premium!</h1>
          <p className="text-gray-500">O seu acesso ilimitado está ativo.</p>
        </div>

        {/* Card do plano */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Plano ativo</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <Crown size={22} />
                {plano ? PLANO_LABELS[plano] ?? plano : 'Premium'}
              </p>
              {premiumUntil && (
                <p className="text-sm text-amber-600 dark:text-amber-500">
                  Válido até {premiumUntil}
                </p>
              )}
            </div>
            <span className="bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-1.5 rounded-full">
              ✓ Ativo
            </span>
          </div>
        </div>

        {/* Features ativas */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 shadow-sm">
              <Icon size={16} className="text-blue-600 shrink-0" />
              <span className="text-xs text-gray-700 dark:text-gray-300">{text}</span>
            </div>
          ))}
        </div>

        {/* Gerir assinatura */}
        <div className="space-y-3">
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 dark:bg-gray-700 text-white font-semibold py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            {portalLoading
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Settings size={16} /> Gerir assinatura</>
            }
          </button>
          <p className="text-center text-xs text-gray-400">
            Alterar plano · Cancelar · Histórico de faturas — tudo pelo portal Stripe
          </p>
          <Link href="/" className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Voltar a treinar
          </Link>
        </div>
      </div>
    )
  }

  // Utilizador free — mostrar planos
  async function handleCheckout(planoId: string) {
    setLoading(planoId)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${location.origin}/auth/callback?next=/premium` },
        })
        return
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plano: planoId,
          coupon_code: couponValid ? appliedCoupon : undefined,
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Erro ao iniciar checkout. Tente novamente.')
    } catch { alert('Erro de conexão. Tente novamente.') }
    finally { setLoading(null) }
  }

  async function handleCoupon() {
    if (!coupon.trim()) return
    setCouponMsg('')
    setCouponValid(false)
    const res  = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: coupon.trim() }),
    })
    const data = await res.json()
    if (data.valid) {
      setCouponMsg('✅ Cupom válido! ' + (data.description ?? ''))
      setCouponValid(true)
      setAppliedCoupon(coupon.trim().toUpperCase())
    } else {
      setCouponMsg('❌ Cupom inválido ou expirado.')
      setCouponValid(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="text-5xl">⚡</div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">LogicaMente Premium</h1>
        <p className="text-gray-500 text-lg">Treine sem limites. Evolua mais rápido.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {FEATURES.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 shadow-sm">
            <Icon size={18} className="text-blue-600 shrink-0" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{text}</span>
          </div>
        ))}
      </div>

      {couponValid && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-300 font-medium">
          🎁 Cupom <strong>{appliedCoupon}</strong> aplicado — desconto será refletido no checkout
        </div>
      )}

      <div className="space-y-3">
        {PLANOS.map(plano => (
          <button key={plano.id} onClick={() => handleCheckout(plano.id)} disabled={loading === plano.id}
            className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all text-left
              ${plano.destaque
                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-100 scale-[1.01]'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-400'
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

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Tem um cupom de desconto?</p>
        <div className="flex gap-2">
          <input value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleCoupon()}
            placeholder="Digite o código" maxLength={20}
            className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase" />
          <button onClick={handleCoupon}
            className="px-4 py-2 bg-gray-800 dark:bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            Aplicar
          </button>
        </div>
        {couponMsg && <p className="text-xs text-gray-600 dark:text-gray-400">{couponMsg}</p>}
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
