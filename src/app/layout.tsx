import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LogicaMente',
  description: 'Treine raciocínio lógico com puzzles e questões de concurso',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-xl text-blue-700 tracking-tight">
              🧠 LogicaMente
            </a>
            <div className="flex gap-6 text-sm font-medium">
              <a href="/puzzles" className="text-gray-600 hover:text-blue-700 transition-colors">
                Puzzles Lógicos
              </a>
              <a href="/questoes" className="text-gray-600 hover:text-blue-700 transition-colors">
                Questões de Concurso
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-200 mt-16 py-6 text-center text-sm text-gray-400">
          LogicaMente · Treine sua mente todos os dias
        </footer>
      </body>
    </html>
  )
}
