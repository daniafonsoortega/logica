import Link from 'next/link'
import { allPuzzles, allQuestoes, NIVEL_LABELS } from '@/lib/data'

export default function Home() {
  const puzzleStats = {
    facil:   allPuzzles.filter(p => p.nivel === 'facil').length,
    medio:   allPuzzles.filter(p => p.nivel === 'medio').length,
    dificil: allPuzzles.filter(p => p.nivel === 'dificil').length,
    expert:  allPuzzles.filter(p => p.nivel === 'expert').length,
  }
  const questaoStats = {
    total:  allQuestoes.length,
    bancas: [...new Set(allQuestoes.map(q => q.banca))].length,
  }

  return (
    <div className="space-y-12">
      <section className="text-center py-16 space-y-4">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Treine seu <span className="text-blue-600">raciocínio lógico</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Dois modos de treino: puzzles dedutivos estilo Einstein e questões reais de concursos públicos.
          Progressão por nível, explicações detalhadas.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/puzzles" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg">
            Jogar Puzzles
          </Link>
          <Link href="/questoes" className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-lg">
            Questões de Concurso
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4 hover:shadow-md transition-shadow">
          <div className="text-4xl">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900">Puzzles Lógicos</h2>
          <p className="text-gray-500">
            Resolva sequências dedutivas estilo Einstein Puzzle. Você recebe pistas e precisa
            descobrir a combinação exata de atributos para cada posição. Treina raciocínio por
            eliminação e lógica relacional.
          </p>
          <div className="grid grid-cols-4 gap-2 pt-2">
            {(['facil','medio','dificil','expert'] as const).map(n => (
              <div key={n} className={`rounded-lg p-2 text-center text-xs font-semibold nivel-${n}`}>
                <div className="text-lg font-black">
                  {puzzleStats[n]}
                </div>
                <div>{NIVEL_LABELS[n]}</div>
              </div>
            ))}
          </div>
          <Link href="/puzzles" className="block text-center bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Começar →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4 hover:shadow-md transition-shadow">
          <div className="text-4xl">📝</div>
          <h2 className="text-2xl font-bold text-gray-900">Questões de Concurso</h2>
          <p className="text-gray-500">
            Questões reais de provas das principais bancas brasileiras. Quando errar, você escolhe:
            tentar de novo ou ver a explicação completa com o raciocínio passo a passo.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Total de questões</span>
              <span className="font-bold text-gray-900">{questaoStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span>Bancas representadas</span>
              <span className="font-bold text-gray-900">{questaoStats.bancas}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>CESPE · FCC · FGV · VUNESP · IBFC e mais</span>
            </div>
          </div>
          <Link href="/questoes" className="block text-center bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
            Começar →
          </Link>
        </div>
      </section>

      <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎯', title: 'Escolha o nível', desc: 'Fácil, Médio, Difícil ou Expert. Comece devagar e avance conforme fica confortável.' },
            { icon: '🧩', title: 'Resolva o desafio', desc: 'Puzzles: preencha a grade usando as pistas. Questões: escolha a alternativa correta.' },
            { icon: '📚', title: 'Aprenda com os erros', desc: 'Cada erro vem com explicação detalhada do raciocínio. Você ainda pode tentar de novo antes.' },
          ].map(item => (
            <div key={item.title} className="text-center space-y-2">
              <div className="text-3xl">{item.icon}</div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
