'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)

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

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setOpen(false)
  }

  if (loading) return <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />

  if (!user) {
    return (
      <button
        onClick={signIn}
        className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        Entrar
      </button>
    )
  }

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
