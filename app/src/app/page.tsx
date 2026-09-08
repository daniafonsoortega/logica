import RandomButton from '@/components/RandomButton'
import HomeGreeting from '@/components/HomeGreeting'

const NIVEIS = [
  { key: 'facil',   label: 'Fácil',   emoji: '🟢' },
  { key: 'medio',   label: 'Médio',   emoji: '🟡' },
  { key: 'dificil', label: 'Difícil', emoji: '🔴' },
  { key: 'expert',  label: 'Expert',  emoji: '🟣' },
]

export default function Home() {
  return (
    <div className="space-y-12">

      {/* Hero */}
      <section className="text-center py-16 space-y-5">
        <HomeGreeting />
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Treine seu <span className="text-blue-600">raciocínio lógico</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Um clique — um desafio sorteado na hora. Puzzles dedutivos estilo Einstein
          ou questões reais de concursos públicos.
        </p>

        {/* Botões primários — vão direto ao desafio */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <RandomButton
            modo="puzzle"
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 active:scale-95 transition-all text-lg shadow-md"
          >
            🎲 Sortear Puzzle
          </RandomButton>
          <RandomButton
            modo="questao"
            className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 active:scale-95 transition-all text-lg shadow-md"
          >
            📝 Sortear Questão
          </RandomButton>
        </div>

        {/* Seletor de nível — puzzles */}
        <div className="space-y-1.5 pt-1">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Ou escolha o nível do puzzle:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {NIVEIS.map(({ key, label, emoji }) => (
              <RandomButton
                key={key}
                modo="puzzle"
                nivel={key}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 active:scale-95 transition-all shadow-sm"
              >
                {emoji} {label}
              </RandomButton>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-400">Sem menus, sem configuração — vai direto.</p>
      </section>

      {/* Cards de modos */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4 hover:shadow-md transition-shadow">
          <div className="text-4xl">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900">Puzzles Lógicos</h2>
          <p className="text-gray-500">
            Seis tipos de desafio: grades de dedução, detetive, sequência temporal,
            quem mentiu, códigos secretos e cifras simbólicas.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {['🔍 Grade','🕵️ Detetive','📅 Sequência','🎭 Quem Mentiu?','🔐 Código','🔤 Cifra'].map(t => (
              <span key={t} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{t}</span>
            ))}
          </div>
          <div className="space-y-2">
            <RandomButton
              modo="puzzle"
              className="block w-full text-center bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              🎲 Sortear aleatório →
            </RandomButton>
            <div className="flex gap-1.5">
              {NIVEIS.map(({ key, label, emoji }) => (
                <RandomButton
                  key={key}
                  modo="puzzle"
                  nivel={key}
                  className="flex-1 text-center text-xs py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 active:scale-95 transition-all font-medium"
                >
                  {emoji} {label}
                </RandomButton>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-4 hover:shadow-md transition-shadow">
          <div className="text-4xl">📝</div>
          <h2 className="text-2xl font-bold text-gray-900">Questões de Concurso</h2>
          <p className="text-gray-500">
            1.000 questões reais das principais bancas brasileiras. Quando errar, você
            vê a <strong>explicação completa do raciocínio</strong> — não só o gabarito.
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {['CESPE','FCC','FGV','VUNESP','IBFC','FEPESE'].map(b => (
              <span key={b} className="bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-medium">{b}</span>
            ))}
          </div>
          <div className="space-y-2">
            <RandomButton
              modo="questao"
              className="block w-full text-center bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              🎲 Sortear aleatório →
            </RandomButton>
            <div className="flex gap-1.5">
              {NIVEIS.map(({ key, label, emoji }) => (
                <RandomButton
                  key={key}
                  modo="questao"
                  nivel={key}
                  className="flex-1 text-center text-xs py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 active:scale-95 transition-all font-medium"
                >
                  {emoji} {label}
                </RandomButton>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-blue-50 rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎲', title: 'Um clique, um desafio', desc: 'Clique em "Sortear" e vá direto ao puzzle — sem menus, sem configuração.' },
            { icon: '🧩', title: 'Resolva o desafio', desc: 'Puzzles: use lógica para deduzir a resposta. Questões: escolha a alternativa certa.' },
            { icon: '📚', title: 'Entenda o raciocínio', desc: 'Cada erro vem com explicação do raciocínio passo a passo — você aprende a pensar, não só a memorizar.' },
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
