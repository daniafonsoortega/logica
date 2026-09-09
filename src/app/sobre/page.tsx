import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre — LogicaMente',
  description: 'Conheça o LogicaMente, a plataforma de treino de raciocínio lógico.',
}

export default function SobrePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Sobre o LogicaMente</h1>
        <p className="text-gray-500 text-sm">Plataforma de treino de raciocínio lógico</p>
      </div>
      <div className="prose prose-gray max-w-none space-y-4 text-gray-700 leading-relaxed">
        <p>
          O <strong>LogicaMente</strong> é uma plataforma gratuita criada para ajudar pessoas a desenvolverem
          o raciocínio lógico, a capacidade de dedução e o pensamento crítico — habilidades essenciais
          para concursos públicos, vestibulares e para a vida profissional.
        </p>
        <p>
          Disponibilizamos centenas de puzzles em cinco categorias diferentes: <strong>Grade Lógica</strong>,
          <strong>Sequência</strong>, <strong>Código</strong>, <strong>Detetive</strong> e <strong>Mentiu ou Disse a Verdade</strong>.
          Cada puzzle foi criado e verificado manualmente para garantir uma solução única e pistas coerentes.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">Desafio Diário</h2>
        <p>
          Todos os dias disponibilizamos um novo puzzle para quem quer manter o raciocínio afiado.
          O puzzle muda automaticamente à meia-noite — sem necessidade de criar conta.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">Gratuito e sem anúncios intrusivos</h2>
        <p>
          O LogicaMente é e continuará a ser gratuito. Para manter o servidor no ar, utilizamos
          publicidade discreta via Google AdSense. O plano Premium remove os anúncios e desbloqueia
          funcionalidades adicionais.
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-6">Contacto</h2>
        <p>
          Encontrou um erro num puzzle ou tem sugestões? Use o botão <strong>"Reportar problema"</strong>
          no rodapé de qualquer página.
        </p>
      </div>
      <div className="flex gap-4 text-sm text-gray-400">
        <Link href="/privacidade" className="hover:text-gray-600">Privacidade</Link>
        <Link href="/termos" className="hover:text-gray-600">Termos</Link>
        <Link href="/cookies" className="hover:text-gray-600">Cookies</Link>
      </div>
    </div>
  )
}
