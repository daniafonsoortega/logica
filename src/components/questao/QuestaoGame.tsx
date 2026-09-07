'use client'

import { useState } from 'react'
import type { Questao } from '@/types'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, BookOpen } from 'lucide-react'

interface Props { questao: Questao }

type EstadoQuestao = 'respondendo' | 'errou' | 'acertou'

export default function QuestaoGame({ questao }: Props) {
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [estado, setEstado] = useState<EstadoQuestao>('respondendo')
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false)

  const alternativas = Object.entries(questao.alternativas) as [string, string][]

  const responder = () => {
    if (!selecionada) return
    if (selecionada === questao.gabarito) {
      setEstado('acertou')
      setMostrarExplicacao(true)
    } else {
      setEstado('errou')
    }
  }

  const reiniciar = () => {
    setSelecionada(null)
    setEstado('respondendo')
    setMostrarExplicacao(false)
  }

  const corAlternativa = (letra: string) => {
    if (estado === 'respondendo') {
      return selecionada === letra
        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40'
    }
    if (letra === questao.gabarito) return 'border-green-500 bg-green-50 text-green-900'
    if (letra === selecionada && selecionada !== questao.gabarito) return 'border-red-400 bg-red-50 text-red-900'
    return 'border-gray-100 bg-gray-50/50 text-gray-400'
  }

  const iconAlternativa = (letra: string) => {
    if (estado === 'respondendo') return null
    if (letra === questao.gabarito) return <CheckCircle size={16} className="text-green-600 shrink-0" />
    if (letra === selecionada) return <XCircle size={16} className="text-red-500 shrink-0" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Enunciado */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-line leading-relaxed">
          {questao.enunciado}
        </div>
      </div>

      {/* Alternativas */}
      <div className="space-y-2">
        {alternativas.map(([letra, texto]) => (
          <button
            key={letra}
            onClick={() => estado === 'respondendo' && setSelecionada(letra)}
            disabled={estado !== 'respondendo'}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${corAlternativa(letra)} ${estado === 'respondendo' ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <span className="font-black text-sm w-5 shrink-0">{letra}</span>
            <span className="flex-1 text-sm leading-relaxed">{texto}</span>
            {iconAlternativa(letra)}
          </button>
        ))}
      </div>

      {/* Ações */}
      {estado === 'respondendo' && (
        <button
          onClick={responder}
          disabled={!selecionada}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          Confirmar resposta <ChevronRight size={18} />
        </button>
      )}

      {/* Errou */}
      {estado === 'errou' && !mostrarExplicacao && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle size={22} className="text-red-500" />
            <h2 className="font-bold text-red-800">Resposta incorreta</h2>
          </div>
          <p className="text-red-700 text-sm">A alternativa que você escolheu não está correta.</p>
          <div className="flex gap-3">
            <button
              onClick={reiniciar}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-300 rounded-xl text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              <RotateCcw size={16} /> Tentar de novo
            </button>
            <button
              onClick={() => setMostrarExplicacao(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              <BookOpen size={16} /> Ver resposta
            </button>
          </div>
        </div>
      )}

      {/* Acertou */}
      {estado === 'acertou' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle size={22} className="text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-800">Correto! 🎉</p>
            <p className="text-green-700 text-sm">Gabarito: alternativa <strong>{questao.gabarito}</strong></p>
          </div>
        </div>
      )}

      {/* Explicação */}
      {mostrarExplicacao && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 font-bold text-blue-800">
            <BookOpen size={18} />
            Explicação
          </div>
          <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-line">
            {questao.explicacao}
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={reiniciar}
              className="px-4 py-2 bg-white border border-blue-300 rounded-xl text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={14} /> Tentar novamente
            </button>
            <a
              href="/questoes"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Próxima questão →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
