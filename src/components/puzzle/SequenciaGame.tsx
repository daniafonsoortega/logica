'use client'

import { useState } from 'react'
import type { PuzzleSequencia } from '@/types'
import { recordResult } from '@/lib/stats'

function salvar(id: string, acertou: boolean, usouDica: boolean) {
  recordResult({ id, tipo: 'puzzle', resolvido: acertou, dicasUsadas: usouDica ? 1 : 0, tempoSegundos: 0, semDicas: !usouDica, primeiraVez: true, dataISO: new Date().toISOString() })
}
import { CheckCircle, XCircle, RotateCcw, GripVertical, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

const MSGS_ACERTO = ["Ordem perfeita! Raciocínio impecável! 🏆","Sequência correta! Você é incrível! ⚡","Cronologia certeira! Muito bem! 🎯","Encaixou tudo no lugar! 🧩","Mente organizada — sequência perfeita! 🌟"]
const MSGS_ERRO   = ["A ordem ainda não está certa... tente de novo! 🔍","Algum elemento está fora do lugar! 💡","Releia as pistas de ordem! 🤔","Quase — mas não exatamente! Mais uma vez! 💪"]
const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

interface Props { puzzle: PuzzleSequencia }
type Status = 'jogando' | 'correto' | 'incorreto'

export default function SequenciaGame({ puzzle }: Props) {
  // ordem atual: array de itens na ordem que o usuário definiu
  const [ordem, setOrdem] = useState<string[]>([...puzzle.itens])
  const [status, setStatus] = useState<Status>('jogando')
  const [msg, setMsg]       = useState('')
  const [pistasVis, setPistas]   = useState(false)
  const [dicasAbertas, setDicasAbertas] = useState(false)
  const [dicasVistas, setDicasVistas]   = useState(0)

  const DICAS = [
    "Procure pistas de ordem relativa ('X antes de Y', 'Z logo depois de W') — elas constroem a sequência passo a passo.",
    "Comece pelos extremos: qual item foi definitivamente o primeiro ou o último? Isso ancora o resto da cadeia.",
    "Se uma pista liga dois itens ('A e B estão juntos'), posicione-os lado a lado e veja onde o par encaixa.",
  ]
  const [arrastando, setArrastando] = useState<number | null>(null)

  function mover(from: number, to: number) {
    if (from === to) return
    const next = [...ordem]
    const [item] = next.splice(from, 1)
    next.splice(to, 0, item)
    setOrdem(next)
  }

  function verificar() {
    const correto = puzzle.solucao.every((v, i) => ordem[i] === v)
    if (correto) {
      setStatus('correto')
      setMsg(rand(MSGS_ACERTO))
      salvar(puzzle.id, true, pistasVis || dicasVistas > 0)
    } else {
      setStatus('incorreto')
      setMsg(rand(MSGS_ERRO))
      salvar(puzzle.id, false, pistasVis || dicasVistas > 0)
    }
  }

  function reiniciar() {
    setOrdem([...puzzle.itens])
    setStatus('jogando'); setMsg('')
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-900 leading-relaxed">
        <span className="font-bold">📅 Contexto: </span>{puzzle.intro}
      </div>

      {/* Resultado */}
      {status !== 'jogando' && (
        <div className={`rounded-2xl p-5 text-center space-y-3 ${status === 'correto' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {status === 'correto'
            ? <CheckCircle className="mx-auto text-green-500" size={40} />
            : <XCircle className="mx-auto text-red-400" size={40} />}
          <p className="font-bold text-lg">{msg}</p>
          {status === 'incorreto' && (
            <button onClick={reiniciar} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium">
              <RotateCcw size={14} /> Tentar de novo
            </button>
          )}
          {status === 'correto' && (
            <div className="text-sm text-green-800 bg-white rounded-xl p-3 border border-green-100">
              <strong>Ordem correta:</strong> {puzzle.solucao.join(' → ')}
              <p className="mt-2 text-gray-600 text-xs">{puzzle.explicacao}</p>
            </div>
          )}
        </div>
      )}

      {/* Instrução */}
      {status === 'jogando' && (
        <p className="text-sm text-gray-500 text-center">
          Use os botões ↑↓ para reordenar os itens do <strong>1º ao {puzzle.itens.length}º</strong>
        </p>
      )}

      {/* Lista ordenável */}
      <div className="space-y-2">
        {ordem.map((item, idx) => (
          <div
            key={item}
            className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition-all ${
              status === 'correto' ? 'border-green-300 bg-green-50' :
              status === 'incorreto' && puzzle.solucao[idx] !== item ? 'border-red-300 bg-red-50' :
              'border-gray-200'
            }`}
          >
            <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
              {idx + 1}
            </span>
            <GripVertical size={14} className="text-gray-300 shrink-0" />
            <span className="flex-1 text-sm font-medium text-gray-800">{item}</span>
            {status === 'jogando' && (
              <div className="flex gap-1">
                <button
                  onClick={() => mover(idx, idx - 1)}
                  disabled={idx === 0}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-20 text-sm"
                >↑</button>
                <button
                  onClick={() => mover(idx, idx + 1)}
                  disabled={idx === ordem.length - 1}
                  className="w-7 h-7 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-20 text-sm"
                >↓</button>
              </div>
            )}
            {status === 'correto' && <span className="text-green-500 text-sm">✓</span>}
            {status === 'incorreto' && (
              <span className={puzzle.solucao[idx] === item ? 'text-green-500 text-sm' : 'text-red-400 text-sm'}>
                {puzzle.solucao[idx] === item ? '✓' : '✗'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Pistas */}
      <div className="bg-gray-50 rounded-xl border border-gray-200">
        <button onClick={() => setPistas(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
          <span>📋 Pistas ({puzzle.pistas.length})</span>
          <span className="text-gray-400">{pistasVis ? '▲' : '▼'}</span>
        </button>
        {pistasVis && (
          <ul className="px-4 pb-4 space-y-2">
            {puzzle.pistas.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>{p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === 'jogando' && (
        <button onClick={verificar} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Verificar ordem →
        </button>
      )}
    </div>
  )
}
