import Link from 'next/link'
import { allPuzzles, NIVEL_LABELS, NIVEL_COLORS } from '@/lib/data'
import type { Nivel } from '@/types'

export default function PuzzlesPage() {
  const niveis: Nivel[] = ['facil', 'medio', 'dificil', 'expert']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Puzzles Lógicos</h1>
        <p className="text-gray-500 mt-1">
          Resolva puzzles dedutivos usando as pistas. Cada puzzle tem solução única.
        </p>
      </div>

      {niveis.map(nivel => {
        const puzzles = allPuzzles.filter(p => p.nivel === nivel)
        return (
          <section key={nivel} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${NIVEL_COLORS[nivel]}`}>
                {NIVEL_LABELS[nivel]}
              </span>
              <span className="text-gray-400 text-sm">{puzzles.length} puzzles</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {puzzles.map(p => (
                <Link
                  key={p.id}
                  href={`/puzzles/${p.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="text-xs text-gray-400 font-mono">{p.id}</div>
                  <div className="text-sm font-semibold text-gray-800 mt-1 group-hover:text-blue-700 line-clamp-2">
                    {p.tema}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {p.num_posicoes} pos · {p.num_pistas} pistas
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
