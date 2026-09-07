'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'
import { X } from 'lucide-react'

type Mode = 'login' | 'signup'

export default function AuthButton() {
  const [user, setUser]         = useState<User | null>(null)
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(false)       // user dropdown
  const [modal, setModal]       = useState(false)       // auth modal
  const [mode, setMode]         = useState<Mode>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState('')
  const [info, setInfo]         = useState('')

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function openModal(m: Mode) {
    setMode(m)
    setError('')
    setInfo('')
    setEmail('')
    setPassword('')
    setModal(true)
  }

  async function signInGoogle() {
    setBusy(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
    setBusy(false)
  }

  async function handleEmail() {
    if (!email || !password) { setError('Preencha email e senha.'); return }
    if (password.length < 6) { setError('Senha precisa ter pelo menos 6 caracteres.'); return }
    setBusy(true)
    setError('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message)
      else setModal(false)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else { setInfo('Conta criada! Você já está logado.'); setModal(false) }
    }
    setBusy(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setOpen(false)
  }

  if (loading) return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />

  if (!user) return (
    <>
      <button
        onClick={() => openModal('login')}
        className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Entrar
      </button>
      <button
        onClick={() => openModal('signup')}
        className="text-sm font-medium px-3 py-1.5 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
      >
        Cadastrar
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <button onClick={() => setModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>

            <h2 className="text-xl font-black text-gray-900">
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </h2>

            {/* Google */}
            <button
              onClick={signInGoogle}
              disabled={busy}
              className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/></svg>
              Continuar com Google
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="flex-1 h-px bg-gray-200" />ou<div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Email + password */}
            <div className="space-y-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                placeholder="Senha (mín. 6 caracteres)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleEmail()}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {info  && <p className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">{info}</p>}

            <button
              onClick={handleEmail}
              disabled={busy}
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {busy ? '...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </button>

            <p className="text-center text-xs text-gray-500">
              {mode === 'login' ? (
                <>Não tem conta?{' '}
                  <button onClick={() => { setMode('signup'); setError('') }} className="text-blue-600 hover:underline font-medium">Cadastrar</button>
                </>
              ) : (
                <>Já tem conta?{' '}
                  <button onClick={() => { setMode('login'); setError('') }} className="text-blue-600 hover:underline font-medium">Entrar</button>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  )

  // Logged in
  const avatar   = user.user_metadata?.avatar_url
  const name     = user.user_metadata?.full_name ?? user.email?.split('@')[0]
  const initials = name?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        {avatar
          ? <img src={avatar} alt={name} className="w-8 h-8 rounded-full border border-gray-200" />
          : <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{initials}</div>
        }
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
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
