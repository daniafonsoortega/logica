'use client'

import { useState } from 'react'
import type { PuzzleMentiu } from '@/types'
import { recordResult } from '@/lib/stats'
import { CheckCircle, XCircle, RotateCcw, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

function salvar(id: string, acertou: boolean, usouDica: boolean) {
  recordResult({ id, tipo: 'puzzle', resolvido: acertou, dicasUsadas: usouDica ? 1 : 0, tempoSegundos: 0, semDicas: !usouDica, primeiraVez: true, dataISO: new Date().toISOString() })
}

const MSGS_ACERTO = ["Detectou a mentira! Perspicácia incrível! 🕵️","A lógica não falha — você achou! 🎯","Olho clínico! Detetive nato! 🏆","Cada contradição revelada! Excelente! ⚡","Ninguém te engana! 🌟"]
const MSGS_ERRO   = ["Esse não é o mentiroso... releia as declarações! 🤔","Alguma afirmação não bate — procure a contradição! 🔍","Perto, mas não é esse... tente de novo! 💡","Revise quem contradiz os factos verificados! 🧐"]
const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

const DICAS_MENTIU = [
  "Leia os factos verificados com atenção. O mentiroso contradiz pelo menos um deles diretamente.",
  "Compare cada declaração com os factos listados. Uma afirmação falsa contradiz uma evidência concreta.",
  "Procure a declaração que é impossível face aos factos — essa é a mentira.",
]

interface Props { puzzle: PuzzleMentiu }

export default function MentiuGame({ puzzle }: Props) {
  const [selecionado, setSelecionado] = useState<string | null>(null)
  const [respondeu, setRespondeu]     = useState(false)
  const [acertou, setAcertou]         = useState(false)
  const [msg, setMsg]                 = useState('')
  const [dicasAbertas, setDicasAbertas] = useState(false)
  const [dicasVistas, setDicasVistas]   = useState(0)

  const mentiroso = puzzle.mentiroso || puzzle.resposta || ''

  function responder() {
    if (!selecionado) return
    const ok = selecionado === mentiroso
    setAcertou(ok)
    setRespondeu(true)
    setMsg(rand(ok ? MSGS_ACERTO : MSGS_ERRO))
    salvar(puzzle.id, ok, dicasVistas > 0)
  }

  function reiniciar() {
    setSelecionado(null); setRespondeu(false); setAcertou(false); setMsg('')
    setDicasAbertas(false); setDicasVistas(0)
  }

  function revelarDica(i: number) {
    if (i + 1 > dicasVistas) setDicasVistas(i + 1)
  }

  function getDeclaracoes(p: { declaracao?: string; declaracoes?: string[] }): string[] {
    if (p.declaracao) return [p.declaracao]
    if (p.declaracoes) return p.declaracoes
    return []
  }

  return (
    <div className="space-y-6">
      {/* Situação */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-900 leading-relaxed">
        <span className="font-bold">🎭 Situação: </span>{puzzle.intro}
      </div>

      {/* Factos verificados */}
      {puzzle.fatos && puzzle.fatos.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <p className="text-sm font-bold text-blue-800 mb-2">📋 Factos verificados:</p>
          <ul className="space-y-1">
            {puzzle.fatos.map((fato, i) => (
              <li key={i} className="flex gap-2 text-sm text-blue-900">
                <span className="text-blue-400 shrink-0">•</span>
                <span>{fato}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-gray-600 text-center font-medium">
        Uma pessoa está <span className="text-red-600 font-bold">mentindo</span> — a sua declaração contradiz os factos. Qual é?
      </p>

      {/* Resultado */}
      {respondeu && (
        <div className={`rounded-2xl p-5 text-center space-y-3 ${acertou ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {acertou ? <CheckCircle className="mx-auto text-green-500" size={40} /> : <XCircle className="mx-auto text-red-400" size={40} />}
          <p className="font-bold text-lg">{msg}</p>
          <div className="text-sm bg-white rounded-xl p-3 border border-gray-100 text-left">
            <p><strong>O mentiroso era:</strong> {mentiroso}</p>
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
          const correto = respondeu && p.nome === mentiroso
          const declaracoes = getDeclaracoes(p)
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
                {p.emoji && <span className="text-3xl">{p.emoji}</span>}
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
                {declaracoes.map((d, i) => (
                  <p key={i} className={`text-sm leading-snug ${correto ? 'text-red-700 line-through' : 'text-gray-700'}`}>
                    <span className="text-gray-400 mr-1">"</span>{d}<span className="text-gray-400">"</span>
                  </p>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dicas */}
      {!respondeu && (
        <div className="border border-yellow-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setDicasAbertas(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 bg-yellow-50 text-sm font-medium text-yellow-800 hover:bg-yellow-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lightbulb size={16} />
              Pedir dica {dicasVistas > 0 && <span className="bg-yellow-200 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">{dicasVistas}/{DICAS_MENTIU.length}</span>}
            </span>
            {dicasAbertas ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {dicasAbertas && (
            <div className="bg-white px-4 py-3 space-y-3">
              {DICAS_MENTIU.map((dica, i) => (
                <div key={i}>
                  {i < dicasVistas ? (
                    <div className="flex gap-3 text-sm text-gray-700 bg-yellow-50 rounded-lg px-3 py-2">
                      <span className="font-bold text-yellow-600 shrink-0">Dica {i + 1}</span>
                      <span>{dica}</span>
                    </div>
                  ) : i === dicasVistas ? (
                    <button onClick={() => revelarDica(i)} className="w-full text-sm text-yellow-700 border border-yellow-200 rounded-lg px-3 py-2 hover:bg-yellow-50 transition-colors text-left">
                      👁 Revelar dica {i + 1}
                    </button>
                  ) : (
                    <div className="text-sm text-gray-300 border border-gray-100 rounded-lg px-3 py-2">Dica {i + 1} — bloqueada</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
