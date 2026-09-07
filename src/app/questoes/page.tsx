'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { allQuestoes } from '@/lib/data'

export default function QuestoesPage() {
  const router = useRouter()

  useEffect(() => {
    const random = allQuestoes[Math.floor(Math.random() * allQuestoes.length)]
    router.replace(`/questoes/${random.id}`)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-gray-400 animate-pulse">Sorteando questão…</p>
    </div>
  )
}
