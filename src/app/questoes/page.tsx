import Link from 'next/link'
import { allQuestoes, NIVEL_LABELS, NIVEL_COLORS } from '@/lib/data'
import type { Nivel } from '@/types'

export default function QuestoesPage() {
  const niveis: Nivel[] = ['facil', 'medio', 'dificil', 'expert']
  const bancas = [...new Set(allQuestoes.map(q => q.banca))].sort()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Questões de Concurso</h1>
        <p className="text-gray-500 mt-1">
          Raciocínio lógico de provas reais. Explicação detalhada em cada resposta.
        </p>
      </div>

      {/* Filtro por banca (visual) */}
      <div className="flex flex-wrap gap-2">
        {bancas.map(b => (
          <span key={b} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium border border-gray-200">
            {b}
          </span>
        ))}
      </div>

      {niveis.map(nivel => {
        const questoes = allQuestoes.filter(q => q.nivel === nivel)
        return (
          <section key={nivel} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${NIVEL_COLORS[nivel]}`}>
                {NIVEL_LABELS[nivel]}
              </span>
              <span className="text-gray-400 text-sm">{questoes.length} questões</span>
            </div>
            <div className="grid gap-2">
              {questoes.map(q => (
                <Link
                  key={q.id}
                  href={`/questoes/${q.id}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-purple-300 transition-all group flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">{q.id}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {q.banca}
                      </span>
                      <span className="text-xs text-gray-400">{q.orgao} · {q.ano}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-purple-900">
                      {q.enunciado.split('\n')[0].slice(0, 120)}...
                    </p>
                  </div>
                  <span className="text-gray-400 group-hover:text-purple-600 text-lg shrink-0">→</span>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
