// Definição e cálculo de achievements
// Baseado em stats do localStorage (sem necessitar de servidor)

import { getStats } from './stats'
import { getDailyStatus } from './daily'

export interface Achievement {
  id:          string
  emoji:       string
  titulo:      string
  descricao:   string
  desbloqueado: boolean
}

export function getAchievements(): Achievement[] {
  const stats = getStats()

  // Calcular streak de dias consecutivos (via localStorage lm_daily)
  function calcStreakDias(): number {
    if (typeof window === 'undefined') return 0
    const raw = localStorage.getItem('lm_daily')
    if (!raw) return 0
    try {
      const store = JSON.parse(raw) as Record<string, string>
      const today = new Date()
      let streak = 0
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        if (store[key] === 'done') streak++
        else if (i > 0) break  // só quebra depois do primeiro dia
      }
      return streak
    } catch { return 0 }
  }

  const streak = calcStreakDias()

  return [
    {
      id: 'primeiro_puzzle',
      emoji: '🎯',
      titulo: 'Primeiro Passo',
      descricao: 'Resolva o primeiro puzzle',
      desbloqueado: stats.totalResolvidos >= 1,
    },
    {
      id: 'sem_dicas',
      emoji: '🧠',
      titulo: 'Mente Pura',
      descricao: 'Resolva um puzzle sem usar dicas',
      desbloqueado: stats.totalSemDicas >= 1,
    },
    {
      id: '10_puzzles',
      emoji: '🔟',
      titulo: 'Veterano',
      descricao: 'Resolva 10 puzzles',
      desbloqueado: stats.totalResolvidos >= 10,
    },
    {
      id: '50_puzzles',
      emoji: '🏅',
      titulo: 'Meio Centenário',
      descricao: 'Resolva 50 puzzles',
      desbloqueado: stats.totalResolvidos >= 50,
    },
    {
      id: 'streak_3',
      emoji: '🔥',
      titulo: 'Em Chamas',
      descricao: '3 dias seguidos no desafio diário',
      desbloqueado: streak >= 3,
    },
    {
      id: 'streak_7',
      emoji: '🔥🔥',
      titulo: 'Semana Perfeita',
      descricao: '7 dias seguidos no desafio diário',
      desbloqueado: streak >= 7,
    },
    {
      id: 'streak_30',
      emoji: '🏆',
      titulo: 'Lenda',
      descricao: '30 dias seguidos no desafio diário',
      desbloqueado: streak >= 30,
    },
    {
      id: 'velocista',
      emoji: '⚡',
      titulo: 'Velocista',
      descricao: 'Resolva um puzzle em menos de 1 minuto',
      desbloqueado: stats.historico.some(r => r.resolvido && r.tempoSegundos < 60),
    },
    {
      id: 'expert',
      emoji: '🟣',
      titulo: 'Expert',
      descricao: 'Resolva um puzzle de nível Expert',
      desbloqueado: false, // seria necessário guardar o nível em GameResult — futuro
    },
    {
      id: 'pontuacao_1000',
      emoji: '💎',
      titulo: 'Mil Pontos',
      descricao: 'Acumule 1000 pontos',
      desbloqueado: stats.pontuacao >= 1000,
    },
  ]
}
