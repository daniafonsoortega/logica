import type { Metadata } from 'next'
import Link from 'next/link'
import ReportarProblema from '@/components/ReportarProblema'
import DailyCounter from '@/components/DailyCounter'
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
            <Link href="/" className="font-bold text-xl text-blue-700 tracking-tight">
              🧠 LogicaMente
            </Link>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex gap-6 text-sm font-medium">
                <Link href="/puzzles" className="text-gray-600 hover:text-blue-700 transition-colors">Puzzles</Link>
                <Link href="/questoes" className="text-gray-600 hover:text-blue-700 transition-colors">Questões</Link>
                <Link href="/ranking" className="text-gray-600 hover:text-blue-700 transition-colors">Ranking</Link>
              </div>
              <DailyCounter />
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 mt-16 py-6">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-gray-400">
            <span>LogicaMente · Treine sua mente todos os dias</span>
            <ReportarProblema />
          </div>
        </footer>
      </body>
    </html>
  )
}
