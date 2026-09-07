'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { allPuzzles } from '@/lib/data'

export default function PuzzlesPage() {
  const router = useRouter()

  useEffect(() => {
    const random = allPuzzles[Math.floor(Math.random() * allPuzzles.length)]
    router.replace(`/puzzles/${random.id}`)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-64">
      <p className="text-gray-400 animate-pulse">Sorteando puzzle…</p>
    </div>
  )
}
