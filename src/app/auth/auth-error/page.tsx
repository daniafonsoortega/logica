'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const params  = useSearchParams()
  const reason  = params.get('reason') ?? 'desconhecido'
  const desc    = params.get('desc') ?? ''

  type MsgEntry = { title: string; body: string; hint?: string }

  const messages: Record<string, MsgEntry> = {
    access_denied: {
      title: 'Acesso negado',
      body:  'Você cancelou o login ou não autorizou o acesso. Para usar o LogicaMente é necessário permitir o acesso à sua conta Google.',
      hint:  'Se mudou de ideia, tente novamente abaixo.',
    },
    exchange_failed: {
      title: 'Sessão expirada',
      body:  'O link de login expirou ou já foi usado. Isso costuma acontecer quando a aba fica aberta por muito tempo.',
      hint:  'Tente entrar novamente — o processo é rápido.',
    },
    oauth_error: {
      title: 'Erro no login com Google',
      body:  desc ? decodeURIComponent(desc) : 'Ocorreu um erro durante a autenticação com o Google.',
      hint:  'Se o problema persistir, tente novamente em alguns instantes.',
    },
    no_code: {
      title: 'Algo deu errado',
      body:  'Não foi possível completar o login. O processo foi interrompido antes de terminar.',
      hint:  'Tente novamente — se o erro continuar, pode ser necessário criar uma conta.',
    },
    desconhecido: {
      title: 'Erro ao entrar',
      body:  'Ocorreu um problema inesperado durante o login.',
      hint:  'Tente novamente ou crie uma conta nova.',
    },
  }

  const { title, body, hint } = messages[reason] ?? messages['desconhecido']

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center space-y-4">
        <div className="text-4xl">😕</div>

        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}

        <div className="flex flex-col gap-2 pt-2">
          <a
            href="/?login=1"
            className="inline-block w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </a>
          <a
            href="/?cadastro=1"
            className="inline-block w-full px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Criar uma conta
          </a>
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors pt-1"
          >
            Voltar ao início sem entrar
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
