'use client'
import { useRouter } from 'next/navigation'
import { allQuestoes } from '@/lib/data'

export default function ProximaQuestao({ currentId }: { currentId: string }) {
  const router = useRouter()

  function handleNext() {
    const outras = allQuestoes.filter(q => q.id !== currentId)
    const random = outras[Math.floor(Math.random() * outras.length)]
    router.push(`/questoes/${random.id}`)
  }

  return (
    <button
      onClick={handleNext}
      className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
    >
      Próxima questão →
    </button>
  )
}
