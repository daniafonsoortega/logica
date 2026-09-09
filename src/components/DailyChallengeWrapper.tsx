'use client'

import { useEffect, useState } from 'react'
import { getDailyStatus, setDailyStatus, getSecondsUntilMidnight, getTodayDateKey } from '@/lib/daily'
import { createClient } from '@/lib/supabase-browser'

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

// Atualiza streak na tabela profiles (chamado ao completar o desafio)
async function syncStreakToSupabase(): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return  // utilizador não autenticado — localStorage apenas

    const today = new Date().toISOString().slice(0, 10)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_atual, streak_max, ultima_atividade, desafios_completos')
      .eq('id', user.id)
      .single()

    // Se já foi registado hoje, não duplicar
    if (profile?.ultima_atividade === today) return

    let streakAtual = 1
    if (profile?.ultima_atividade === yesterdayStr) {
      // Dia consecutivo — incrementa streak
      streakAtual = (profile.streak_atual ?? 0) + 1
    }
    // Se última atividade foi há mais de 1 dia, streak reinicia a 1

    const streakMax  = Math.max(streakAtual, profile?.streak_max ?? 0)
    const desafios   = (profile?.desafios_completos ?? 0) + 1

    await supabase.from('profiles').upsert({
      id:                  user.id,
      streak_atual:        streakAtual,
      streak_max:          streakMax,
      ultima_atividade:    today,
      desafios_completos:  desafios,
    })
  } catch {
    // Falha silenciosa — não quebrar a UI se a sincronização falhar
  }
}

export default function DailyChallengeWrapper({ date, puzzleId, children }: Props) {
  const [status,    setStatus]    = useState<'done' | 'started' | 'new'>('new')
  const [countdown, setCountdown] = useState<number>(0)
  const [isToday,   setIsToday]   = useState(true)
  const [streak,    setStreak]    = useState<number | null>(null)

  useEffect(() => {
    setIsToday(getTodayDateKey() === date)
    setStatus(getDailyStatus(date))
    setCountdown(getSecondsUntilMidnight())

    // Marcar como 'started' ao entrar
    if (getDailyStatus(date) === 'new') {
      setDailyStatus('started', date)
      setStatus('started')
    }

    // Mostrar streak atual (se autenticado)
    async function loadStreak() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('profiles')
          .select('streak_atual')
          .eq('id', user.id)
          .single()
        if (data) setStreak(data.streak_atual ?? 0)
      } catch { /* silencioso */ }
    }
    loadStreak()

    const timer = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [date])

  async function markDone() {
    setDailyStatus('done', date)
    setStatus('done')
    // Sincroniza streak com Supabase em background
    syncStreakToSupabase().then(() => {
      // Recarregar streak após sync
      createClient().auth.getUser().then(({ data: { user } }) => {
        if (!user) return
        createClient()
          .from('profiles')
          .select('streak_atual')
          .eq('id', user.id)
          .single()
          .then(({ data }) => { if (data) setStreak(data.streak_atual ?? 0) })
      })
    })
  }

  const streakDays = streak !== null && streak > 0 ? streak : null

  return (
    <div className="space-y-4">
      {/* Completed banner */}
      {status === 'done' && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
          <span className="text-2xl">🏆</span>
          <div className="flex-1">
            <p className="font-bold text-green-800 dark:text-green-300">Desafio Concluído!</p>
            <p className="text-xs text-green-600 dark:text-green-400">
              {isToday
                ? `Próximo desafio em ${fmtCountdown(countdown)}`
                : 'Desafio anterior — já concluído'}
            </p>
          </div>
          {/* Streak badge — só se autenticado e streak > 0 */}
          {streakDays !== null && (
            <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-bold">
              🔥 {streakDays} {streakDays === 1 ? 'dia' : 'dias'}
            </div>
          )}
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
