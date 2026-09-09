'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Fecha o menu ao navegar
  useEffect(() => { setOpen(false) }, [pathname])

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-mobile-menu]')) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      pathname === href
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`

  return (
    <div className="sm:hidden relative" data-mobile-menu>
      {/* Botão hambúrguer */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        className="flex flex-col justify-center items-center w-9 h-9 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors gap-1.5"
      >
        <span className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 w-5 bg-current rounded-full transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl py-2 px-2 z-50">
          <Link href="/puzzles"        className={linkClass('/puzzles')}>🔍 Puzzles</Link>
          <Link href="/desafio-diario" className={linkClass('/desafio-diario')}>🏆 Desafio do Dia</Link>
          <Link href="/questoes"       className={linkClass('/questoes')}>📝 Questões</Link>
          <Link href="/ranking"        className={linkClass('/ranking')}>🥇 Ranking</Link>
          <div className="border-t border-gray-100 dark:border-gray-800 my-1.5" />
          <Link href="/premium"        className={linkClass('/premium')}>⭐ Premium</Link>
        </div>
      )}
    </div>
  )
}
