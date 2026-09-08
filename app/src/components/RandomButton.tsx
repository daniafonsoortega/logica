'use client'
// Botão que sorteia um puzzle/questão e navega direto, sem tela intermediária
// Suporta filtro por tipo de puzzle e/ou por nível de dificuldade

import { useRouter } from 'next/navigation'
import { allPuzzles, allQuestoes } from '@/lib/data'
import type { TipoPuzzle } from '@/types'

interface Props {
  modo: 'puzzle' | 'questao'
  tipo?: TipoPuzzle        // filtra por tipo de puzzle
  nivel?: string           // filtra por nível: 'facil' | 'medio' | 'dificil' | 'expert'
  className?: string
  children: React.ReactNode
}

export default function RandomButton({ modo, tipo, nivel, className, children }: Props) {
  const router = useRouter()

  function sortear() {
    if (modo === 'questao') {
      const pool = nivel
        ? allQuestoes.filter(q => q.nivel === nivel)
        : allQuestoes
      const q = pool[Math.floor(Math.random() * pool.length)]
      if (q) router.push(`/questoes/${q.id}`)
    } else {
      let pool = tipo
        ? allPuzzles.filter(p => (p.tipo ?? 'grade') === tipo)
        : allPuzzles
      if (nivel) pool = pool.filter(p => p.nivel === nivel)
      const p = pool[Math.floor(Math.random() * pool.length)]
      if (p) router.push(`/puzzles/${p.id}`)
    }
  }

  return (
    <button onClick={sortear} className={className}>
      {children}
    </button>
  )
}
