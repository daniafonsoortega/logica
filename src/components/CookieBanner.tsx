'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('lm_cookies_consent')) setVisible(true)
  }, [])

  function accept(type: 'all' | 'essential') {
    localStorage.setItem('lm_cookies_consent', type)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-3xl mx-auto bg-gray-900 dark:bg-gray-800 text-white rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-200">
          <span className="font-semibold text-white">🍪 Cookies</span> — Usamos cookies essenciais para o funcionamento do site e cookies de análise para melhorar a experiência.{' '}
          <Link href="/cookies" className="underline text-blue-300 hover:text-blue-200">Saiba mais</Link>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => accept('essential')}
            className="px-4 py-2 rounded-xl border border-gray-600 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Só essenciais
          </button>
          <button
            onClick={() => accept('all')}
            className="px-4 py-2 rounded-xl bg-blue-600 text-sm font-semibold hover:bg-blue-500 transition-colors"
          >
            Aceitar tudo
          </button>
        </div>
      </div>
    </div>
  )
}
