import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import ReportarProblema from '@/components/ReportarProblema'
import DailyCounter from '@/components/DailyCounter'
import AuthButton from '@/components/AuthButton'
import ThemeToggle from '@/components/ThemeToggle'
import CookieBanner from '@/components/CookieBanner'
import RegisterSW from '@/components/RegisterSW'
import PushSubscribe from '@/components/PushSubscribe'
import MobileMenu from '@/components/MobileMenu'
import OnboardingModal from '@/components/OnboardingModal'
import './globals.css'

export const metadata: Metadata = {
  title: 'LogicaMente — Treine Raciocínio Lógico',
  description: 'Puzzles de lógica, grades, sequências, código e detetive. Treine sua mente todos os dias.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
  manifest: '/manifest.json',
  openGraph: {
    title: 'LogicaMente',
    description: 'Treine raciocínio lógico com puzzles e questões de concurso',
    url: 'https://logica-mente.vercel.app',
    siteName: 'LogicaMente',
    locale: 'pt_BR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563EB" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1036537609242573"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/logo.svg" alt="LogicaMente" width={28} height={28} className="rounded-full" priority />
              <span className="font-bold text-xl text-blue-700 dark:text-blue-400 tracking-tight">
                LogicaMente
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {/* Links desktop — ocultos em mobile */}
              <div className="hidden sm:flex gap-6 text-sm font-medium">
                <Link href="/puzzles"        className="text-gray-600 dark:text-gray-300 hover:text-blue-700 transition-colors">Puzzles</Link>
                <Link href="/desafio-diario" className="text-gray-600 dark:text-gray-300 hover:text-amber-600 transition-colors">🏆 Desafio</Link>
                <Link href="/questoes"       className="text-gray-600 dark:text-gray-300 hover:text-blue-700 transition-colors">Questões</Link>
                <Link href="/ranking"        className="text-gray-600 dark:text-gray-300 hover:text-blue-700 transition-colors">Ranking</Link>
              </div>
              <DailyCounter />
              <ThemeToggle />
              <PushSubscribe />
              <AuthButton />
              {/* Menu hambúrguer — só em mobile */}
              <MobileMenu />
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 py-6">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Image src="/logo.svg" alt="" width={16} height={16} className="opacity-50" />
              <span>LogicaMente · Treine sua mente todos os dias</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sobre"       className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Sobre</Link>
              <Link href="/termos"      className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Termos</Link>
              <Link href="/privacidade" className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacidade</Link>
              <Link href="/cookies"     className="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Cookies</Link>
              <ReportarProblema />
            </div>
          </div>
        </footer>

        <CookieBanner />
        <RegisterSW />
        {/* Onboarding — aparece apenas na primeira visita */}
        <OnboardingModal />
      </body>
    </html>
  )
}
