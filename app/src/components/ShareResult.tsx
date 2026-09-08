'use client'

// Botão de compartilhar resultado estilo Wordle
// Gera texto visual para WhatsApp / Twitter / clipboard

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

const TIPO_NOME: Record<string, string> = {
  grade:     'Desafio de Dedução',
  detetive:  'Caso do Detetive',
  sequencia: 'Desafio de Sequência',
  mentiu:    'Quem Mentiu?',
  codigo:    'Código Secreto',
  cifra:     'Cifra Simbólica',
  questao:   'Questão de Concurso',
}

const NIVEL_LABEL: Record<string, string> = {
  facil:   'Fácil',
  medio:   'Médio',
  dificil: 'Difícil',
  expert:  'Expert',
}

const NIVEL_EMOJI: Record<string, string> = {
  facil:   '🟢',
  medio:   '🟡',
  dificil: '🔴',
  expert:  '🟣',
}

interface Props {
  tipo: string
  tema: string
  acertou: boolean
  tempoSegundos: number
  semDicas: boolean
  nivel: string
  puzzleId?: string      // ex: "LP-042" → mostra #42
  dicasUsadas?: number   // número de dicas pedidas
}

function formatarTempo(s: number): string {
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`
}

function extrairNumero(id?: string): string {
  if (!id) return ''
  const match = id.match(/\d+$/)
  return match ? `#${parseInt(match[0], 10)}` : ''
}

export default function ShareResult({ tipo, tema, acertou, tempoSegundos, semDicas, nivel, puzzleId, dicasUsadas }: Props) {
  const [copiado, setCopiado] = useState(false)

  function gerarTexto(): string {
    const nomeDesafio = TIPO_NOME[tipo] ?? 'Desafio'
    const numStr      = extrairNumero(puzzleId)
    const nivelLabel  = NIVEL_LABEL[nivel] ?? nivel
    const nivelEmoji  = NIVEL_EMOJI[nivel] ?? '⚪'
    const tempo       = formatarTempo(tempoSegundos)

    // Calcular pistas usadas
    const dicas = dicasUsadas !== undefined ? dicasUsadas : (semDicas ? 0 : 1)

    const resultado = acertou
      ? `Resolvi o ${nomeDesafio}${numStr ? ` ${numStr}` : ''}!`
      : `Tentei o ${nomeDesafio}${numStr ? ` ${numStr}` : ''}...`

    const linhas = [
      `🧠 LogicaMente${numStr ? ` ${numStr}` : ''}`,
      resultado,
      '',
      `⏱️ Tempo: ${tempo}`,
      `💡 Pistas usadas: ${dicas}`,
      `🎯 Dificuldade: ${nivelEmoji} ${nivelLabel}`,
      '',
      acertou
        ? 'Será que você consegue ser mais rápido?'
        : 'Você conseguiria resolver?',
      '👉 logica-mente.vercel.app',
    ]

    return linhas.join('\n')
  }

  async function compartilhar() {
    const texto = gerarTexto()

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ text: texto })
        return
      } catch { /* usuário cancelou */ }
    }

    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = texto
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  return (
    <button
      onClick={compartilhar}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
    >
      {copiado
        ? <><Check size={14} className="text-green-500" /><span className="text-green-600">Copiado!</span></>
        : <><Share2 size={14} /> Compartilhar resultado</>
      }
    </button>
  )
}
