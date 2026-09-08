'use client'

// Contador de desafios de hoje — mostrado no nav para usuários free.
// Com o modelo de anúncios não há mais limite hard, então só mostra
// um ícone de chama com quantos desafios fizeram hoje (motivacional).

import { useEffect, useState } from 'react'
import { getTodayCount, isPremium } from '@/lib/freemium'

export default function DailyCounter() {
  const [count,   setCount]   = useState<number | null>(null)
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    setPremium(isPremium())
    setCount(getTodayCount())
  }, [])

  // Premium não precisa ver contador
  if (premium || count === null || count === 0) return null

  return (
    <span
      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-600"
      title={`${count} desafio${count !== 1 ? 's' : ''} hoje`}
    >
      🔥 {count}
    </span>
  )
}
