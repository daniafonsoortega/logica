import Link from 'next/link'
import RandomButton from '@/components/RandomButton'

const TIPOS = [
  { emoji: '🔍', label: 'Grade Einstein',  desc: 'Deduza a posição de cada elemento numa grelha N×M usando pistas lógicas.' },
  { emoji: '🕵️', label: 'Detetive',        desc: 'Descubra quem fez o quê, quando e onde — raciocínio por eliminação.' },
  { emoji: '📅', label: 'Sequência',       desc: 'Ordene eventos numa linha do tempo usando relações temporais.' },
  { emoji: '🎭', label: 'Quem Mentiu?',    desc: 'Identifique a única afirmação falsa num conjunto de declarações.' },
  { emoji: '🔐', label: 'Código Secreto',  desc: 'Decifre o código usando pistas de cor e posição — estilo Mastermind.' },
  { emoji: '🔤', label: 'Cifra Simbólica', desc: 'Decifre o alfabeto secreto a partir de padrões e repetições.' },
]

const BANCAS = ['CESPE', 'FCC', 'FGV', 'VUNESP', 'IBFC', 'FEPESE', 'AOCP', 'QUADRIX']

const FEATURES = [
  { emoji: '⏱️', title: 'Cronômetro',       desc: 'Veja quanto tempo leva e bata o seu recorde pessoal.' },
  { emoji: '🔥', title: 'Streak diário',    desc: 'Mantenha a sequência de dias consecutivos e suba no ranking.' },
  { emoji: '🏆', title: 'Desafio do dia',   desc: 'Um puzzle diferente a cada dia — competição global.' },
  { emoji: '📊', title: 'Estatísticas',     desc: 'Veja sua evolução: acertos, tempo médio, nível atual.' },
  { emoji: '🎯', title: 'Progressivo',      desc: 'O app sugere níveis crescentes conforme você melhora.' },
  { emoji: '📵', title: 'Offline',          desc: 'Funciona sem internet. Instale como app no seu telemóvel.' },
]

const STATS = [
  { value: '490+', label: 'Puzzles lógicos' },
  { value: '1.000+', label: 'Questões de concurso' },
  { value: '6', label: 'Tipos de puzzle' },
  { value: '100%', label: 'Gratuito para começar' },
]

export default function Home() {
  return (
    <div className="space-y-24 pb-16">

      {/* ── HERO ── */}
      <section className="text-center pt-12 pb-4 space-y-7">
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
          🧠 Treino diário de raciocínio lógico
        </div>

        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Desenvolva{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            raciocínio lógico
          </span>{' '}
          todos os dias
        </h1>

        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          490+ puzzles dedutivos e 1.000+ questões reais de concurso. Grátis, sem anúncios no início, funciona offline.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <RandomButton
            modo="puzzle"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 dark:shadow-blue-900/30 active:scale-95 transition-all"
          >
            🎲 Jogar agora — é grátis
          </RandomButton>
          <a
            href="https://play.google.com/store/apps/details?id=app.vercel.logica_mente.twa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-4 rounded-2xl font-bold text-base hover:border-gray-300 dark:hover:border-gray-600 active:scale-95 transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2l13.24-11.92L13.66 8.2 3.18 23.76zm16.65-9.4L16.6 12l3.23-2.36L22 11.44a1.26 1.26 0 010 2.12l-2.17 1.8zM3.18.24C2.86.43 2.67.79 2.67 1.22V22.78c0 .43.19.79.51.98l.12.07 12.36-12.36v-.29L3.3.17l-.12.07zm10.48 9.76l-3.9-3.9L16.6 2.36 19.83 4.2 13.66 10z"/></svg>
            Google Play
          </a>
        </div>

        <p className="text-xs text-gray-400">Também disponível no browser — sem instalar nada</p>
      </section>

      {/* ── STATS ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 py-6 px-4 shadow-sm">
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{s.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── TIPOS DE PUZZLE ── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">6 tipos de puzzle lógico</h2>
          <p className="text-gray-500 dark:text-gray-400">Cada tipo treina um lado diferente do raciocínio</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TIPOS.map(t => (
            <div key={t.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-2 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all">
              <div className="text-3xl">{t.emoji}</div>
              <h3 className="font-bold text-gray-900 dark:text-white">{t.label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/puzzles" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Ver todos os puzzles →
          </Link>
        </div>
      </section>

      {/* ── QUESTÕES DE CONCURSO ── */}
      <section className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="grid sm:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold px-3 py-1 rounded-full">
              📋 Para quem estuda concursos
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
              1.000 questões reais com explicação completa
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Quando errar, não recebe só o gabarito — vê o raciocínio passo a passo. Aprende a pensar, não a memorizar.
            </p>
            <RandomButton
              modo="questao"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold active:scale-95 transition-all"
            >
              📝 Sortear questão →
            </RandomButton>
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            {BANCAS.map(b => (
              <span key={b} className="bg-white dark:bg-gray-800 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-sm px-3 py-1.5 rounded-full shadow-sm">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Tudo o que precisa para evoluir</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="flex gap-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <div className="text-2xl shrink-0">{f.emoji}</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{f.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white">Comece grátis. Evolua quando quiser.</h2>
          <p className="text-gray-500 dark:text-gray-400">Sem cartão de crédito para começar</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 dark:border-gray-700 p-6 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gratuito</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">R$0</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {['5 desafios diários', 'Todos os tipos de puzzle', 'Questões de concurso', 'Streak e achievements', 'Modo offline'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>
              ))}
            </ul>
            <RandomButton
              modo="puzzle"
              className="block w-full text-center border-2 border-blue-600 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            >
              Começar grátis
            </RandomButton>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl border-2 border-blue-600 p-6 space-y-4 text-white relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-2.5 py-1 rounded-full">
              Popular
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Premium</p>
              <p className="text-3xl font-black mt-1">R$12,90<span className="text-base font-normal text-blue-100">/mês</span></p>
            </div>
            <ul className="space-y-2 text-sm text-blue-100">
              {['Desafios ilimitados', 'Sem anúncios', 'Estatísticas avançadas', 'Histórico completo', 'Suporte prioritário'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-white">✓</span>{f}</li>
              ))}
            </ul>
            <Link
              href="/premium"
              className="block w-full text-center bg-white text-blue-700 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Ver planos →
            </Link>
          </div>
        </div>
      </section>

      {/* ── DOWNLOAD ── */}
      <section className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-8 sm:p-12 text-center space-y-6">
        <h2 className="text-3xl font-black text-white">Leve no bolso. Treine em qualquer lugar.</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Instale como app — funciona offline, sem ocupar espaço, sem loja obrigatória.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://play.google.com/store/apps/details?id=app.vercel.logica_mente.twa"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-white text-gray-900 px-6 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M3.18 23.76c.3.17.64.24.99.2l13.24-11.92L13.66 8.2 3.18 23.76zm16.65-9.4L16.6 12l3.23-2.36L22 11.44a1.26 1.26 0 010 2.12l-2.17 1.8zM3.18.24C2.86.43 2.67.79 2.67 1.22V22.78c0 .43.19.79.51.98l.12.07 12.36-12.36v-.29L3.3.17l-.12.07zm10.48 9.76l-3.9-3.9L16.6 2.36 19.83 4.2 13.66 10z"/></svg>
            Google Play
          </a>
          <div className="flex items-center justify-center gap-3 bg-white/10 text-white/60 px-6 py-4 rounded-2xl font-bold cursor-not-allowed">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store — em breve
          </div>
        </div>
        <p className="text-xs text-gray-500">Ou use directamente no browser em logica-mente.vercel.app</p>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="text-center space-y-5">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">
          Pronto para começar?
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Primeiro puzzle em menos de 10 segundos.</p>
        <RandomButton
          modo="puzzle"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-100 dark:shadow-blue-900/30 active:scale-95 transition-all"
        >
          🎲 Jogar agora — é grátis
        </RandomButton>
      </section>

    </div>
  )
}
