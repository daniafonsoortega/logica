'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement, c: object) => void } } }
  }
}

const GOOGLE_CLIENT_ID = '887732260186-gu2be5a0lu98sdh8iblpp716q00rptuk.apps.googleusercontent.com'

function AuthErrorContent() {
  const params  = useSearchParams()
  const reason  = params.get('reason') ?? 'desconhecido'
  const desc    = params.get('desc') ?? ''

  const [tab, setTab]         = useState<'entrar' | 'cadastrar'>('entrar')
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [senhaConf, setSenhaConf] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)
  const googleBtnRef          = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  const reasonMessages: Record<string, string> = {
    access_denied:   'O login com Google foi cancelado ou negado.',
    exchange_failed: 'O link de login expirou. Tente novamente.',
    oauth_error:     desc ? decodeURIComponent(desc) : 'Erro na autenticação com o Google.',
    no_code:         'O login foi interrompido antes de terminar.',
    desconhecido:    'Ocorreu um problema durante o login.',
  }

  useEffect(() => {
    function initGoogle() {
      if (!window.google || !googleBtnRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setError(null); setBusy(true)
          const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: response.credential })
          if (error) { setError('Erro ao entrar com Google: ' + error.message); setBusy(false) }
          else { window.location.href = '/' }
        },
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', locale: 'pt-BR',
        width: googleBtnRef.current.offsetWidth || 320,
      })
    }
    if (window.google) { initGoogle() }
    else {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true; s.onload = initGoogle
      document.head.appendChild(s)
    }
  }, [])

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault(); setError(null); setSuccess(null); setBusy(true)
    if (tab === 'cadastrar') {
      if (senha !== senhaConf) { setError('As senhas não coincidem.'); setBusy(false); return }
      if (senha.length < 6)   { setError('A senha deve ter pelo menos 6 caracteres.'); setBusy(false); return }
      const { error } = await supabase.auth.signUp({ email, password: senha })
      if (error) { setError(error.message.includes('already') ? 'Email já cadastrado. Tente entrar.' : error.message) }
      else { setSuccess('Conta criada!'); setTimeout(() => { window.location.href = '/' }, 1200) }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) { setError(error.message.includes('Invalid login') ? 'Email ou senha incorretos.' : error.message) }
      else { window.location.href = '/' }
    }
    setBusy(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full space-y-5">
        <div className="text-center space-y-1">
          <div className="text-3xl">😕</div>
          <p className="text-sm text-gray-500">{reasonMessages[reason] ?? reasonMessages['desconhecido']}</p>
        </div>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
          <button onClick={() => { setTab('entrar'); setError(null) }} className={`flex-1 py-2 transition-colors ${tab === 'entrar' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Entrar</button>
          <button onClick={() => { setTab('cadastrar'); setError(null) }} className={`flex-1 py-2 transition-colors ${tab === 'cadastrar' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>Cadastrar</button>
        </div>

        <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="flex-1 h-px bg-gray-200" /> ou <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {tab === 'cadastrar' && <input type="password" placeholder="Confirmar senha" value={senhaConf} onChange={e => setSenhaConf(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />}
          {error   && <p className="text-xs text-red-500">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <button type="submit" disabled={busy} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {busy ? 'Aguarde...' : tab === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        {tab === 'entrar'
          ? <p className="text-center text-xs text-gray-400">Não tem conta?{' '}<button onClick={() => { setTab('cadastrar'); setError(null) }} className="text-blue-600 hover:underline">Cadastre-se</button></p>
          : <p className="text-center text-xs text-gray-400">Já tem conta?{' '}<button onClick={() => { setTab('entrar'); setError(null) }} className="text-blue-600 hover:underline">Entrar</button></p>
        }
        <a href="/" className="block text-center text-xs text-gray-400 hover:text-gray-600">Continuar sem entrar</a>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return <Suspense><AuthErrorContent /></Suspense>
}
