'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="text-6xl">😵</div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          Algo correu mal
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Houve um erro a carregar esta página. Pode tentar novamente ou voltar ao início.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            🔄 Tentar novamente
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ← Voltar ao início
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-300 dark:text-gray-600 font-mono">
            código: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
