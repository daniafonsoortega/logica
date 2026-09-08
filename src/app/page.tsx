import Link from 'next/link'
import HomeGreeting from '@/components/HomeGreeting'

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 space-y-4">
        <HomeGreeting />
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Treine seu <span className="text-blue-600">raciocínio lógico</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Clique num modo e um desafio é sorteado pra você. Puzzles dedutivos estilo Einstein
          ou questões reais de concursos públicos.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link href="/puzzles" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-lg">
            Jogar Puzzle
          </Link>
          <Link href="/questoes" className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors text-lg">
            Questão de Concurso
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
          <p className="text-xs text-gray-400">Novos puzzles adicionados todo mês.</p>
          <Link href="/puzzles" className="block text-center bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Sortear puzzle →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4 hover:shadow-md transition-shadow">
          <div className="text-4xl">📝</div>
          <h2 className="text-2xl font-bold text-gray-900">Questões de Concurso</h2>
          <p className="text-gray-500">
            Questões reais de provas das principais bancas brasileiras. Quando errar, você escolhe:
            tentar de novo ou ver a explicação completa com o raciocínio passo a passo.
          </p>
          <p className="text-xs text-gray-400">Novas questões adicionadas todo mês.</p>
          <Link href="/questoes" className="block text-center bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
            Sortear questão →
          </Link>
        </div>
      </section>

      <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎲', title: 'Desafio aleatório', desc: 'Clique em um dos modos e um puzzle ou questão é sorteado automaticamente. Sem escolher — vai direto.' },
            { icon: '🧩', title: 'Resolva o desafio', desc: 'Puzzles: preencha a grade usando as pistas. Questões: escolha a alternativa correta.' },
            { icon: '📚', title: 'Aprenda com os erros', desc: 'Cada erro vem com explicação detalhada do raciocínio. Tente de novo ou passe para o próximo.' },
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
