'use client'

import { useEffect, useState } from 'react'
import { getAllBestTimes } from '@/lib/stats'
import { allPuzzles } from '@/lib/data'
import Link from 'next/link'

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${String(sec).padStart(2,'0')}s` : `${String(sec).padStart(2,'0')}s`
}

const TIPO_EMOJI: Record<string, string> = {
  grade: '🔍', detetive: '🕵️', sequencia: '📅',
  mentiu: '🎭', codigo: '🔐', cifra: '🔤',
}

export default function BestTimesSection() {
  const [times, setTimes] = useState<Array<{ id: string; seconds: number; tema: string; tipo: string }>>([])

  useEffect(() => {
    const raw = getAllBestTimes()
    const enriched = raw
      .map(({ id, seconds }) => {
        const p = allPuzzles.find(x => x.id === id)
        return p ? { id, seconds, tema: p.tema, tipo: p.tipo ?? 'grade' } : null
      })
      .filter(Boolean) as Array<{ id: string; seconds: number; tema: string; tipo: string }>
    setTimes(enriched.slice(0, 10))
  }, [])

  if (times.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3">
      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
        ⏱️ Melhores Tempos Pessoais
      </h2>
      <p className="text-sm text-gray-400">Resolva puzzles para registar os seus recordes pessoais aqui.</p>
    </div>
  )

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
      <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
        ⏱️ Melhores Tempos Pessoais
        <span className="text-xs font-normal text-gray-400">Top {times.length}</span>
      </h2>
      <div className="space-y-2">
        {times.map(({ id, seconds, tema, tipo }, i) => (
          <Link
            key={id}
            href={`/puzzles/${id}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-colors group"
          >
            <span className="w-6 text-center text-sm font-bold text-gray-400">
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}
            </span>
            <span className="text-base">{TIPO_EMOJI[tipo] ?? '🧩'}</span>
            <span className="flex-1 text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">
              {tema}
            </span>
            <span className="font-mono text-sm font-semibold text-amber-600">
              {fmt(seconds)}
            </span>
          </Link>
        ))}
      </div>
      <p className="text-xs text-gray-400 text-center">
        Clique num puzzle para tentar bater o seu recorde
      </p>
    </div>
  )
}
