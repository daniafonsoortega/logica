import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 py-16">
      <div className="text-8xl select-none">🧩</div>

      <div className="space-y-2">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white">
          Página não encontrada
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md">
          Esta peça do puzzle não existe. Talvez o URL esteja errado, ou a página foi removida.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-95"
        >
          🏠 Voltar ao início
        </Link>
        <Link
          href="/puzzles"
          className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95"
        >
          🔍 Ver puzzles
        </Link>
        <Link
          href="/desafio-diario"
          className="px-6 py-3 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded-xl font-semibold hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors active:scale-95"
        >
          🏆 Desafio do dia
        </Link>
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-600 pt-4">
        Erro 404
      </p>
    </div>
  )
}
