'use client'

import { useEffect, useState } from 'react'
import { canPlay, incrementCount } from '@/lib/freemium'
import PaywallModal from './PaywallModal'

interface Props {
  children: React.ReactNode
}

export default function DailyLimitGuard({ children }: Props) {
  // null = ainda hidratando | true = pode jogar | false = bloqueado
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    if (canPlay()) {
      incrementCount()
      setAllowed(true)
    } else {
      setAllowed(false)
    }
  }, [])

  if (allowed === null) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-400 animate-pulse text-sm">Carregando…</p>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <PaywallModal reason="daily_limit" />
      </div>
    )
  }

  return <>{children}</>
}
