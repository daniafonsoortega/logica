'use client'

import { useRouter } from 'next/navigation'
import { allQuestoes } from '@/lib/data'

const NIVEL_ORDER = ['facil', 'medio', 'dificil', 'expert']

interface Props {
  currentId:    string
  currentNivel?: string
  currentBanca?: string
}

export default function ProximaQuestao({ currentId, currentNivel, currentBanca }: Props) {
  const router = useRouter()

  function handleNext() {
    const outras = allQuestoes.filter(q => q.id !== currentId)
    if (!outras.length) return

    let candidatos = outras

    if (currentNivel) {
      const idxAtual  = NIVEL_ORDER.indexOf(currentNivel)
      const proxNivel = NIVEL_ORDER[Math.min(idxAtual + 1, NIVEL_ORDER.length - 1)]

      // Prioridade 1: mesma banca, nível superior
      const mesmaBanca_proxNivel = outras.filter(q => q.banca === currentBanca && q.nivel === proxNivel)
      if (mesmaBanca_proxNivel.length > 0) {
        candidatos = mesmaBanca_proxNivel
      } else {
        // Prioridade 2: qualquer banca, mesmo nível ou superior
        const mesmoOuSuperior = outras.filter(q => NIVEL_ORDER.indexOf(q.nivel) >= NIVEL_ORDER.indexOf(currentNivel))
        if (mesmoOuSuperior.length > 0) candidatos = mesmoOuSuperior
      }
    }

    const next = candidatos[Math.floor(Math.random() * candidatos.length)]
    router.push(`/questoes/${next.id}`)
  }

  const nivelLabel: Record<string, string> = { facil: 'fácil', medio: 'médio', dificil: 'difícil', expert: 'expert' }
  const proxNivel = currentNivel
    ? NIVEL_ORDER[Math.min(NIVEL_ORDER.indexOf(currentNivel) + 1, NIVEL_ORDER.length - 1)]
    : null

  return (
    <button onClick={handleNext}
      className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors active:scale-95">
      <span>Próxima questão</span>
      {proxNivel && proxNivel !== currentNivel && (
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">↑ {nivelLabel[proxNivel]}</span>
      )}
      <span>→</span>
    </button>
  )
}
