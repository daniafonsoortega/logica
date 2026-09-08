// Helper central: grava resultado + avalia badges em um só passo
import { recordResult, GameResult } from './stats'
import { avaliarBadges, Badge }     from './badges'

export function recordAndBadge(result: GameResult): Badge[] {
  if (typeof window === 'undefined') return []
  const updatedStats = recordResult(result)
  return avaliarBadges(updatedStats, result)
}
