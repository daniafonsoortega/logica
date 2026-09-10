import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies — MalhaMente',
}

export default function CookiesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-gray-700 leading-relaxed">
      <h1 className="text-3xl font-black text-gray-900">Política de Cookies</h1>
      <p className="text-sm text-gray-400">Última atualização: setembro de 2026</p>

      <p>O MalhaMente usa cookies e armazenamento local para melhorar a sua experiência.</p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">Cookies essenciais</h2>
        <p className="text-sm text-gray-500">Sempre ativos — necessários para o funcionamento básico</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Nome</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Finalidade</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Duração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-3 py-2 font-mono text-xs">lm_count</td><td className="px-3 py-2">Contador de puzzles jogados</td><td className="px-3 py-2">Permanente</td></tr>
              <tr><td className="px-3 py-2 font-mono text-xs">lm_stats</td><td className="px-3 py-2">Estatísticas locais</td><td className="px-3 py-2">Permanente</td></tr>
              <tr><td className="px-3 py-2 font-mono text-xs">lm_best_times</td><td className="px-3 py-2">Melhores tempos pessoais</td><td className="px-3 py-2">Permanente</td></tr>
              <tr><td className="px-3 py-2 font-mono text-xs">lm_daily</td><td className="px-3 py-2">Estado do desafio diário</td><td className="px-3 py-2">Permanente</td></tr>
              <tr><td className="px-3 py-2 font-mono text-xs">lm_theme</td><td className="px-3 py-2">Preferência de tema (claro/escuro)</td><td className="px-3 py-2">Permanente</td></tr>
              <tr><td className="px-3 py-2 font-mono text-xs">lm_cookies_consent</td><td className="px-3 py-2">Registo do seu consentimento</td><td className="px-3 py-2">1 ano</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">Cookies de análise</h2>
        <p className="text-sm text-gray-500">Apenas com o seu consentimento</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Serviço</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-700">Finalidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr><td className="px-3 py-2">Google AdSense</td><td className="px-3 py-2">Publicidade contextual para manter o serviço gratuito</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">Como gerir cookies</h2>
        <p>Pode limpar os dados do MalhaMente nas definições do seu browser. Note que isso irá repor o seu progresso e preferências.</p>
      </section>
    </div>
  )
}
