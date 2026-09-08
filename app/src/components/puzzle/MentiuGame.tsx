'use client'

import { useState } from 'react'
import type { PuzzleMentiu } from '@/types'
import { recordResult } from '@/lib/stats'

function salvar(id: string, acertou: boolean) {
  recordResult({ id, tipo: 'puzzle', resolvido: acertou, dicasUsadas: 0, tempoSegundos: 0, semDicas: true, primeiraVez: true, dataISO: new Date().toISOString() })
}
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import ShareResult from '@/components/ShareResult'

const MSGS_ACERTO = ["Detectou a mentira! Perspicácia incrível! 🕵️","A lógica não falha — você achou! 🎯","Olho clínico! Detetive nato! 🏆","Cada contradição revelada! Excelente! ⚡","Ninguém te engana! 🌟"]
const MSGS_ERRO   = ["Esse não é o mentiroso... releia as declarações! 🤔","Alguma afirmação não bate — procure a contradição! 🔍","Perto, mas não é esse... tente de novo! 💡","Revise quem contradiz os fatos conhecidos! 🧐"]
const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

interface Props { puzzle: PuzzleMentiu }

export default function MentiuGame({ puzzle }: Props) {
  const startTime = Date.now()
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [tempo, setTempo] = useState(0)
  const [respondeu, setRespondeu]     = useState(false)
  const [acertou, setAcertou]         = useState(false)
  const [msg, setMsg]                 = useState('')

  function responder() {
    if (!selecionado) return
    const ok = selecionado === puzzle.mentiroso
    setTempo(Math.round((Date.now() - startTime) / 1000))
    setAcertou(ok)
    setRespondeu(true)
    setMsg(rand(ok ? MSGS_ACERTO : MSGS_ERRO))
    salvar(puzzle.id, ok)
  }

  function reiniciar() {
    setSelecionado(null); setRespondeu(false); setAcertou(false); setMsg('')
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-900 leading-relaxed">
        <span className="font-bold">🎭 Situação: </span>{puzzle.intro}
      </div>

      <p className="text-sm text-gray-600 text-center font-medium">
        Uma pessoa está <span className="text-red-600 font-bold">mentindo em todas</span> as suas declarações. Qual é?
      </p>

      {/* Resultado */}
      {respondeu && (
        <div className={`rounded-2xl p-5 text-center space-y-3 ${acertou ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {acertou
            ? <CheckCircle className="mx-auto text-green-500" size={40} />
            : <XCircle className="mx-auto text-red-400" size={40} />}
          <p className="font-bold text-lg">{msg}</p>
          <ShareResult tipo="mentiu" tema={puzzle.tema} acertou={acertou} tempoSegundos={tempo} semDicas={true} nivel={puzzle.nivel} />
          <div className="text-sm bg-white rounded-xl p-3 border border-gray-100">
            <p><strong>O mentiroso era:</strong> {puzzle.mentiroso}</p>
            <p className="mt-1 text-gray-600 text-xs">{puzzle.explicacao}</p>
          </div>
          {!acertou && (
            <button onClick={reiniciar} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium">
              <RotateCcw size={14} /> Tentar de novo
            </button>
          )}
        </div>
      )}

      {/* Cards de personagens */}
      <div className="space-y-4">
        {puzzle.personagens.map(p => {
          const sel = selecionado === p.nome
          const errou = respondeu && sel && !acertou
          const correto = respondeu && p.nome === puzzle.mentiroso
          return (
            <div
              key={p.nome}
              onClick={() => !respondeu && setSelecionado(sel ? null : p.nome)}
              className={`rounded-xl border p-4 space-y-3 transition-all cursor-pointer select-none ${
                correto ? 'bg-red-50 border-red-400 ring-2 ring-red-400' :
                errou   ? 'bg-orange-50 border-orange-300' :
                sel     ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400' :
                respondeu ? 'bg-gray-50 border-gray-200 opacity-60' :
                'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{p.emoji}</span>
                <div>
                  <p className="font-bold text-gray-900">{p.nome}</p>
                  {sel && !respondeu && <p className="text-xs text-blue-600 font-medium">Selecionado</p>}
                  {correto && <p className="text-xs text-red-600 font-bold">⚠ O mentiroso!</p>}
                </div>
                {!respondeu && (
                  <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${sel ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {sel && <span className="w-2.5 h-2.5 rounded-full bg-white block" />}
                  </div>
                )}
              </div>
              <div className="space-y-1 pl-1">
                {p.declaracoes.map((d, i) => (
                  <p key={i} className={`text-sm leading-snug ${
                    correto ? 'text-red-700 line-through' : 'text-gray-700'
                  }`}>
                    <span className="text-gray-400 mr-1">"</span>{d}<span className="text-gray-400">"</span>
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {!respondeu && (
        <button
          onClick={responder}
          disabled={!selecionado}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-40"
        >
          {selecionado ? `${selecionado} está mentindo →` : 'Selecione o mentiroso'}
        </button>
      )}
    </div>
  )
}
