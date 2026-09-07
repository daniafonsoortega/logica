'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

type ModalTab = 'entrar' | 'cadastrar'

export default function AuthButton() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [tab, setTab]         = useState<ModalTab>('entrar')
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [senhaConf, setSenhaConf] = useState('')
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) setModalOpen(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  function openModal(defaultTab: ModalTab = 'entrar') {
    setTab(defaultTab)
    setError(null)
    setSuccess(null)
    setEmail('')
    setSenha('')
    setSenhaConf('')
    setModalOpen(true)
  }

  async function signInGoogle() {
    setError(null)
    setBusy(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError('Não foi possível entrar com o Google. Tente novamente.')
    setBusy(false)
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setBusy(true)

    if (tab === 'cadastrar') {
      if (senha !== senhaConf) {
        setError('As senhas não coincidem.')
        setBusy(false)
        return
      }
      if (senha.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.')
        setBusy(false)
        return
      }
      const { error } = await supabase.auth.signUp({ email, password: senha })
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          setError('Este email já está cadastrado. Tente entrar.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess('Conta criada! Você já está conectado.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Email não confirmado. Verifique sua caixa de entrada.')
        } else {
          setError(error.message)
        }
      }
    }
    setBusy(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setMenuOpen(false)
  }

  if (loading) return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />

  if (!user) {
    return (
      <>
        <button
          onClick={() => openModal('entrar')}
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Entrar
        </button>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
               onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}>
            <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">

              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  {tab === 'entrar' ? 'Entrar na conta' : 'Criar conta'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>

              {/* Tabs */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm font-medium">
                <button
                  onClick={() => { setTab('entrar'); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2 transition-colors ${tab === 'entrar' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => { setTab('cadastrar'); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2 transition-colors ${tab === 'cadastrar' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Cadastrar
                </button>
              </div>

              {/* Google */}
              <button
                onClick={signInGoogle}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="flex-1 h-px bg-gray-200" />
                ou
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailAuth} className="space-y-3">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {tab === 'cadastrar' && (
                  <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={senhaConf}
                    onChange={e => setSenhaConf(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}

                {error   && <p className="text-xs text-red-500">{error}</p>}
                {success && <p className="text-xs text-green-600">{success}</p>}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {busy ? 'Aguarde...' : tab === 'entrar' ? 'Entrar' : 'Criar conta'}
                </button>
              </form>

              {tab === 'entrar' && (
                <p className="text-center text-xs text-gray-400">
                  Não tem conta?{' '}
                  <button onClick={() => { setTab('cadastrar'); setError(null) }} className="text-blue-600 hover:underline">
                    Cadastre-se
                  </button>
                </p>
              )}
              {tab === 'cadastrar' && (
                <p className="text-center text-xs text-gray-400">
                  Já tem conta?{' '}
                  <button onClick={() => { setTab('entrar'); setError(null) }} className="text-blue-600 hover:underline">
                    Entrar
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  // Logged in
  const avatar   = user.user_metadata?.avatar_url
  const name     = user.user_metadata?.full_name ?? user.email?.split('@')[0]
  const initials = name?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen(o => !o)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        aria-label="Menu do usuário"
      >
        {avatar
          ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-gray-200" />
          : <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{initials}</div>
        }
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 truncate">{user.email}</div>
            <a href="/ranking" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Meu perfil</a>
            <button onClick={signOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sair</button>
          </div>
        </>
      )}
    </div>
  )
}
