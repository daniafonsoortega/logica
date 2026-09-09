'use client'

import { useRouter } from 'next/navigation'
import { allPuzzles } from '@/lib/data'

const NIVEL_ORDER = ['facil', 'medio', 'dificil', 'expert']

interface Props {
  currentId:    string
  currentNivel?: string
  currentTipo?:  string
}

export default function ProximoPuzzle({ currentId, currentNivel, currentTipo }: Props) {
  const router = useRouter()

  function handleNext() {
    const outros = allPuzzles.filter(p => p.id !== currentId)
    if (!outros.length) return

    // Tenta sugerir um puzzle progressivo:
    // 1. Mesmo tipo, nível igual ou superior
    // 2. Qualquer tipo, nível igual
    // 3. Aleatório
    let candidatos = outros

    if (currentNivel && currentTipo) {
      const idxAtual  = NIVEL_ORDER.indexOf(currentNivel)
      const proxNivel = NIVEL_ORDER[Math.min(idxAtual + 1, NIVEL_ORDER.length - 1)]

      // Prioridade 1: mesmo tipo, nível superior
      const mesmaTipo_proxNivel = outros.filter(p => p.tipo === currentTipo && p.nivel === proxNivel)
      if (mesmaTipo_proxNivel.length > 0) {
        candidatos = mesmaTipo_proxNivel
      } else {
        // Prioridade 2: qualquer tipo, mesmo nível ou superior
        const mesmoOuSuperior = outros.filter(p => {
          const idx = NIVEL_ORDER.indexOf(p.nivel)
          return idx >= NIVEL_ORDER.indexOf(currentNivel)
        })
        if (mesmoOuSuperior.length > 0) candidatos = mesmoOuSuperior
      }
    }

    const next = candidatos[Math.floor(Math.random() * candidatos.length)]
    router.push(`/puzzles/${next.id}`)
  }

  const nivelLabel: Record<string, string> = {
    facil: 'fácil', medio: 'médio', dificil: 'difícil', expert: 'expert'
  }
  const proxNivel = currentNivel
    ? NIVEL_ORDER[Math.min(NIVEL_ORDER.indexOf(currentNivel) + 1, NIVEL_ORDER.length - 1)]
    : null

  return (
    <button
      onClick={handleNext}
      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-95"
    >
      <span>Próximo puzzle</span>
      {proxNivel && proxNivel !== currentNivel && (
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
          ↑ {nivelLabel[proxNivel]}
        </span>
      )}
      <span>→</span>
    </button>
  )
}
