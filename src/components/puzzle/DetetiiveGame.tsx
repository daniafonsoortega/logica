'use client'



import { useState, useRef } from 'react'

import type { PuzzleDetetive } from '@/types'

import { recordResult } from '@/lib/stats'
import GameTimer from '@/components/GameTimer'



function salvar(id: string, acertou: boolean, usouDica: boolean, tempoSegundos: number) {
  recordResult({ id, tipo: 'puzzle', resolvido: acertou, dicasUsadas: usouDica ? 1 : 0, tempoSegundos, semDicas: !usouDica, primeiraVez: true, dataISO: new Date().toISOString() })
}

import { CheckCircle, XCircle, Search, RotateCcw, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'



const MSGS_ACERTO = ["Caso encerrado! Detetive brilhante! 🔍","Você chegou lá! Ninguém escapa de você! 🕵️","Caso solucionado com maestria! 🏆","Instinto certeiro! Grande detetive! ⚡","A lógica venceu! Caso fechado! 🎯"]

const MSGS_ERRO   = ["Hmm… revise as pistas com calma! 🔍","Esse suspeito tem um bom alibi... tente outro! 🤔","Quase lá! Algum detalhe escapou... 💡","Releia os testemunhos — há uma contradição! 🧐","Nem sempre o óbvio é o culpado! 🕵️"]

const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]



interface Props { puzzle: PuzzleDetetive }

type Status = 'jogando' | 'correto' | 'incorreto'



export default function DetetiiveGame({ puzzle }: Props) {

  const startTime = useRef(Date.now())
  const [eliminados, setEliminados] = useState<Set<string>>(new Set())

  const [culpadoSel, setCulpado]    = useState<string | null>(null)

  const [metodoSel,  setMetodo]     = useState<string | null>(null)

  const [localSel,   setLocal]      = useState<string | null>(null)

  const [status, setStatus]         = useState<Status>('jogando')

  const [msg, setMsg]               = useState('')

  const [pistasVisiveis, setPistas] = useState(false)
  const [dicasAbertas, setDicasAbertas] = useState(false)
  const [dicasVistas, setDicasVistas]   = useState(0)

  const DICAS = [
    "Foque nos alibis — qual deles é impossível de confirmar ou contradiz diretamente outra pista?",
    "Leia cada pista e pergunte: isso elimina um suspeito, um método ou um local? Trabalhe por eliminação.",
    "Se ainda estiver preso, tente identificar o local primeiro — costuma ser o mais fácil de deduzir pelas pistas.",
  ]



  const ativos = puzzle.personagens.filter(p => !eliminados.has(p.nome))



  function toggleEliminar(nome: string) {

    if (status !== 'jogando') return

    if (culpadoSel === nome) return // não pode eliminar quem selecionou como culpado

    setEliminados(prev => {

      const next = new Set(prev)

      next.has(nome) ? next.delete(nome) : next.add(nome)

      return next

    })

  }



  function verificar() {

    if (!culpadoSel || !metodoSel || !localSel) return

    const { culpado, metodo, local } = puzzle.solucao

    if (culpadoSel === culpado && metodoSel === metodo && localSel === local) {

      setStatus('correto')

      setMsg(rand(MSGS_ACERTO))

      salvar(puzzle.id, true, pistasVisiveis || dicasVistas > 0, Math.round((Date.now() - startTime.current) / 1000))

    } else {

      setStatus('incorreto')

      setMsg(rand(MSGS_ERRO))

      salvar(puzzle.id, false, pistasVisiveis || dicasVistas > 0, Math.round((Date.now() - startTime.current) / 1000))

    }

  }



  function reiniciar() {

    setEliminados(new Set())

    setCulpado(null); setMetodo(null); setLocal(null)

    setStatus('jogando'); setMsg('')

  }



  const pronto = culpadoSel && metodoSel && localSel



  return (

    <div className="space-y-6">

      {/* Intro */}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 leading-relaxed">

        <span className="font-bold">🔍 O Caso: </span>{puzzle.intro}

      </div>

      {/* Instrução */}
      <div className="flex flex-wrap gap-2 text-sm">
        <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">🧑 Quem é o culpado?</span>
        <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full font-medium">🛠 Qual foi o método?</span>
        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">📍 Onde aconteceu?</span>
      </div>



      {/* Resultado */}

      {status !== 'jogando' && (

        <div className={`rounded-2xl p-5 text-center space-y-3 ${status === 'correto' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>

          {status === 'correto'

            ? <CheckCircle className="mx-auto text-green-500" size={40} />

            : <XCircle className="mx-auto text-red-400" size={40} />}

          <p className="font-bold text-lg">{msg}</p>

          {status === 'incorreto' && (

            <button onClick={reiniciar} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">

              <RotateCcw size={14} /> Tentar de novo

            </button>

          )}

          {status === 'correto' && (

            <div className="text-sm text-green-800 bg-white rounded-xl p-3 border border-green-100">

              <strong>Culpado:</strong> {puzzle.solucao.culpado} · <strong>Método:</strong> {puzzle.solucao.metodo} · <strong>Local:</strong> {puzzle.solucao.local}

              <p className="mt-2 text-gray-600 text-xs">{puzzle.explicacao}</p>

            </div>

          )}

        </div>

      )}



      {/* Suspeitos */}

      <div className="space-y-2">

        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Suspeitos</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

          {puzzle.personagens.map(p => {

            const elim = eliminados.has(p.nome)

            const sel  = culpadoSel === p.nome

            return (

              <div key={p.nome} className={`rounded-xl border p-3 space-y-1 transition-all ${

                elim ? 'opacity-30 bg-gray-50 border-gray-200' :

                sel  ? 'bg-red-50 border-red-400 ring-2 ring-red-400' :

                       'bg-white border-gray-200 hover:border-gray-300'}`}>

                <div className="flex items-center justify-between">

                  <span className="text-2xl">{p.emoji}</span>

                  {!elim && status === 'jogando' && (

                    <button

                      onClick={() => toggleEliminar(p.nome)}

                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"

                      title="Eliminar suspeito"

                    >✕</button>

                  )}

                </div>

                <p className="font-semibold text-sm text-gray-900">{p.nome}</p>

                <p className="text-xs text-gray-500 leading-snug">{p.alibi}</p>

                {!elim && status === 'jogando' && (

                  <button

                    onClick={() => setCulpado(sel ? null : p.nome)}

                    className={`w-full mt-1 py-1 rounded-lg text-xs font-semibold transition-colors ${

                      sel ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'

                    }`}

                  >{sel ? '★ Culpado' : 'Acusar'}</button>

                )}

              </div>

            )

          })}

        </div>

        {eliminados.size > 0 && status === 'jogando' && (

          <button onClick={() => setEliminados(new Set())} className="text-xs text-blue-600 hover:underline">

            Restaurar eliminados

          </button>

        )}

      </div>



      {/* Método e Local */}

      <div className="grid grid-cols-2 gap-4">

        <div className="space-y-2">

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Método</p>

          <div className="space-y-1">

            {puzzle.metodos.map(m => (

              <button key={m} onClick={() => setMetodo(metodoSel === m ? null : m)}

                disabled={status !== 'jogando'}

                className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${

                  metodoSel === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'

                }`}>{m}</button>

            ))}

          </div>

        </div>

        <div className="space-y-2">

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Local</p>

          <div className="space-y-1">

            {puzzle.locais.map(l => (

              <button key={l} onClick={() => setLocal(localSel === l ? null : l)}

                disabled={status !== 'jogando'}

                className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${

                  localSel === l ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'

                }`}>{l}</button>

            ))}

          </div>

        </div>

      </div>



      {/* Pistas */}

      <div className="bg-gray-50 rounded-xl border border-gray-200">

        <button onClick={() => setPistas(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">

          <span className="flex items-center gap-2"><Search size={14} /> Pistas ({puzzle.pistas.length})</span>

          <span className="text-gray-400">{pistasVisiveis ? '▲' : '▼'}</span>

        </button>

        {pistasVisiveis && (

          <ul className="px-4 pb-4 space-y-2">

            {puzzle.pistas.map((p, i) => (

              <li key={i} className="flex gap-2 text-sm text-gray-700">

                <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>{p}

              </li>

            ))}

          </ul>

        )}

      </div>



      {/* Botão verificar */}

      {status === 'jogando' && (

        <button

          onClick={verificar}

          disabled={!pronto}

          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-base hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"

        >

          {pronto ? 'Revelar o culpado →' : 'Selecione culpado, método e local'}

        </button>

      )}

    </div>

  )

}

