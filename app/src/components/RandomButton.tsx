'use client'
// Botão que sorteia um puzzle/questão e navega direto, sem tela intermediária

import { useRouter } from 'next/navigation'
import { allPuzzles, allQuestoes } from '@/lib/data'
import type { TipoPuzzle } from '@/types'

interface Props {
  modo: 'puzzle' | 'questao'
  tipo?: TipoPuzzle        // filtra por tipo de puzzle (opcional)
  className?: string
  children: React.ReactNode
}

export default function RandomButton({ modo, tipo, className, children }: Props) {
  const router = useRouter()

  function sortear() {
    if (modo === 'questao') {
      const q = allQuestoes[Math.floor(Math.random() * allQuestoes.length)]
      router.push(`/questoes/${q.id}`)
    } else {
      const pool = tipo
        ? allPuzzles.filter(p => (p.tipo ?? 'grade') === tipo)
        : allPuzzles
      const p = pool[Math.floor(Math.random() * pool.length)]
      router.push(`/puzzles/${p.id}`)
    }
  }

  return (
    <button onClick={sortear} className={className}>
      {children}
    </button>
  )
}
