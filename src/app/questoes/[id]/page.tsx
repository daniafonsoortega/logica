import { getQuestaoById, allQuestoes, NIVEL_LABELS, NIVEL_COLORS } from '@/lib/data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import QuestaoGame from '@/components/questao/QuestaoGame'
import ProximaQuestao from '@/components/questao/ProximaQuestao'

export async function generateStaticParams() {
  return allQuestoes.map(q => ({ id: q.id }))
}

export default async function QuestaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const questao = getQuestaoById(id)
  if (!questao) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-400 font-mono text-sm">{questao.id}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${NIVEL_COLORS[questao.nivel]}`}>
              {NIVEL_LABELS[questao.nivel]}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {questao.banca}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{questao.orgao} · {questao.ano}</h1>
        </div>
        <Link href="/" className="text-sm text-purple-600 hover:underline whitespace-nowrap">
          ← Início
        </Link>
      </div>

      <QuestaoGame questao={questao} />

      <div className="flex justify-center pt-2">
        <ProximaQuestao currentId={questao.id} />
      </div>
    </div>
  )
}
