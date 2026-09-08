'use client'

import { useState, useRef } from 'react'
import type { Questao } from '@/types'
import { recordAndBadge } from '@/lib/record'
import type { Badge } from '@/lib/badges'
import BadgeNotification from '@/components/BadgeNotification'
import { CheckCircle, XCircle, ChevronRight, RotateCcw, BookOpen, Lightbulb } from 'lucide-react'


const MSGS_ACERTO = [
    "Sua mente está afiada! 🔥",
    "Ninguém consegue te parar! 💪",
    "Raciocínio impecável! 🧠",
    "Você é imbatível! ⚡",
    "Gênio em ação! 🎯",
    "Essa foi perfeita! ✨",
    "Continue assim — você está voando! 🚀",
    "Lógica pura! Impressionante! 🏆",
    "Mente brilhante! Assim se faz! 🌟",
    "Passou fácil! Isso é talento! 🎊"
  ]
const MSGS_ERRO   = [
    "Não é bem isso — tente de novo! 🤔",
    "Essa passou raspando, quase lá! 💡",
    "Está quente, quente... revise as pistas! 🔍",
    "Os grandes pensadores erram antes de acertar. Vai de novo! 💪",
    "Perto, mas não chegou — mais uma tentativa! 🎯",
    "Errando que se aprende! Tente de novo! 🧩",
    "Quase lá! Releia com calma! 🕵️",
    "Sua lógica está acordando — mais uma vez! ⚡"
  ]
function sortear(arr: string[]) { return arr[Math.floor(Math.random() * arr.length)] }
interface Props { questao: Questao }
type EstadoQuestao = 'respondendo' | 'errou' | 'acertou'

function gerarDicas(questao: Questao): string[] {
  if (questao.dicas && questao.dicas.length > 0) return questao.dicas
  const numAlts = Object.keys(questao.alternativas).length
  return [
    `Releia o enunciado e separe as informações concretas (fatos dados) das condições lógicas (se/então, todo/nenhum, sempre/nunca). O que exatamente está sendo perguntado?`,
    `Tente construir um esquema ou lista com os elementos do enunciado. Questões de ${questao.area} costumam ficar muito mais claras quando visualizadas.`,
    `Das ${numAlts} alternativas, descarte as que contradizem diretamente algum dado do enunciado. Eliminar 2 ou 3 opções já costuma deixar o caminho evidente.`,
  ]
}

export default function QuestaoGame({ questao }: Props) {
  const startTime = useRef(Date.now())
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [estado, setEstado]           = useState<EstadoQuestao>('respondendo')
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false)
  const [dicaAtual, setDicaAtual]     = useState(0)
  const [reportado, setReportado]     = useState(false)
  const [novasBadges, setNovasBadges]  = useState<Badge[]>([])
  const [msgAcerto, setMsgAcerto]     = useState('')
  const [msgErro, setMsgErro]         = useState('')

  const alternativas = Object.entries(questao.alternativas) as [string, string][]
  const dicas = gerarDicas(questao)

  const responder = () => {
    if (!selecionada) return
    const acertou = selecionada === questao.gabarito
    setEstado(acertou ? 'acertou' : 'errou')
    if (acertou) setMsgAcerto(sortear(MSGS_ACERTO))
    else         setMsgErro(sortear(MSGS_ERRO))
    if (acertou) setMostrarExplicacao(true)
    if (acertou && !reportado) {
      setReportado(true)
      setNovasBadges(recordAndBadge({
        id: questao.id, tipo: 'questao', resolvido: true,
        dicasUsadas: dicaAtual, semDicas: dicaAtual === 0,
        tempoSegundos: Math.round((Date.now() - startTime.current) / 1000),
        primeiraVez: true,
        dataISO: new Date().toISOString(),
        nivel: questao.nivel,
      }))
    }
  }

  const reiniciar = () => {
    setSelecionada(null)
    setEstado('respondendo')
    setMostrarExplicacao(false)
    setDicaAtual(0)
    startTime.current = Date.now()
  }

  const corAlternativa = (letra: string) => {
    if (estado === 'respondendo')
      return selecionada === letra
        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm'
        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40'
    if (letra === questao.gabarito) return 'border-green-500 bg-green-50 text-green-900'
    if (letra === selecionada)      return 'border-red-400 bg-red-50 text-red-900'
    return 'border-gray-100 bg-gray-50/50 text-gray-400'
  }

  return (
    <div className="space-y-6">
      {/* Enunciado */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-gray-800 whitespace-pre-line leading-relaxed text-sm">{questao.enunciado}</div>
      </div>

      {/* Alternativas */}
      <div className="space-y-2">
        {alternativas.map(([letra, texto]) => (
          <button key={letra}
            onClick={() => estado === 'respondendo' && setSelecionada(letra)}
            disabled={estado !== 'respondendo'}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${corAlternativa(letra)} ${estado === 'respondendo' ? 'cursor-pointer' : 'cursor-default'}`}>
            <span className="font-black text-sm w-5 shrink-0">{letra}</span>
            <span className="flex-1 text-sm leading-relaxed">{texto}</span>
            {estado !== 'respondendo' && letra === questao.gabarito && <CheckCircle size={16} className="text-green-600 shrink-0" />}
            {estado !== 'respondendo' && letra === selecionada && letra !== questao.gabarito && <XCircle size={16} className="text-red-500 shrink-0" />}
          </button>
        ))}
      </div>

      {/* Confirmar */}
      {estado === 'respondendo' && (
        <button onClick={responder} disabled={!selecionada}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
          Confirmar resposta <ChevronRight size={18} />
        </button>
      )}

      {/* Dicas */}
      {estado === 'respondendo' && (
        <div className="border border-amber-200 bg-amber-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
            <Lightbulb size={16} className="text-amber-500 shrink-0" />Dicas
          </div>
          {dicaAtual > 0 && (
            <div className="space-y-2">
              {dicas.slice(0, dicaAtual).map((dica, i) => (
                <div key={i} className="flex gap-2 text-sm text-amber-900">
                  <span className="font-bold shrink-0 text-amber-500">{i + 1}.</span>
                  <span>{dica}</span>
                </div>
              ))}
            </div>
          )}
          {dicaAtual < dicas.length ? (
            <button onClick={() => setDicaAtual(d => d + 1)}
              className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors">
              {dicaAtual === 0 ? '💡 Pedir uma dica' : 'Mais uma dica →'}
            </button>
          ) : (
            <p className="text-xs text-amber-600 italic">Todas as dicas foram reveladas.</p>
          )}
        </div>
      )}

      {/* Errou */}
      {estado === 'errou' && !mostrarExplicacao && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <XCircle size={22} className="text-red-500" />
            <h2 className="font-bold text-red-800">Resposta incorreta</h2>
          </div>
          <p className="text-red-700 text-sm font-semibold">{msgErro}</p>
          <p className="text-red-600 text-xs">A alternativa escolhida não está correta.</p>
          <div className="flex gap-3">
            <button onClick={reiniciar}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-300 rounded-xl text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors">
              <RotateCcw size={16} /> Tentar de novo
            </button>
            <button onClick={() => setMostrarExplicacao(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
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
            <p className="text-green-600 text-sm font-semibold">{msgAcerto}</p>
            <p className="text-green-700 text-sm">
              Gabarito: <strong>{questao.gabarito}</strong>
              {dicaAtual === 0 && ' · Sem dicas — +50 pts bônus!'}
            </p>
          </div>
        </div>
      )}

      {/* Explicação */}
      {mostrarExplicacao && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-2 font-bold text-blue-800">
            <BookOpen size={18} /> Explicação
          </div>
          <p className="text-blue-900 text-sm leading-relaxed whitespace-pre-line">{questao.explicacao}</p>
          <button onClick={reiniciar}
            className="px-4 py-2 bg-white border border-blue-300 rounded-xl text-blue-700 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center gap-2">
            <RotateCcw size={14} /> Tentar novamente
          </button>
        </div>
      )}
      <BadgeNotification badges={novasBadges} onDone={() => setNovasBadges([])} />
    </div>
  )
}
