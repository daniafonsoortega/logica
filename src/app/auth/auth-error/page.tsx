'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
  const params = useSearchParams()
  const reason = params.get('reason') ?? 'desconhecido'

  const messages: Record<string, string> = {
    'exchange_failed':  'Não foi possível completar o login. O link pode ter expirado — tente novamente.',
    'no_code':          'Resposta inválida do Google. Tente novamente.',
    'desconhecido':     'Ocorreu um erro ao entrar. Tente novamente.',
  }

  const msg = messages[reason] ?? messages['desconhecido']

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-sm w-full text-center">
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-lg font-semibold text-gray-800 mb-2">Erro ao entrar</h1>
        <p className="text-sm text-gray-500 mb-6">{msg}</p>
        <a
          href="/"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar ao início
        </a>
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
