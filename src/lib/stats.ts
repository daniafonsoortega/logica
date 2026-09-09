// Tracking de desempenho pessoal (localStorage)
// Futuro: sincroniza com Supabase para ranking global

const STATS_KEY = 'lm_stats'

export interface GameResult {
  id: string
  tipo: 'puzzle' | 'questao'
  resolvido: boolean
  dicasUsadas: number
  tempoSegundos: number
  semDicas: boolean
  primeiraVez: boolean
  dataISO: string
}

export interface GlobalStats {
  totalResolvidos: number
  totalSemDicas: number
  totalPuzzles: number
  totalQuestoes: number
  melhorSequencia: number
  sequenciaAtual: number
  pontuacao: number
  historico: GameResult[]
}

const DEFAULT: GlobalStats = {
  totalResolvidos: 0,
  totalSemDicas: 0,
  totalPuzzles: 0,
  totalQuestoes: 0,
  melhorSequencia: 0,
  sequenciaAtual: 0,
  pontuacao: 0,
  historico: [],
}

export function getStats(): GlobalStats {
  if (typeof window === 'undefined') return DEFAULT
  const raw = localStorage.getItem(STATS_KEY)
  if (!raw) return DEFAULT
  try {
    return { ...DEFAULT, ...JSON.parse(raw) }
  } catch {
    return DEFAULT
  }
}

export function calcPontos(r: GameResult): number {
  if (!r.resolvido) return 0
  let pts = 100
  if (r.semDicas) pts += 50
  if (r.tempoSegundos < 120) pts += 25  // menos de 2 min
  return pts
}

export function recordResult(result: GameResult): void {
  const stats = getStats()
  stats.historico.unshift(result)
  if (stats.historico.length > 1000) stats.historico = stats.historico.slice(0, 1000)

  if (result.resolvido) {
    stats.totalResolvidos++
    if (result.tipo === 'puzzle') stats.totalPuzzles++
    else stats.totalQuestoes++
    if (result.semDicas) stats.totalSemDicas++
    stats.sequenciaAtual++
    if (stats.sequenciaAtual > stats.melhorSequencia)
      stats.melhorSequencia = stats.sequenciaAtual
    stats.pontuacao += calcPontos(result)
  } else {
    stats.sequenciaAtual = 0
  }

  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function getTier(pontuacao: number): { label: string; cor: string } {
  if (pontuacao >= 5000) return { label: 'Expert',        cor: 'text-purple-700 bg-purple-100' }
  if (pontuacao >= 2000) return { label: 'Avançado',      cor: 'text-blue-700   bg-blue-100'   }
  if (pontuacao >= 500)  return { label: 'Intermediário', cor: 'text-yellow-700 bg-yellow-100' }
  return                        { label: 'Iniciante',     cor: 'text-green-700  bg-green-100'  }
}


// ── Personal best times (per puzzle) ─────────────────────────────
const BEST_KEY = 'lm_best_times'

export function getBestTime(puzzleId: string): number | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(BEST_KEY)
  if (!raw) return null
  try { return (JSON.parse(raw) as Record<string, number>)[puzzleId] ?? null }
  catch { return null }
}

export function updateBestTime(puzzleId: string, seconds: number): boolean {
  // Returns true if this is a new personal best
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(BEST_KEY)
  let store: Record<string, number> = {}
  try { if (raw) store = JSON.parse(raw) } catch {}
  const prev = store[puzzleId]
  if (prev === undefined || seconds < prev) {
    store[puzzleId] = seconds
    localStorage.setItem(BEST_KEY, JSON.stringify(store))
    return true
  }
  return false
}

export function getAllBestTimes(): Array<{ id: string; seconds: number }> {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(BEST_KEY)
  if (!raw) return []
  try {
    const store = JSON.parse(raw) as Record<string, number>
    return Object.entries(store)
      .map(([id, seconds]) => ({ id, seconds }))
      .sort((a, b) => a.seconds - b.seconds)
  } catch { return [] }
}
