'use client'

import { useState, useRef } from 'react'
import type { PuzzleCodigo } from '@/types'
import { recordResult } from '@/lib/stats'

function salvar(id: string, acertou: boolean, usouDica: boolean) {
  recordResult({ id, tipo: 'puzzle', resolvido: acertou, dicasUsadas: usouDica ? 1 : 0, tempoSegundos: 0, semDicas: !usouDica, primeiraVez: true, dataISO: new Date().toISOString() })
}
import { CheckCircle, XCircle, RotateCcw, Lock, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'

const MSGS_ACERTO = ["Código decifrado! Mente privilegiada! 🔓","Acesso concedido! Lógica impecável! ⚡","Decifrou em cheio! Incrível! 🎯","O código não resistiu! Excelente! 🏆","Raciocínio afiado — código quebrado! 🌟"]
const MSGS_ERRO   = ["Código incorreto... revise as pistas! 🔐","Combinação errada — tente de novo! 🤔","Algum dígito escapou... releia! 💡","Quase! Reveja as restrições! 🧐"]
const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

interface Props { puzzle: PuzzleCodigo }

export default function CodigoGame({ puzzle }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(puzzle.num_digitos).fill(''))
  const [status, setStatus] = useState<'jogando'|'correto'|'incorreto'>('jogando')
  const [msg, setMsg]       = useState('')
  const [tentativas, setTentativas] = useState(0)
  const [pistasVis, setPistas]   = useState(false)
  const [dicasAbertas, setDicasAbertas] = useState(false)
  const [dicasVistas, setDicasVistas]   = useState(0)

  const DICAS = [
    "Leia cada pista separadamente e tente fixar um dígito de cada vez — algumas restrições determinam um valor diretamente.",
    "Pistas do tipo 'um certo, no lugar certo' vs 'um certo, no lugar errado' funcionam como no Wordle: use-as para cruzar e eliminar.",
    "Anote o que já sabe: um dígito confirmado numa posição elimina opções das outras — trabalhe do mais certo para o mais incerto.",
  ]
  const refs = useRef<(HTMLInputElement|null)[]>([])

  function handleDigit(i: number, val: string) {
    if (status !== 'jogando') return
    const isNum = puzzle.tipo_codigo === 'numerico'
    const clean = isNum
      ? val.replace(/\D/g, '').slice(-1)
      : val.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(-1)
    const next = [...digits]
    next[i] = clean
    setDigits(next)
    if (clean && i < puzzle.num_digitos - 1) refs.current[i + 1]?.focus()
  }

  function verificar() {
    const tentativa = digits.join('')
    if (tentativa.length < puzzle.num_digitos) return
    setTentativas(t => t + 1)
    if (tentativa === puzzle.solucao) {
      setStatus('correto')
      setMsg(rand(MSGS_ACERTO))
      salvar(puzzle.id, true, pistasVis || dicasVistas > 0)
    } else {
      setStatus('incorreto')
      setMsg(rand(MSGS_ERRO))
    }
  }

  function reiniciar() {
    setDigits(Array(puzzle.num_digitos).fill(''))
    setStatus('jogando'); setMsg('')
  }

  const completo = digits.every(d => d !== '')

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-gray-900 text-green-400 rounded-xl px-4 py-3 text-sm font-mono leading-relaxed">
        <span className="text-green-300 font-bold">🔐 MISSÃO: </span>{puzzle.intro}
      </div>

      {/* Resultado */}
      {status !== 'jogando' && (
        <div className={`rounded-2xl p-5 text-center space-y-3 ${status === 'correto' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {status === 'correto'
            ? <CheckCircle className="mx-auto text-green-500" size={40} />
            : <XCircle className="mx-auto text-red-400" size={40} />}
          <p className="font-bold text-lg">{msg}</p>
          {status === 'correto' && (
            <div className="text-sm bg-white rounded-xl p-3 border border-green-100">
              <p><strong>Código correto:</strong> <span className="font-mono text-lg">{puzzle.solucao}</span></p>
              <p className="mt-1 text-gray-600 text-xs">{puzzle.explicacao}</p>
            </div>
          )}
          {status === 'incorreto' && (
            <button onClick={reiniciar} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium">
              <RotateCcw size={14} /> Tentar de novo
            </button>
          )}
        </div>
      )}

      {/* Caixa-forte visual */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-600">
            {puzzle.tipo_codigo === 'numerico' ? 'Código numérico' : 'Código de letras'} — {puzzle.num_digitos} dígitos
          </span>
        </div>
        <div className="flex gap-3">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { refs.current[i] = el }}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Backspace' && !d && i > 0) refs.current[i - 1]?.focus()
                if (e.key === 'Enter' && completo) verificar()
              }}
              disabled={status !== 'jogando'}
              maxLength={1}
              className={`w-14 h-16 text-center text-2xl font-black rounded-xl border-2 focus:outline-none transition-all font-mono ${
                status === 'correto' ? 'border-green-400 bg-green-50 text-green-700' :
                status === 'incorreto' ? 'border-red-300 bg-red-50 text-red-600' :
                d ? 'border-blue-400 bg-blue-50 text-blue-800' :
                'border-gray-300 bg-white focus:border-blue-500'
              }`}
              inputMode={puzzle.tipo_codigo === 'numerico' ? 'numeric' : 'text'}
            />
          ))}
        </div>
        {tentativas > 0 && status === 'incorreto' && (
          <p className="text-xs text-red-500">{tentativas} tentativa{tentativas > 1 ? 's' : ''} errada{tentativas > 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Pistas */}
      <div className="bg-gray-50 rounded-xl border border-gray-200">
        <button onClick={() => setPistas(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
          <span>💡 Pistas ({puzzle.pistas.length})</span>
          <span className="text-gray-400">{pistasVis ? '▲' : '▼'}</span>
        </button>
        {pistasVis && (
          <ul className="px-4 pb-4 space-y-2">
            {puzzle.pistas.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700 font-mono">
                <span className="text-green-600 font-bold shrink-0">&gt;</span>{p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === 'jogando' && (
        <button
          onClick={verificar}
          disabled={!completo}
          className="w-full py-3 bg-gray-900 text-green-400 rounded-xl font-bold font-mono hover:bg-gray-800 transition-colors disabled:opacity-40"
        >
          {completo ? '[ DECIFRAR CÓDIGO ]' : '[ PREENCHA TODOS OS DÍGITOS ]'}
        </button>
      )}
    </div>
  )
}
