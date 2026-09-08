'use client'

// Tipo 6 — Cifra Simbólica
// Cada letra da frase foi substituída por um símbolo único.
// Pistas revelam algumas substituições. O usuário preenche o restante.

import React, { useState, useEffect } from 'react'
import type { PuzzleCifra } from '@/types'
import { recordAndBadge } from '@/lib/record'
import type { Badge } from '@/lib/badges'
import ShareResult from '@/components/ShareResult'
import BadgeNotification from '@/components/BadgeNotification'
import { CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react'

const MSGS_ACERTO = ["Cifra decifrada! Mente brilhante! 🔤","Código quebrado com maestria! 🏆","Deduziu cada símbolo! Incrível! ⚡","A mensagem oculta revelada! 🌟","Instinto linguístico perfeito! 🎯"]
const MSGS_ERRO   = ["Algum símbolo ainda está errado... 🤔","Revise as pistas — há padrões escondidos! 🔍","Quase! Um ou mais símbolos precisam de ajuste 💡","Releia as dicas sobre vogais e frequências! 🧐"]
const rand = (a: string[]) => a[Math.floor(Math.random() * a.length)]


interface Props { puzzle: PuzzleCifra }
type Status = 'jogando' | 'correto' | 'incorreto'

export default function CifraGame({ puzzle }: Props) {
  const [novasBadges, setNovasBadges] = React.useState<Badge[]>([])
  const startTime = Date.now()
  // mapa de respostas: símbolo → letra digitada
  const simbolosUnicos = [...new Set(Object.values(puzzle.mapa_cifrado))]
  const [respostas, setRespostas] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    simbolosUnicos.forEach(s => { init[s] = '' })
    // pré-preencher revelados
    Object.entries(puzzle.revelados ?? {}).forEach(([sim, let_]) => { init[sim] = let_ })
    return init
  })
  const [status, setStatus]   = useState<Status>('jogando')
  const [msg, setMsg]         = useState('')
  const [pistasVis, setPistas] = useState(false)
  const [tempo, setTempo]     = useState(0)

  // Frase decodificada em tempo real
  const fraseDecodificada = puzzle.frase_cifrada.split('').map(ch => {
    if (ch === ' ') return ' '
    const letra = respostas[ch]
    return letra || '_'
  })

  function verificar() {
    // Verificar se cada símbolo mapeado bate com a solução
    const correto = simbolosUnicos.every(s => {
      const sol = puzzle.solucao[s]
      return respostas[s]?.toUpperCase() === sol?.toUpperCase()
    })
    const t = Math.round((Date.now() - startTime) / 1000)
    setTempo(t)
    if (correto) {
      setStatus('correto'); setMsg(rand(MSGS_ACERTO)); setNovasBadges(recordAndBadge({ id: puzzle.id, tipo: 'puzzle', resolvido: true, dicasUsadas: pistasVis ? 1 : 0, tempoSegundos: tempo, semDicas: !pistasVis, primeiraVez: true, dataISO: new Date().toISOString(), nivel: puzzle.nivel, tipoPuzzle: 'cifra' }))
    } else {
      setStatus('incorreto'); setMsg(rand(MSGS_ERRO)); recordAndBadge({ id: puzzle.id, tipo: 'puzzle', resolvido: false, dicasUsadas: pistasVis ? 1 : 0, tempoSegundos: 0, semDicas: !pistasVis, primeiraVez: true, dataISO: new Date().toISOString(), nivel: puzzle.nivel, tipoPuzzle: 'cifra' })
    }
  }

  function reiniciar() {
    const init: Record<string, string> = {}
    simbolosUnicos.forEach(s => { init[s] = '' })
    Object.entries(puzzle.revelados ?? {}).forEach(([sim, let_]) => { init[sim] = let_ })
    setRespostas(init); setStatus('jogando'); setMsg('')
  }

  const revelados = new Set(Object.keys(puzzle.revelados ?? {}))
  const completo = simbolosUnicos.every(s => respostas[s] !== '')

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-900 leading-relaxed">
        <span className="font-bold">🔤 Missão: </span>{puzzle.intro}
      </div>

      {/* Frase cifrada */}
      <div className="bg-gray-900 rounded-2xl p-5 space-y-3">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Mensagem cifrada</p>
        <div className="flex flex-wrap gap-2">
          {puzzle.frase_cifrada.split(' ').map((palavra, wi) => (
            <div key={wi} className="flex gap-0.5">
              {palavra.split('').map((sim, ci) => (
                <div key={ci} className="flex flex-col items-center">
                  <span className="text-yellow-400 text-xl leading-none">{sim}</span>
                  <span className={`text-base font-bold leading-none mt-1 ${
                    fraseDecodificada[puzzle.frase_cifrada.split(' ').slice(0, wi).join(' ').length + (wi > 0 ? 1 : 0) + ci] !== '_'
                      ? 'text-green-400' : 'text-gray-600'
                  }`}>
                    {fraseDecodificada[puzzle.frase_cifrada.split(' ').slice(0, wi).join(' ').length + (wi > 0 ? 1 : 0) + ci]}
                  </span>
                  <div className="w-5 h-px bg-gray-600 mt-0.5" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Resultado */}
      {status !== 'jogando' && (
        <div className={`rounded-2xl p-5 text-center space-y-3 ${status === 'correto' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          {status === 'correto'
            ? <CheckCircle className="mx-auto text-green-500" size={40} />
            : <XCircle className="mx-auto text-red-400" size={40} />}
          <p className="font-bold text-lg">{msg}</p>
          {status === 'correto' && (
            <>
              <p className="text-green-800 font-semibold">{puzzle.frase_original}</p>
              <ShareResult tipo="cifra" tema={puzzle.tema} acertou={true} tempoSegundos={tempo} semDicas={!pistasVis} nivel={puzzle.nivel} />
            </>
          )}
          {status === 'incorreto' && (
            <button onClick={reiniciar} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium">
              <RotateCcw size={14} /> Tentar de novo
            </button>
          )}
        </div>
      )}

      {/* Tabela de substituição */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Decifrar símbolos</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {simbolosUnicos.map(sim => {
            const rev = revelados.has(sim)
            const val = respostas[sim]
            return (
              <div key={sim}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  rev ? 'bg-green-50 border-green-300' :
                  val ? 'bg-blue-50 border-blue-300' :
                  'bg-white border-gray-200'
                }`}
              >
                <span className="text-2xl w-8 text-center">{sim}</span>
                <span className="text-gray-400 text-sm">=</span>
                {rev ? (
                  <span className="font-black text-green-700 text-lg w-8 text-center">{val}</span>
                ) : (
                  <input
                    value={val}
                    onChange={e => {
                      const l = e.target.value.replace(/[^a-zA-Z]/g,'').toUpperCase().slice(-1)
                      setRespostas(prev => ({ ...prev, [sim]: l }))
                    }}
                    disabled={status !== 'jogando'}
                    maxLength={1}
                    className="w-8 h-8 text-center font-black text-lg border-b-2 border-blue-400 bg-transparent focus:outline-none uppercase"
                    placeholder="?"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pistas */}
      <div className="bg-gray-50 rounded-xl border border-gray-200">
        <button onClick={() => setPistas(v => !v)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
          <span className="flex items-center gap-2"><Eye size={14} /> Pistas ({puzzle.pistas.length})</span>
          <span className="text-gray-400">{pistasVis ? '▲' : '▼'}</span>
        </button>
        {pistasVis && (
          <ul className="px-4 pb-4 space-y-2">
            {puzzle.pistas.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-indigo-500 font-bold shrink-0">{i+1}.</span>{p}
              </li>
            ))}
          </ul>
        )}
      </div>

      {status === 'jogando' && (
        <button
          onClick={verificar}
          disabled={!completo}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-40"
        >
          {completo ? 'Decifrar mensagem →' : 'Preencha todos os símbolos'}
        </button>
      )}
      <BadgeNotification badges={novasBadges} onDone={() => setNovasBadges([])} />
    </div>
  )
}
