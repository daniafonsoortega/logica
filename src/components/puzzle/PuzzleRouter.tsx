'use client'

// Seleciona o componente de jogo certo com base em puzzle.tipo
import type { Puzzle, PuzzleGrade } from '@/types'
import PuzzleGame    from './PuzzleGame'
import DetetiiveGame from './DetetiiveGame'
import SequenciaGame from './SequenciaGame'
import MentiuGame    from './MentiuGame'
import CodigoGame    from './CodigoGame'

interface Props { puzzle: Puzzle }

export default function PuzzleRouter({ puzzle }: Props) {
  const tipo = puzzle.tipo ?? 'grade'

  if (tipo === 'detetive')  return <DetetiiveGame puzzle={puzzle as any} />
  if (tipo === 'sequencia') return <SequenciaGame puzzle={puzzle as any} />
  if (tipo === 'mentiu')    return <MentiuGame    puzzle={puzzle as any} />
  if (tipo === 'codigo')    return <CodigoGame    puzzle={puzzle as any} />

  // grade (existente) — passa como PuzzleGrade
  return <PuzzleGame puzzle={puzzle as unknown as PuzzleGrade} />
}
