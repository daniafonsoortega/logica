'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function PremiumContent() {
  const params  = useSearchParams()
  const success = params.get('success')

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
  return (
    <div className="text-center py-16 space-y-6">
      <div className="text-6xl">⚡</div>
      <h1 className="text-3xl font-black text-gray-900">Premium</h1>
      <Link href="/" className="text-blue-600 hover:underline">Voltar ao início</Link>
    </div>
  )
}

export default function PremiumPage() {
  return <Suspense><PremiumContent /></Suspense>
}
