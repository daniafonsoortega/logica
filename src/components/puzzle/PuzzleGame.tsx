'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { PuzzleGrade as Puzzle, GridState } from '@/types'
import { recordResult } from '@/lib/stats'
import { CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react'


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
interface Props { puzzle: Puzzle }
type GameStatus = 'jogando' | 'correto' | 'incorreto'

function gerarDicas(puzzle: Puzzle): string[] {
  if (puzzle.dicas && puzzle.dicas.length > 0) return puzzle.dicas
  const pistasDiretas = puzzle.pistas.filter(p =>
    /posição|posicao|primeiro|último|segundo|terceiro|quarto|quinto|1º|2º|3º|4º|5º/i.test(p)
  )
  const pistasRelacionais = puzzle.pistas.filter(p =>
    /ao lado|vizinho|imediatamente|próximo|antes|depois|seguinte|adjacente/i.test(p)
  )
  const dica1 = pistasDiretas.length > 0
    ? `Comece por esta pista: "${pistasDiretas[0].length > 90 ? pistasDiretas[0].slice(0, 90) + '…' : pistasDiretas[0]}" — ela fixa um elemento em uma posição exata.`
    : `Identifique as pistas mais diretas — aquelas que colocam um elemento em uma posição específica. São o melhor ponto de partida.`
  const dica2 = pistasRelacionais.length > 0
    ? `Há ${pistasRelacionais.length} pista${pistasRelacionais.length > 1 ? 's' : ''} de posição relativa (ao lado, antes, depois…). Use-as em cadeia: saber onde está A revela onde está B.`
    : `Eliminação progressiva: para cada posição, descarte os valores já confirmados em outras. O que sobrar é a resposta.`
  const dica3 = `Tente preencher o atributo "${puzzle.atributos[0].nome}" por completo antes de avançar. Uma coluna inteira resolvida cria um ponto de apoio para as demais.`
  return [dica1, dica2, dica3]
}

export default function PuzzleGame({ puzzle }: Props) {
  const startTime = useRef(Date.now())
  const [grid, setGrid] = useState<GridState>(() => {
    const g: GridState = {}
    for (let p = 1; p <= puzzle.num_posicoes; p++) {
      g[p] = {}
      for (const attr of puzzle.atributos) { g[p][attr.chave] = null }
    }
    return g
  })
  const [status, setStatus]           = useState<GameStatus>('jogando')
  const [pistasVisiveis, setPistasVisiveis] = useState(false)
  const [dicaAtual, setDicaAtual]     = useState(0)
  const [reportado, setReportado]     = useState(false)
  const [msgAcerto, setMsgAcerto]     = useState('')
  const [msgErro, setMsgErro]         = useState('')

  const dicas = gerarDicas(puzzle)

  const handleSelect = useCallback((posicao: number, atributo: string, valor: string) => {
    if (status !== 'jogando') return
    setGrid(prev => ({
      ...prev,
      [posicao]: { ...prev[posicao], [atributo]: valor === prev[posicao][atributo] ? null : valor }
    }))
  }, [status])

  const verificar = () => {
    let erros = 0
    for (const sol of puzzle.solucao) {
      const pos = sol.posicao
      for (const attr of puzzle.atributos) {
        if (grid[pos]?.[attr.chave] !== (sol[attr.chave] as string)) erros++
      }
    }
    const correto = erros === 0
    setStatus(correto ? 'correto' : 'incorreto')
    if (correto) setMsgAcerto(sortear(MSGS_ACERTO))
    else         setMsgErro(sortear(MSGS_ERRO))
    if (correto && !reportado) {
      setReportado(true)
      recordResult({
        id: puzzle.id, tipo: 'puzzle', resolvido: true,
        dicasUsadas: dicaAtual, semDicas: dicaAtual === 0,
        tempoSegundos: Math.round((Date.now() - startTime.current) / 1000),
        primeiraVez: true,
        dataISO: new Date().toISOString(),
      })
    }
  }

  const reiniciar = () => {
    setStatus('jogando')
    setDicaAtual(0)
    startTime.current = Date.now()
    const g: GridState = {}
    for (let p = 1; p <= puzzle.num_posicoes; p++) {
      g[p] = {}
      for (const attr of puzzle.atributos) { g[p][attr.chave] = null }
    }
    setGrid(g)
  }

  const totalCelulas = puzzle.num_posicoes * puzzle.atributos.length
  const preenchidas  = Object.values(grid).reduce((acc, pos) =>
    acc + Object.values(pos).filter(v => v !== null).length, 0)
  const progresso = Math.round((preenchidas / totalCelulas) * 100)

  return (
    <div className="space-y-6">
      {/* Pistas */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button onClick={() => setPistasVisiveis(!pistasVisiveis)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Lightbulb size={18} className="text-yellow-500" />
            Pistas ({puzzle.num_pistas})
          </div>
          <span className="text-gray-400">{pistasVisiveis ? '▲' : '▼'}</span>
        </button>
        {pistasVisiveis && (
          <div className="px-6 pb-5 space-y-1.5 border-t border-gray-100">
            {puzzle.pistas.map((pista, i) => (
              <div key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-400 font-mono shrink-0 w-5">{i + 1}.</span>
                <span>{pista}</span>
              </div>
            ))}
          </div>
        )}
        {!pistasVisiveis && (
          <p className="px-6 pb-4 border-t border-gray-100 text-xs text-gray-400 pt-3">Clique para ver as pistas</p>
        )}
      </div>

      {/* Grade */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium w-24">Posição</th>
              {puzzle.atributos.map(attr => (
                <th key={attr.chave} className="text-left px-4 py-3 text-gray-700 font-semibold">{attr.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: puzzle.num_posicoes }, (_, i) => i + 1).map(pos => (
              <tr key={pos} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto font-bold text-sm">{pos}</div>
                </td>
                {puzzle.atributos.map(attr => (
                  <td key={attr.chave} className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {attr.valores.map(val => {
                        const selecionado   = grid[pos]?.[attr.chave] === val
                        const usadoEmOutra  = Object.entries(grid).some(
                          ([p, atribs]) => Number(p) !== pos && atribs[attr.chave] === val
                        )
                        return (
                          <button key={val}
                            onClick={() => handleSelect(pos, attr.chave, val)}
                            disabled={status !== 'jogando' || (usadoEmOutra && !selecionado)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              selecionado        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : usadoEmOutra     ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                              :                   'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
                            }`}>
                            {val}
                          </button>
                        )
                      })}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progresso + Verificar */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progresso}%` }} />
          </div>
          <span className="text-xs text-gray-400 w-12 text-right">{progresso}%</span>
        </div>
        <div className="flex gap-3">
          <button onClick={verificar} disabled={progresso < 100 || status !== 'jogando'}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Verificar solução
          </button>
          <button onClick={reiniciar}
            className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Dicas */}
      {status === 'jogando' && (
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

      {/* Correto */}
      {status === 'correto' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <CheckCircle size={40} className="text-green-500 mx-auto" />
          <h2 className="text-xl font-black text-green-800">Parabéns! Correto! 🎉</h2>
          <p className="text-green-600 text-base font-semibold">{msgAcerto}</p>
          <p className="text-green-700 text-sm">
            {dicaAtual === 0 ? 'Resolvido sem dicas — +50 pts bônus!' : `Resolvido com ${dicaAtual} dica${dicaAtual > 1 ? 's' : ''}.`}
          </p>
          <button onClick={reiniciar} className="px-4 py-2 bg-white border border-green-300 rounded-xl text-green-700 text-sm font-medium hover:bg-green-50 transition-colors">
            Jogar novamente
          </button>
        </div>
      )}

      {/* Incorreto */}
      {status === 'incorreto' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <XCircle size={22} className="text-red-500" />
            <h2 className="font-bold text-red-800">Ainda não está certo</h2>
          </div>
          <p className="text-red-700 text-sm font-semibold">{msgErro}</p>
          <p className="text-red-600 text-xs">Revise as pistas e tente novamente.</p>
          <button onClick={() => setStatus('jogando')}
            className="px-4 py-2 bg-white border border-red-300 rounded-xl text-red-700 text-sm font-medium hover:bg-red-50 transition-colors">
            Continuar tentando
          </button>
        </div>
      )}
    </div>
  )
}
