'use client'

import { useEffect, useState } from 'react'
import { getDailyStatus, setDailyStatus, getSecondsUntilMidnight, getTodayDateKey } from '@/lib/daily'

interface Props {
  date: string
  puzzleId: string
  children: React.ReactNode
}

function fmtCountdown(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function DailyChallengeWrapper({ date, puzzleId, children }: Props) {
  const [status,    setStatus]    = useState<'done' | 'started' | 'new'>('new')
  const [countdown, setCountdown] = useState<number>(0)
  const [isToday,   setIsToday]   = useState(true)

  useEffect(() => {
    setIsToday(getTodayDateKey() === date)
    setStatus(getDailyStatus(date))
    setCountdown(getSecondsUntilMidnight())

    // Marcar como 'started' ao entrar
    if (getDailyStatus(date) === 'new') {
      setDailyStatus('started', date)
      setStatus('started')
    }

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [date])

  function markDone() {
    setDailyStatus('done', date)
    setStatus('done')
  }

  return (
    <div className="space-y-4">
      {/* Completed banner */}
      {status === 'done' && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-bold text-green-800">Desafio Concluído!</p>
            <p className="text-xs text-green-600">
              {isToday
                ? `Próximo desafio em ${fmtCountdown(countdown)}`
                : 'Desafio anterior — já concluído'}
            </p>
          </div>
        </div>
      )}

      {/* Puzzle */}
      {children}

      {/* Mark done button — only if not already done */}
      {status !== 'done' && (
        <div className="flex justify-center pt-2">
          <button
            onClick={markDone}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors active:scale-95"
          >
            ✅ Marcar como Concluído
          </button>
        </div>
      )}

      {/* Countdown — only today and not done */}
      {isToday && status !== 'done' && countdown > 0 && (
        <p className="text-center text-xs text-gray-400">
          Próximo desafio em <span className="font-mono font-semibold">{fmtCountdown(countdown)}</span>
        </p>
      )}
    </div>
  )
}
