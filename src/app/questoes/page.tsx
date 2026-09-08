'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { allQuestoes } from '@/lib/data'
import { isPremium } from '@/lib/freemium'
import { Lock } from 'lucide-react'

const BANCAS = [...new Set(allQuestoes.map(q => q.banca).filter(Boolean))].sort()

export default function QuestoesPage() {
  const router   = useRouter()
  const premium  = typeof window !== 'undefined' ? isPremium() : false
  const [banca, setBanca] = useState<string>('todas')

  function sortear() {
    const pool = banca === 'todas'
      ? allQuestoes
      : allQuestoes.filter(q => q.banca === banca)
    const random = pool[Math.floor(Math.random() * pool.length)]
    router.push(`/questoes/${random.id}`)
  }

  return (
    <div className="max-w-lg mx-auto py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900">Questões de Concurso</h1>
        <p className="text-gray-500">{allQuestoes.length} questões disponíveis</p>
      </div>

      {/* Filtro por banca */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Filtrar por banca</h2>
          {!premium && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 font-medium">
              <Lock size={11} /> Premium
            </span>
          )}
        </div>

        {premium ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setBanca('todas')}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                banca === 'todas'
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
              }`}
            >
              Todas as bancas
            </button>
            {BANCAS.map(b => (
              <button
                key={b}
                onClick={() => setBanca(b)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all text-left ${
                  banca === b
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}
              >
                {b}
                <span className="ml-1 text-xs opacity-60">
                  ({allQuestoes.filter(q => q.banca === b).length})
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Com o Premium você filtra por banca examinadora e estuda exatamente o que vai cair na sua prova.
            </p>
            <div className="grid grid-cols-2 gap-2 opacity-40 pointer-events-none select-none">
              {BANCAS.slice(0, 6).map(b => (
                <div key={b} className="px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 bg-gray-50">
                  {b}
                </div>
              ))}
            </div>
            <a
              href="/premium"
              className="block text-center w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              ⚡ Ativar Premium
            </a>
          </div>
        )}
      </div>

      {/* Sortear */}
      <button
        onClick={sortear}
        className="w-full bg-purple-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-purple-700 transition-colors"
      >
        Sortear questão
        {banca !== 'todas' && <span className="ml-2 text-sm font-normal opacity-80">— {banca}</span>}
      </button>
    </div>
  )
}
