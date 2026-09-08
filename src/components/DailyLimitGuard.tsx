'use client'

// Guarda que exibe anúncio progressivo (não bloqueia).
// Primeiros 5 desafios: sem anúncio.
// 6–15: anúncio a cada 2.  16+: todo desafio.
// Premium: nunca vê anúncio.

import { useEffect, useState } from 'react'
import { incrementLifetimeCount, incrementCount, shouldShowAd, isPremium } from '@/lib/freemium'
import AdInterstitial from './AdInterstitial'

interface Props { children: React.ReactNode }

type Phase = 'loading' | 'ad' | 'play'

export default function DailyLimitGuard({ children }: Props) {
  const [phase, setPhase] = useState<Phase>('loading')

  useEffect(() => {
    if (isPremium()) {
      incrementCount()
      setPhase('play')
      return
    }
    const total = incrementLifetimeCount()
    incrementCount()
    setPhase(shouldShowAd(total) ? 'ad' : 'play')
  }, [])

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-400 animate-pulse text-sm">Carregando…</p>
      </div>
    )
  }

  if (phase === 'ad') {
    return <AdInterstitial onContinue={() => setPhase('play')} />
  }

  return <>{children}</>
}
