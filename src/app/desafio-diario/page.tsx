import { allPuzzles } from '@/lib/data'
import PuzzleRouter from '@/components/puzzle/PuzzleRouter'
import DailyChallengeWrapper from '@/components/DailyChallengeWrapper'
import { NIVEL_LABELS, NIVEL_COLORS } from '@/lib/data'

function hashDate(date: string): number {
  let h = 5381
  for (const c of date) {
    h = (((h << 5) + h) + c.charCodeAt(0)) & 0x7fffffff
  }
  return h
}

function getDailyPuzzle(date?: string) {
  const d = date ?? new Date().toISOString().slice(0, 10)
  const idx = hashDate(d) % allPuzzles.length
  return { puzzle: allPuzzles[idx], date: d }
}

const TIPO_LABELS: Record<string, string> = {
  grade: '🔍 Einstein Grid', detetive: '🕵️ Detetive',
  sequencia: '📅 Sequência', mentiu: '🎭 Quem Mentiu?',
  codigo: '🔐 Código Secreto', cifra: '🔤 Cifra',
}

export default function DesafioDiarioPage() {
  const { puzzle, date } = getDailyPuzzle()
  const tipo  = puzzle.tipo ?? 'grade'
  const nivel = puzzle.nivel

  const [y, m, d2] = date.split('-')
  const dateDisplay = `${d2}/${m}/${y}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header especial */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">🏆 Desafio do Dia</p>
            <h1 className="text-2xl font-black text-gray-900">{puzzle.tema}</h1>
            <p className="text-sm text-gray-500">{dateDisplay} · {TIPO_LABELS[tipo] ?? tipo}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${NIVEL_COLORS[nivel]}`}>
            {NIVEL_LABELS[nivel]}
          </span>
        </div>
      </div>

      {/* Status + countdown (client) */}
      <DailyChallengeWrapper date={date} puzzleId={puzzle.id}>
        <PuzzleRouter puzzle={puzzle} />
      </DailyChallengeWrapper>
    </div>
  )
}
