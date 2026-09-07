// Controla o limite diário e status premium
// Premium: por ora via localStorage (lm_premium=true)
// Futuro: verificado via Supabase/Stripe

export const FREE_DAILY_LIMIT = 5

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function getTodayCount(): number {
  if (typeof window === 'undefined') return 0
  const today = getTodayKey()
  if (localStorage.getItem('lm_date') !== today) {
    localStorage.setItem('lm_date', today)
    localStorage.setItem('lm_count', '0')
    return 0
  }
  return parseInt(localStorage.getItem('lm_count') ?? '0', 10)
}

export function incrementCount(): void {
  if (typeof window === 'undefined') return
  const today = getTodayKey()
  if (localStorage.getItem('lm_date') !== today) {
    localStorage.setItem('lm_date', today)
    localStorage.setItem('lm_count', '1')
    return
  }
  const count = parseInt(localStorage.getItem('lm_count') ?? '0', 10)
  localStorage.setItem('lm_count', String(count + 1))
}

export function isPremium(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('lm_premium') === 'true'
}

export function canPlay(): boolean {
  return isPremium() || getTodayCount() < FREE_DAILY_LIMIT
}

export function getRemainingToday(): number {
  if (isPremium()) return 999
  return Math.max(0, FREE_DAILY_LIMIT - getTodayCount())
}
