'use client'

import { useState } from 'react'

interface Props {
  puzzleId: string
  puzzleTema: string
  tempoSegundos?: number | null
  semDicas?: boolean
  className?: string
}

function fmtTempo(s: number): string {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return m > 0 ? `${m}m${String(ss).padStart(2,'0')}s` : `${ss}s`
}

export default function ShareButton({ puzzleId, puzzleTema, tempoSegundos, semDicas, className }: Props) {
  const [copied, setCopied] = useState(false)

  const url  = `https://logica-mente.vercel.app/puzzles/${puzzleId}`
  const time = tempoSegundos ? fmtTempo(tempoSegundos) : null
  const hint = semDicas ? ' sem dicas 🎯' : ''

  const text = time
    ? `Resolvi "${puzzleTema}"${hint} em ${time}! Consegues bater? 🧠\n${url}`
    : `Resolvi "${puzzleTema}"${hint} no LogicaMente! Tenta tu 🧠\n${url}`

  async function share() {
    // Web Share API (mobile nativo)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'LogicaMente', text, url })
        return
      } catch {
        // Cancelado pelo utilizador — não fazer nada
        return
      }
    }
    // Fallback: copiar para clipboard
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Último fallback: selecionar texto manualmente
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <button
      onClick={share}
      className={className ?? 'flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors active:scale-95'}
    >
      {copied ? (
        <><span>✅</span> Copiado!</>
      ) : (
        <><span>🔗</span> Partilhar resultado</>
      )}
    </button>
  )
}
