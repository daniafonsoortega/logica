'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface Props {
  id: string
  tipo: 'puzzle' | 'questao'
}

export default function FeedbackButtons({ id, tipo }: Props) {
  const key = `feedback-${tipo}-${id}`
  const [voto, setVoto] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    const salvo = localStorage.getItem(key) as 'up' | 'down' | null
    setVoto(salvo)
  }, [key])

  const votar = (valor: 'up' | 'down') => {
    const novo = voto === valor ? null : valor
    if (novo) localStorage.setItem(key, novo)
    else localStorage.removeItem(key)
    setVoto(novo)
  }

  return (
    <div className="flex items-center gap-3 text-sm text-gray-400">
      <span>Este desafio foi útil?</span>
      <button
        onClick={() => votar('up')}
        aria-label="Gostei"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
          voto === 'up'
            ? 'border-green-400 bg-green-50 text-green-700'
            : 'border-gray-200 hover:border-green-300 hover:text-green-600'
        }`}
      >
        <ThumbsUp size={15} />
        <span>Sim</span>
      </button>
      <button
        onClick={() => votar('down')}
        aria-label="Não gostei"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
          voto === 'down'
            ? 'border-red-400 bg-red-50 text-red-700'
            : 'border-gray-200 hover:border-red-300 hover:text-red-600'
        }`}
      >
        <ThumbsDown size={15} />
        <span>Não</span>
      </button>
      {voto && (
        <span className="text-xs text-gray-400 italic">Obrigada pelo feedback!</span>
      )}
    </div>
  )
}
