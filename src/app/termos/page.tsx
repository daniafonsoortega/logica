import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso — MalhaMente',
}

export default function TermosPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 text-gray-700 leading-relaxed">
      <h1 className="text-3xl font-black text-gray-900">Termos de Uso</h1>
      <p className="text-sm text-gray-400">Última atualização: setembro de 2026</p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">1. Aceitação</h2>
        <p>Ao aceder ao MalhaMente, você concorda com estes Termos de Uso. Se não concordar, por favor não utilize o serviço.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">2. Uso permitido</h2>
        <p>O MalhaMente é uma plataforma de uso pessoal e educativo. É proibido:</p>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Reproduzir ou distribuir o conteúdo dos puzzles sem autorização</li>
          <li>Usar scripts automatizados para aceder à plataforma</li>
          <li>Tentar contornar mecanismos de segurança ou pagamento</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">3. Conteúdo</h2>
        <p>Os puzzles e conteúdos são disponibilizados "tal como estão". Esforçamo-nos para garantir a qualidade, mas não garantimos a ausência de erros.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">4. Plano Premium</h2>
        <p>O pagamento do plano Premium é processado de forma segura via Stripe. Não armazenamos dados de cartão de crédito. O plano é pessoal e intransferível.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">5. Alterações</h2>
        <p>Reservamo-nos o direito de alterar estes termos a qualquer momento. O uso continuado após alterações constitui aceitação dos novos termos.</p>
      </section>
    </div>
  )
}
