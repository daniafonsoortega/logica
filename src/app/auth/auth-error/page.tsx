'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase-browser'

function AuthErrorContent() {
  const params  = useSearchParams()
  const reason  = params.get('reason') ?? 'desconhecido'
  const desc    = params.get('desc') ?? ''

  type MsgEntry = { title: string; body: string; hint?: string }

  const messages: Record<string, MsgEntry> = {
    access_denied: {
      title: 'Acesso negado',
      body:  'Você cancelou o login ou não autorizou o acesso à sua conta Google.',
      hint:  'Para usar o LogicaMente é necessário permitir o acesso. Tente novamente.',
    },
    exchange_failed: {
      title: 'Sessão expirada',
      body:  'O link de login expirou ou já foi usado. Isso costuma acontecer quando a aba fica aberta por muito tempo.',
      hint:  'Tente entrar novamente — leva só alguns segundos.',
    },
    oauth_error: {
      title: 'Erro no login com Google',
      body:  desc ? decodeURIComponent(desc) : 'Ocorreu um erro durante a autenticação com o Google.',
      hint:  'Se o problema persistir, tente novamente em alguns instantes.',
    },
    no_code: {
      title: 'Login interrompido',
      body:  'O processo de login foi interrompido antes de terminar.',
      hint:  'Tente novamente — se for a primeira vez, sua conta será criada automaticamente.',
    },
    desconhecido: {
      title: 'Erro ao entrar',
      body:  'Ocorreu um problema inesperado durante o login.',
    },
  }

  const { title, body, hint } = messages[reason] ?? messages['desconhecido']

  async function handleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center space-y-4">
        <div className="text-4xl">😕</div>

        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={handleSignIn}
            className="w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Entrar com Google
          </button>
          <button
            onClick={handleSignIn}
            className="w-full px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Criar conta com Google
          </button>
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1"
          >
            Continuar sem entrar
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  )
}
