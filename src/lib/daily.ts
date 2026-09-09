// Daily Challenge — localStorage helpers
// Key: lm_daily (object stored as JSON)
// Shape: { [YYYY-MM-DD]: 'done' | 'started' }

export function getTodayDateKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getDailyStatus(date?: string): 'done' | 'started' | 'new' {
  if (typeof window === 'undefined') return 'new'
  const key = date ?? getTodayDateKey()
  const raw = localStorage.getItem('lm_daily')
  if (!raw) return 'new'
  try {
    const store = JSON.parse(raw) as Record<string, string>
    return (store[key] as 'done' | 'started') ?? 'new'
  } catch { return 'new' }
}

export function setDailyStatus(status: 'done' | 'started', date?: string): void {
  if (typeof window === 'undefined') return
  const key = date ?? getTodayDateKey()
  const raw = localStorage.getItem('lm_daily')
  let store: Record<string, string> = {}
  try { if (raw) store = JSON.parse(raw) } catch {}
  store[key] = status
  // Keep only last 7 days to avoid unbounded growth
  const keys = Object.keys(store).sort().slice(-7)
  const trimmed: Record<string, string> = {}
  keys.forEach(k => { trimmed[k] = store[k] })
  localStorage.setItem('lm_daily', JSON.stringify(trimmed))
}

export function getSecondsUntilMidnight(): number {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  return Math.floor((midnight.getTime() - now.getTime()) / 1000)
}
