'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'lm_onboarded'

const STEPS = [
  {
    emoji: '🧠',
    title: 'Bem-vindo ao MalhaMente!',
    desc: 'O lugar para treinar o seu raciocínio lógico todos os dias — puzzles de dedução, sequências, códigos e muito mais.',
  },
  {
    emoji: '🎲',
    title: 'Escolha o seu desafio',
    desc: 'Sorteie um puzzle aleatório, escolha o nível de dificuldade, ou tente as questões reais de concursos públicos.',
  },
  {
    emoji: '🏆',
    title: 'Desafio diário',
    desc: 'Todos os dias há um puzzle novo. Complete-o e construa a sua sequência de dias consecutivos 🔥',
  },
  {
    emoji: '⏱️',
    title: 'Bata o seu recorde',
    desc: 'Cada puzzle tem um cronômetro. Resolva sem dicas para ganhar pontos extra e subir no ranking.',
  },
]

export default function OnboardingModal() {
  const [visible, setVisible] = useState(false)
  const [step,    setStep]    = useState(0)

  useEffect(() => {
    // Só mostra na primeira visita
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true)
    }
  }, [])

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else finish()
  }

  if (!visible) return null

  const s = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={finish}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-sm w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">

        {/* Botão fechar */}
        <button
          onClick={finish}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
          aria-label="Fechar"
        >
          ×
        </button>

        {/* Conteúdo do step */}
        <div className="text-center space-y-4">
          <div className="text-6xl">{s.emoji}</div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{s.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
        </div>

        {/* Indicadores de step */}
        <div className="flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-6 bg-blue-600'
                  : 'w-1.5 bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          {!isLast && (
            <button
              onClick={finish}
              className="flex-1 py-2.5 rounded-xl text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Saltar
            </button>
          )}
          {isLast ? (
            <Link
              href="/desafio-diario"
              onClick={finish}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-center transition-colors active:scale-95"
            >
              Começar 🚀
            </Link>
          ) : (
            <button
              onClick={next}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors active:scale-95"
            >
              Próximo →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
