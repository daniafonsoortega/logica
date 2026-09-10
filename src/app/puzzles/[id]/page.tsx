import type { Metadata } from 'next'
import { allPuzzles, NIVEL_LABELS, NIVEL_COLORS } from '@/lib/data'
import PuzzleRouter from '@/components/puzzle/PuzzleRouter'
import ProximoPuzzle from '@/components/puzzle/ProximoPuzzle'
import DailyLimitGuard from '@/components/DailyLimitGuard'
import ShareButton from '@/components/ShareButton'
import { notFound } from 'next/navigation'

const TIPO_LABELS: Record<string, string> = {
  grade:     '🔍 Einstein Grid',
  detetive:  '🕵️ Detetive',
  sequencia: '📅 Sequência',
  mentiu:    '🎭 Quem Mentiu?',
  codigo:    '🔐 Código Secreto',
  cifra:     '🔑 Cifra',
}

export function generateStaticParams() {
  return allPuzzles.map(p => ({ id: p.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const puzzle = allPuzzles.find(p => p.id === id)
  if (!puzzle) return {}

  const tipo  = puzzle.tipo ?? 'grade'
  const nivel = NIVEL_LABELS[puzzle.nivel] ?? puzzle.nivel
  const title = `${puzzle.tema} — MalhaMente`
  const desc  = `${TIPO_LABELS[tipo] ?? tipo} · Nível ${nivel}. Resolva este puzzle de lógica e treine seu raciocínio!`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `https://malha-mente.vercel.app/puzzles/${id}`,
      siteName: 'MalhaMente',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
  }
}

export default async function PuzzlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = allPuzzles.find(p => p.id === id)
  if (!puzzle) notFound()

  const tipo  = puzzle.tipo ?? 'grade'
  const nivel = puzzle.nivel

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400 font-medium">{TIPO_LABELS[tipo] ?? tipo} · {puzzle.id}</p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{puzzle.tema}</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${NIVEL_COLORS[nivel]}`}>
          {NIVEL_LABELS[nivel]}
        </span>
      </div>

      <DailyLimitGuard>
        <PuzzleRouter puzzle={puzzle} />
      </DailyLimitGuard>

      {/* Ações após o puzzle */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <ProximoPuzzle
          currentId={puzzle.id}
          currentNivel={puzzle.nivel}
          currentTipo={tipo}
        />
        <ShareButton puzzleId={puzzle.id} puzzleTema={puzzle.tema} />
      </div>
    </div>
  )
}
