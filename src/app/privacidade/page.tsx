import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — LogicaMente',
}

export default function PrivacidadePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-gray-700 leading-relaxed">
      <h1 className="text-3xl font-black text-gray-900">Política de Privacidade</h1>
      <p className="text-sm text-gray-400">Última atualização: setembro de 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">1. Dados recolhidos</h2>
        <p>Recolhemos apenas os dados necessários para o funcionamento do serviço:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li><strong>Conta:</strong> email e nome (apenas se criar conta)</li>
          <li><strong>Progresso:</strong> puzzles resolvidos, tempo, pontuação (armazenados localmente no seu dispositivo)</li>
          <li><strong>Pagamento:</strong> processado pela Stripe — não temos acesso aos dados do cartão</li>
          <li><strong>Uso:</strong> dados anónimos de navegação via Google Analytics (se consentido)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">2. Como usamos os dados</h2>
        <p>Os dados são usados exclusivamente para:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Gerir a sua conta e plano Premium</li>
          <li>Melhorar a plataforma com base em dados agregados</li>
          <li>Comunicações transacionais (confirmação de pagamento, etc.)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">3. Armazenamento local</h2>
        <p>O progresso nos puzzles, melhores tempos e preferências de tema são guardados no <code>localStorage</code> do seu browser — nunca enviados para os nossos servidores, a menos que tenha conta.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">4. Os seus direitos (RGPD)</h2>
        <p>Tem direito a aceder, corrigir e eliminar os seus dados. Para exercer estes direitos, contacte-nos através do botão "Reportar problema".</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">5. Cookies</h2>
        <p>Consulte a nossa <a href="/cookies" className="text-blue-600 hover:underline">Política de Cookies</a> para mais detalhes.</p>
      </section>
    </div>
  )
}
