import { getPuzzleById, allPuzzles, NIVEL_LABELS, NIVEL_COLORS } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PuzzleGame from '@/components/puzzle/PuzzleGame'
import ProximoPuzzle from '@/components/puzzle/ProximoPuzzle'

export async function generateStaticParams() {
  return allPuzzles.map(p => ({ id: p.id }))
}

export default async function PuzzlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = getPuzzleById(id)
  if (!puzzle) notFound()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 font-mono text-sm">{puzzle.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${NIVEL_COLORS[puzzle.nivel]}`}>
              {NIVEL_LABELS[puzzle.nivel]}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">{puzzle.tema}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {puzzle.num_posicoes} posições · {puzzle.atributos.length} atributos · {puzzle.num_pistas} pistas
          </p>
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:underline whitespace-nowrap">
          ← Início
        </Link>
      </div>

      <PuzzleGame puzzle={puzzle} />

      <div className="flex justify-center pt-2">
        <ProximoPuzzle currentId={puzzle.id} />
      </div>
    </div>
  )
}
