'use client'
// Notificação de conquista desbloqueada — aparece no canto superior direito

import { useEffect, useState } from 'react'
import type { Badge } from '@/lib/badges'

interface Props {
  badges: Badge[]
  onDone?: () => void
}

export default function BadgeNotification({ badges, onDone }: Props) {
  const [visivel, setVisivel] = useState(0) // índice atual
  const [saindo, setSaindo]   = useState(false)

  useEffect(() => {
    if (badges.length === 0) return
    setVisivel(0)
    setSaindo(false)
  }, [badges])

  useEffect(() => {
    if (badges.length === 0 || visivel >= badges.length) return
    const t1 = setTimeout(() => setSaindo(true), 3200)
    const t2 = setTimeout(() => {
      setSaindo(false)
      if (visivel + 1 >= badges.length) { onDone?.() }
      else setVisivel(v => v + 1)
    }, 3700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [visivel, badges.length])

  if (badges.length === 0 || visivel >= badges.length) return null
  const badge = badges[visivel]

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-500 ${saindo ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
      <div className="bg-white border-2 border-yellow-300 rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3 max-w-xs animate-bounce-once">
        <div className="text-3xl shrink-0">{badge.emoji}</div>
        <div>
          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Conquista desbloqueada!</p>
          <p className="font-bold text-gray-900">{badge.titulo}</p>
          <p className="text-xs text-gray-500">{badge.descricao}</p>
        </div>
      </div>
    </div>
  )
}
