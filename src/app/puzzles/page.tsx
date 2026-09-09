'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { allPuzzles } from '@/lib/data'
import RandomButton from '@/components/RandomButton'

const TIPOS = [
  { key: 'todos',    label: 'Todos',          emoji: '🧩' },
  { key: 'grade',    label: 'Grade Einstein', emoji: '🔍' },
  { key: 'detetive', label: 'Detetive',       emoji: '🕵️' },
  { key: 'sequencia',label: 'Sequência',      emoji: '📅' },
  { key: 'mentiu',   label: 'Quem Mentiu?',   emoji: '🎭' },
  { key: 'codigo',   label: 'Código',         emoji: '🔐' },
  { key: 'cifra',    label: 'Cifra',          emoji: '🔤' },
]

const NIVEIS = [
  { key: 'todos',   label: 'Todos'   },
  { key: 'facil',   label: 'Fácil'   },
  { key: 'medio',   label: 'Médio'   },
  { key: 'dificil', label: 'Difícil' },
  { key: 'expert',  label: 'Expert'  },
]

const NIVEL_COLORS: Record<string, string> = {
  facil:   'bg-green-100  text-green-800  border-green-200',
  medio:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  dificil: 'bg-red-100    text-red-800    border-red-200',
  expert:  'bg-purple-100 text-purple-800 border-purple-200',
}

const PAGE_SIZE = 24

export default function PuzzlesPage() {
  const [tipo,  setTipo]  = useState('todos')
  const [nivel, setNivel] = useState('todos')
  const [page,  setPage]  = useState(1)

  const filtered = useMemo(() => {
    let list = allPuzzles
    if (tipo  !== 'todos') list = list.filter(p => (p.tipo ?? 'grade') === tipo)
    if (nivel !== 'todos') list = list.filter(p => p.nivel === nivel)
    return list
  }, [tipo, nivel])

  const shown    = filtered.slice(0, page * PAGE_SIZE)
  const hasMore  = shown.length < filtered.length

  function changeFilter(newTipo: string, newNivel: string) {
    setTipo(newTipo)
    setNivel(newNivel)
    setPage(1)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">🧩 Puzzles</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} puzzle{filtered.length !== 1 ? 's' : ''} disponíveis</p>
        </div>
        <RandomButton
          modo="puzzle"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm text-sm"
        >
          🎲 Aleatório
        </RandomButton>
      </div>

      {/* Filtro por tipo */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tipo</p>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map(t => (
            <button
              key={t.key}
              onClick={() => changeFilter(t.key, nivel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${tipo === t.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
            >
              <span>{t.emoji}</span> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtro por nível */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nível</p>
        <div className="flex flex-wrap gap-2">
          {NIVEIS.map(n => (
            <button
              key={n.key}
              onClick={() => changeFilter(tipo, n.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all
                ${nivel === n.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>Nenhum puzzle encontrado para estes filtros.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shown.map(p => {
              const t = TIPOS.find(t => t.key === (p.tipo ?? 'grade'))
              return (
                <Link
                  key={p.id}
                  href={`/puzzles/${p.id}`}
                  className="group flex flex-col gap-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400 font-mono">{p.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${NIVEL_COLORS[p.nivel] ?? ''}`}>
                      {p.nivel}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    {p.tema}
                  </p>
                  <p className="text-xs text-gray-400 mt-auto">
                    {t?.emoji} {t?.label ?? p.tipo}
                  </p>
                </Link>
              )
            })}
          </div>

          {hasMore && (
            <div className="text-center">
              <button
                onClick={() => setPage(pg => pg + 1)}
                className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Ver mais ({filtered.length - shown.length} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
