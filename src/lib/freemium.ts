// Modelo freemium baseado em anúncios progressivos

export const FREE_DAILY_LIMIT = 9999

// isPremium: lê localStorage (rápido) — sincronizado pelo PremiumSync
export function isPremium(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('lm_premium') === 'true'
}

// Verificar premium no Supabase e sincronizar localStorage
// Chamar uma vez no app load (ex: layout ou AuthButton)
export async function syncPremiumStatus(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('profiles')
      .select('is_premium, premium_until')
      .eq('id', userId)
      .single()

    if (!data) return false

    const active = data.is_premium === true &&
      (!data.premium_until || new Date(data.premium_until) > new Date())

    if (active) {
      localStorage.setItem('lm_premium', 'true')
    } else {
      localStorage.removeItem('lm_premium')
    }
    return active
  } catch {
    return isPremium() // fallback para localStorage
  }
}

export function getLifetimeCount(): number {
  if (typeof window === 'undefined') return 0
  return parseInt(localStorage.getItem('lm_lifetime') ?? '0', 10)
}

export function incrementLifetimeCount(): number {
  if (typeof window === 'undefined') return 0
  const next = getLifetimeCount() + 1
  localStorage.setItem('lm_lifetime', String(next))
  return next
}

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

export function shouldShowAd(completedCount: number): boolean {
  if (isPremium()) return false
  if (completedCount <= 5) return false
  if (completedCount <= 15) return completedCount % 2 === 0
  return true
}

export function canPlay(): boolean { return true }
export function getRemainingToday(): number { return 9999 }
