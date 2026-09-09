'use client'

import { useEffect, useState } from 'react'
import { getAchievements, type Achievement } from '@/lib/achievements'

export default function AchievementsBadges() {
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    setAchievements(getAchievements())
  }, [])

  const desbloqueados = achievements.filter(a => a.desbloqueado)
  const bloqueados    = achievements.filter(a => !a.desbloqueado)

  if (achievements.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Conquistas</h3>
        <span className="text-sm text-gray-400">{desbloqueados.length}/{achievements.length}</span>
      </div>

      {/* Desbloqueados */}
      {desbloqueados.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {desbloqueados.map(a => (
            <div key={a.id} className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-center space-y-1">
              <div className="text-3xl">{a.emoji}</div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300">{a.titulo}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">{a.descricao}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bloqueados */}
      {bloqueados.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {bloqueados.map(a => (
            <div key={a.id} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-center space-y-1 opacity-50">
              <div className="text-3xl grayscale">🔒</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">{a.titulo}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{a.descricao}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
