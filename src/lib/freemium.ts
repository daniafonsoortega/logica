// ── Modelo freemium baseado em anúncios progressivos ─────────────
// Premium: sem anúncios, sem limite
// Free: primeiros 5 desafios livres; depois anúncio crescente
//
// LÓGICA DE ANÚNCIO (por desafio completado, lifetime):
//   1–5    → sem anúncio
//   6–15   → anúncio a cada 2 desafios (6, 8, 10, 12, 14, ...)
//   16+    → anúncio em todo desafio

export const FREE_DAILY_LIMIT = 9999  // sem limite hard; mantido só pra não quebrar tipos

// ── Premium ───────────────────────────────────────────────────────
export function isPremium(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('lm_premium') === 'true'
}

// ── Lifetime count (total de desafios completados) ────────────────
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

// ── Daily count (mantido para DailyCounter no nav) ────────────────
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

// ── Decide se exibe anúncio após o N-ésimo desafio ────────────────
// completedCount = total APÓS esta conclusão (já incrementado)
export function shouldShowAd(completedCount: number): boolean {
  if (isPremium()) return false
  if (completedCount <= 5) return false           // grace period
  if (completedCount <= 15) return completedCount % 2 === 0  // cada 2
  return true                                      // todo desafio
}

// Mantidos para compatibilidade com componentes existentes
export function canPlay(): boolean { return true }
export function getRemainingToday(): number { return 9999 }
