'use client'
import { useRouter } from 'next/navigation'
import { allPuzzles } from '@/lib/data'

export default function ProximoPuzzle({ currentId }: { currentId: string }) {
  const router = useRouter()

  function handleNext() {
    const outros = allPuzzles.filter(p => p.id !== currentId)
    const random = outros[Math.floor(Math.random() * outros.length)]
    router.push(`/puzzles/${random.id}`)
  }

  return (
    <button
      onClick={handleNext}
      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
    >
      Próximo puzzle →
    </button>
  )
}
