'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { allQuestoes } from '@/lib/data'
import { isPremium } from '@/lib/freemium'
import { Lock } from 'lucide-react'

const BANCAS = [...new Set(allQuestoes.map(q => q.banca).filter(Boolean))].sort()

const NIVEIS = [
  { key: 'todos',   label: 'Todos',  emoji: '🎲' },
  { key: 'facil',   label: 'Fácil',  emoji: '🟢' },
  { key: 'medio',   label: 'Médio',  emoji: '🟡' },
  { key: 'dificil', label: 'Difícil',emoji: '🔴' },
  { key: 'expert',  label: 'Expert', emoji: '🟣' },
]

export default function QuestoesPage() {
  const router  = useRouter()
  const premium = typeof window !== 'undefined' ? isPremium() : false
  const [banca, setBanca] = useState<string>('todas')
  const [nivel, setNivel] = useState<string>('todos')

  function sortear() {
    let pool = banca === 'todas' ? allQuestoes : allQuestoes.filter(q => q.banca === banca)
    if (nivel !== 'todos') pool = pool.filter(q => q.nivel === nivel)
    if (!pool.length) pool = allQuestoes
    const random = pool[Math.floor(Math.random() * pool.length)]
    router.push(`/questoes/${random.id}`)
  }

  const totalFiltrado = (() => {
    let pool = banca === 'todas' ? allQuestoes : allQuestoes.filter(q => q.banca === banca)
    if (nivel !== 'todos') pool = pool.filter(q => q.nivel === nivel)
    return pool.length
  })()

  return (
    <div className="max-w-lg mx-auto py-8 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-3xl font-black text-gray-900">📝 Questões de Concurso</h1>
        <p className="text-gray-500">{allQuestoes.length} questões disponíveis</p>
      </div>

      {/* Filtro por nível */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Nível de dificuldade</h2>
        <div className="flex gap-2 flex-wrap">
          {NIVEIS.map(n => (
            <button
              key={n.key}
              onClick={() => setNivel(n.key)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all ${
                nivel === n.key
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300 hover:text-purple-700'
              }`}
            >
              {n.emoji} {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por banca */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-sm">Filtrar por banca</h2>
          {!premium && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1 font-medium">
              <Lock size={11} /> Premium
            </span>
          )}
        </div>
        {premium ? (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setBanca('todas')}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                banca === 'todas' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
              }`}>
              Todas as bancas
            </button>
            {BANCAS.map(b => (
              <button key={b} onClick={() => setBanca(b)}
                className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all text-left ${
                  banca === b ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                }`}>
                {b} <span className="opacity-60 text-xs">({allQuestoes.filter(q => q.banca === b).length})</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Com o Premium você filtra por banca examinadora.</p>
            <div className="grid grid-cols-2 gap-2 opacity-40 pointer-events-none select-none">
              {BANCAS.slice(0, 6).map(b => (
                <div key={b} className="px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 bg-gray-50">{b}</div>
              ))}
            </div>
            <a href="/premium" className="block text-center w-full bg-amber-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors">
              ⚡ Ativar Premium
            </a>
          </div>
        )}
      </div>

      {/* Sortear */}
      <button onClick={sortear}
        className="w-full bg-purple-600 text-white py-4 rounded-2xl text-lg font-bold hover:bg-purple-700 active:scale-[0.98] transition-all shadow-md">
        🎲 Sortear questão
        <span className="ml-2 text-sm font-normal opacity-80">— {totalFiltrado} disponíveis</span>
      </button>
    </div>
  )
}
