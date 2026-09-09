'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

declare global {
  interface Window {
    google?: {
      accounts: { id: { initialize: (c: object) => void; prompt: () => void; renderButton: (el: HTMLElement, c: object) => void; cancel: () => void } }
    }
  }
}

const GOOGLE_CLIENT_ID = '887732260186-gu2be5a0lu98sdh8iblpp716q00rptuk.apps.googleusercontent.com'
type ModalTab = 'entrar' | 'cadastrar'

export default function AuthButton() {
  const [user, setUser]           = useState<User | null>(null)
  const [loading, setLoading]     = useState(true)
  const [menuOpen, setMenuOpen]   = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab]             = useState<ModalTab>('entrar')
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [senhaConf, setSenhaConf] = useState('')
  const [error, setError]         = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [busy, setBusy]           = useState(false)
  const [streak, setStreak]       = useState<number>(0)
  const googleBtnRef              = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
      if (data.user) loadStreak(data.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) { setModalOpen(false); loadStreak(session.user.id) }
      else setStreak(0)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadStreak(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('streak_atual')
      .eq('id', userId)
      .single()
    if (data?.streak_atual) setStreak(data.streak_atual)
  }

  useEffect(() => {
    if (!modalOpen) return
    function initGoogle() {
      if (!window.google || !googleBtnRef.current) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          setError(null); setBusy(true)
          const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: response.credential })
          if (error) setError('Não foi possível entrar com o Google: ' + error.message)
          setBusy(false)
        },
      })
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', locale: 'pt-BR',
        width: googleBtnRef.current.offsetWidth || 320,
      })
    }
    if (window.google) initGoogle()
    else {
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true; script.defer = true; script.onload = initGoogle
      document.head.appendChild(script)
    }
  }, [modalOpen])

  function openModal(defaultTab: ModalTab = 'entrar') {
    setTab(defaultTab); setError(null); setSuccess(null)
    setEmail(''); setSenha(''); setSenhaConf(''); setModalOpen(true)
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault(); setError(null); setSuccess(null); setBusy(true)
    if (tab === 'cadastrar') {
      if (senha !== senhaConf) { setError('As senhas não coincidem.'); setBusy(false); return }
      if (senha.length < 6)   { setError('A senha deve ter pelo menos 6 caracteres.'); setBusy(false); return }
      const { error } = await supabase.auth.signUp({ email, password: senha })
      if (error) setError(error.message.includes('already') ? 'Este email já está cadastrado. Tente entrar.' : error.message)
      else       setSuccess('Conta criada! Você já está conectado.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) setError(error.message.includes('Invalid login') ? 'Email ou senha incorretos.' : error.message)
    }
    setBusy(false)
  }

  async function signOut() { await supabase.auth.signOut(); setUser(null); setMenuOpen(false); setStreak(0) }

  if (loading) return <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />

  if (!user) {
    return (
      <>
        <button onClick={() => openModal('entrar')}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
          Entrar
        </button>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
               onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{tab === 'entrar' ? 'Entrar na conta' : 'Criar conta'}</h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-sm font-medium">
                <button onClick={() => { setTab('entrar'); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2 transition-colors ${tab === 'entrar' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Entrar</button>
                <button onClick={() => { setTab('cadastrar'); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2 transition-colors ${tab === 'cadastrar' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>Cadastrar</button>
              </div>
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[44px]" />
              <div className="flex items-center gap-2 text-xs text-gray-400"><div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" /> ou <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" /></div>
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required
                  className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {tab === 'cadastrar' && (
                  <input type="password" placeholder="Confirmar senha" value={senhaConf} onChange={e => setSenhaConf(e.target.value)} required
                    className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                )}
                {error   && <p className="text-xs text-red-500">{error}</p>}
                {success && <p className="text-xs text-green-600">{success}</p>}
                <button type="submit" disabled={busy}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {busy ? 'Aguarde...' : tab === 'entrar' ? 'Entrar' : 'Criar conta'}
                </button>
              </form>
              {tab === 'entrar'
                ? <p className="text-center text-xs text-gray-400">Não tem conta? <button onClick={() => { setTab('cadastrar'); setError(null) }} className="text-blue-600 hover:underline">Cadastre-se</button></p>
                : <p className="text-center text-xs text-gray-400">Já tem conta? <button onClick={() => { setTab('entrar'); setError(null) }} className="text-blue-600 hover:underline">Entrar</button></p>
              }
            </div>
          </div>
        )}
      </>
    )
  }

  const avatar   = user.user_metadata?.avatar_url
  const name     = user.user_metadata?.full_name ?? user.email?.split('@')[0]
  const initials = name?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="relative flex items-center gap-1.5">
      {/* Streak badge — só se streak > 0 */}
      {streak > 0 && (
        <span className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
          🔥 {streak}
        </span>
      )}
      <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="Menu do usuário">
        {avatar
          ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" />
          : <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{initials}</div>
        }
      </button>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[180px]">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
              {streak > 0 && <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mt-0.5">🔥 {streak} {streak === 1 ? 'dia' : 'dias'} seguidos</p>}
            </div>
            <a href="/perfil" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">👤 Meu perfil</a>
            <a href="/ranking" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">🥇 Ranking</a>
            <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950">Sair</button>
          </div>
        </>
      )}
    </div>
  )
}
