'use client'

import { useEffect, useState } from 'react'
import { getRemainingToday, isPremium, FREE_DAILY_LIMIT } from '@/lib/freemium'
import PaywallModal from './PaywallModal'

export default function DailyCounter() {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [premium, setPremium]     = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    setPremium(isPremium())
    setRemaining(getRemainingToday())
  }, [])

  if (remaining === null || premium) return null

  return (
    <>
      <button
        onClick={() => remaining === 0 && setShowPaywall(true)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
          remaining === 0
            ? 'border-red-300 bg-red-50 text-red-700 cursor-pointer hover:bg-red-100'
            : remaining <= 2
            ? 'border-yellow-300 bg-yellow-50 text-yellow-700'
            : 'border-gray-200 bg-gray-50 text-gray-500'
        }`}
        title={remaining === 0 ? 'Limite diário atingido — clique para ver Premium' : `${remaining} de ${FREE_DAILY_LIMIT} desafios restantes hoje`}
      >
        <span>{remaining === 0 ? '🔒' : '🎯'}</span>
        <span>{remaining === 0 ? 'Limite atingido' : `${remaining}/${FREE_DAILY_LIMIT} hoje`}</span>
      </button>

      {showPaywall && <PaywallModal reason="daily_limit" onClose={() => setShowPaywall(false)} />}
    </>
  )
}
