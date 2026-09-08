'use client'

import RandomButton from '@/components/RandomButton'

const NIVEIS = [
  { key: 'facil',   label: 'Fácil',   emoji: '🟢', desc: '131 puzzles', bg: 'bg-green-50  border-green-200  text-green-800  hover:bg-green-100' },
  { key: 'medio',   label: 'Médio',   emoji: '🟡', desc: '161 puzzles', bg: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100' },
  { key: 'dificil', label: 'Difícil', emoji: '🔴', desc: '136 puzzles', bg: 'bg-red-50    border-red-200    text-red-800    hover:bg-red-100'    },
  { key: 'expert',  label: 'Expert',  emoji: '🟣', desc: '62 puzzles',  bg: 'bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100' },
]

const TIPOS = [
  { key: 'grade',    label: 'Grade Einstein', emoji: '🔍' },
  { key: 'detetive', label: 'Detetive',       emoji: '🕵️' },
  { key: 'sequencia',label: 'Sequência',      emoji: '📅' },
  { key: 'mentiu',   label: 'Quem Mentiu?',   emoji: '🎭' },
  { key: 'codigo',   label: 'Código Secreto', emoji: '🔐' },
  { key: 'cifra',    label: 'Cifra Simbólica',emoji: '🔤' },
]

export default function PuzzlesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900">🧩 Escolha o Desafio</h1>
        <p className="text-gray-500">Sorteia aleatório ou filtra por nível e tipo</p>
      </div>

      {/* Aleatório total */}
      <RandomButton
        modo="puzzle"
        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 active:scale-[0.98] transition-all shadow-md"
      >
        🎲 Sortear completamente aleatório
      </RandomButton>

      {/* Por nível */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Por nível de dificuldade</h2>
        <div className="grid grid-cols-2 gap-3">
          {NIVEIS.map(({ key, label, emoji, desc, bg }) => (
            <RandomButton
              key={key}
              modo="puzzle"
              nivel={key}
              className={`flex flex-col items-center gap-1 py-4 px-3 rounded-2xl border-2 font-semibold transition-all active:scale-95 ${bg}`}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-base font-bold">{label}</span>
              <span className="text-xs opacity-70">{desc}</span>
            </RandomButton>
          ))}
        </div>
      </div>

      {/* Por tipo */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Por tipo de puzzle</h2>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map(({ key, label, emoji }) => (
            <RandomButton
              key={key}
              modo="puzzle"
              tipo={key as any}
              className="flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 transition-all"
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </RandomButton>
          ))}
        </div>
      </div>

    </div>
  )
}
