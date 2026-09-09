'use client'
import { useEffect, useState } from 'react'
import { getStats } from '@/lib/stats'
import { X } from 'lucide-react'

const REVIEW_KEY = 'lm_review_shown'

export default function ReviewPrompt() {
  const [open, setOpen]   = useState(false)
  const [stars, setStars] = useState(0)
  const [done, setDone]   = useState(false)

  useEffect(() => {
    function check() {
      if (localStorage.getItem(REVIEW_KEY)) return
      const stats = getStats()
      if (stats.totalPuzzles >= 5) setOpen(true)
    }
    window.addEventListener('lm_puzzle_solved', check)
    check()
    return () => window.removeEventListener('lm_puzzle_solved', check)
  }, [])

  function handleStars(n: number) {
    setStars(n)
    localStorage.setItem(REVIEW_KEY, '1')
    setDone(true)
  }

  function handleClose() {
    localStorage.setItem(REVIEW_KEY, '1')
    setOpen(false)
  }

  if (!open) return null

  const url  = 'https://logica-mente.vercel.app'
  const text = 'Estou treinando raciocínio lógico no LogicaMente! 🧠 Experimenta:'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {!done ? (
          <>
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🧠</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Está gostando do LogicaMente?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Você já resolveu 5 puzzles! O que está achando?
              </p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-3 my-5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => handleStars(n)}
                  onMouseEnter={() => setStars(n)}
                  onMouseLeave={() => setStars(0)}
                  className="text-4xl transition-transform hover:scale-125 active:scale-110"
                  aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
                >
                  {n <= stars ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-400">Toque numa estrela para avaliar</p>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{stars >= 4 ? '🎉' : '🙏'}</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {stars >= 4 ? 'Que ótimo!' : 'Obrigado pelo feedback!'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stars >= 4
                  ? 'Recomende para um amigo que gosta de lógica!'
                  : 'Estamos sempre a melhorar para você!'}
              </p>
            </div>

            {stars >= 4 && (
              <div className="flex flex-col gap-2 mt-4">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
                >
                  📲 Compartilhar no WhatsApp
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(url)
                    setOpen(false)
                  }}
                  className="flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  🔗 Copiar link
                </button>
              </div>
            )}

            {stars < 4 && (
              <button
                onClick={() => setOpen(false)}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-semibold transition-colors"
              >
                Continuar jogando
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
