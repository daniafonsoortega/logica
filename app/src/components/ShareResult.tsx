'use client'

// Botão de compartilhar resultado estilo Wordle
// Gera texto visual para WhatsApp / Twitter / clipboard

import { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'

const TIPO_EMOJI: Record<string, string> = {
  grade:     '🔍',
  detetive:  '🕵️',
  sequencia: '📅',
  mentiu:    '🎭',
  codigo:    '🔐',
  cifra:     '🔤',
  questao:   '📝',
}

interface Props {
  tipo: string
  tema: string
  acertou: boolean
  tempoSegundos: number
  semDicas: boolean
  nivel: string
}

function formatarTempo(s: number): string {
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m${s % 60 > 0 ? String(s % 60).padStart(2,'0') + 's' : ''}`
}

function gerarEmojis(acertou: boolean, semDicas: boolean, nivel: string): string {
  const base = acertou ? '✅' : '❌'
  const dica = semDicas ? '💡' : ''
  const nv = { facil: '🟢', medio: '🟡', dificil: '🔴', expert: '🟣' }[nivel] ?? '⚪'
  return `${base}${nv}${dica}`
}

export default function ShareResult({ tipo, tema, acertou, tempoSegundos, semDicas, nivel }: Props) {
  const [copiado, setCopiado] = useState(false)

  function gerarTexto(): string {
    const emoji = TIPO_EMOJI[tipo] ?? '🧠'
    const emojis = gerarEmojis(acertou, semDicas, nivel)
    const tempo = formatarTempo(tempoSegundos)
    const resultado = acertou ? 'Resolvi' : 'Tentei'
    const dicas = semDicas ? ' sem dicas' : ''
    const nivel_label = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil', expert: 'Expert' }[nivel] ?? nivel

    return [
      `${emoji} LogicaMente ${emojis}`,
      `${resultado}: ${tema} (${nivel_label})${dicas}`,
      `⏱ ${tempo}`,
      `🧠 Treine você também → logica-mente.vercel.app`,
    ].join('\n')
  }

  async function compartilhar() {
    const texto = gerarTexto()

    // Tenta Web Share API (mobile nativo)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: texto })
        return
      } catch { /* usuário cancelou */ }
    }

    // Fallback: copia para clipboard
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // Último fallback: textarea temporária
      const ta = document.createElement('textarea')
      ta.value = texto
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    }
  }

  return (
    <button
      onClick={compartilhar}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all"
    >
      {copiado
        ? <><Check size={14} className="text-green-500" /> Copiado!</>
        : <><Share2 size={14} /> Compartilhar resultado</>
      }
    </button>
  )
}
