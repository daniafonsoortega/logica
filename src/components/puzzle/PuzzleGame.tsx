'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { Puzzle, GridState } from '@/types'
import { CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react'

interface Props { puzzle: Puzzle }
type GameStatus = 'jogando' | 'correto' | 'incorreto'

export default function PuzzleGame({ puzzle }: Props) {
  const [grid, setGrid] = useState<GridState>(() => {
    const g: GridState = {}
    for (let p = 1; p <= puzzle.num_posicoes; p++) {
      g[p] = {}
      for (const attr of puzzle.atributos) { g[p][attr.chave] = null }
    }
    return g
  })
  const [status, setStatus] = useState<GameStatus>('jogando')
  const [pistasVisiveis, setPistasVisiveis] = useState(false)

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
    setStatus(erros === 0 ? 'correto' : 'incorreto')
  }

  const reiniciar = () => {
    setStatus('jogando')
    const g: GridState = {}
    for (let p = 1; p <= puzzle.num_posicoes; p++) {
      g[p] = {}
      for (const attr of puzzle.atributos) { g[p][attr.chave] = null }
    }
    setGrid(g)
  }

  const totalCelulas = puzzle.num_posicoes * puzzle.atributos.length
  const preenchidas = Object.values(grid).reduce((acc, pos) =>
    acc + Object.values(pos).filter(v => v !== null).length, 0)
  const progresso = Math.round((preenchidas / totalCelulas) * 100)

  return (
    <div className="space-y-6">
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
          <p className="px-6 pb-4 border-t border-gray-100 text-xs text-gray-400 pt-3">
            Clique para ver as pistas
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-500 font-medium w-24">Posição</th>
              {puzzle.atributos.map(attr => (
                <th key={attr.chave} className="text-left px-4 py-3 text-gray-700 font-semibold">
                  {attr.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: puzzle.num_posicoes }, (_, i) => i + 1).map(pos => (
              <tr key={pos} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto font-bold text-sm">
                    {pos}
                  </div>
                </td>
                {puzzle.atributos.map(attr => (
                  <td key={attr.chave} className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {attr.valores.map(val => {
                        const selecionado = grid[pos]?.[attr.chave] === val
                        const usadoEmOutra = Object.entries(grid).some(
                          ([p, atribs]) => Number(p) !== pos && atribs[attr.chave] === val
                        )
                        return (
                          <button key={val}
                            onClick={() => handleSelect(pos, attr.chave, val)}
                            disabled={status !== 'jogando' || (usadoEmOutra && !selecionado)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                              selecionado
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : usadoEmOutra
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
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

      {status === 'correto' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <CheckCircle size={40} className="text-green-500 mx-auto" />
          <h2 className="text-xl font-black text-green-800">Parabéns! Correto! 🎉</h2>
          <p className="text-green-700 text-sm">Você resolveu o puzzle com sucesso.</p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={reiniciar} className="px-4 py-2 bg-white border border-green-300 rounded-xl text-green-700 text-sm font-medium hover:bg-green-50 transition-colors">
              Jogar novamente
            </button>
            <Link href="/puzzles" className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
              Próximo puzzle →
            </Link>
          </div>
        </div>
      )}

      {status === 'incorreto' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <XCircle size={22} className="text-red-500" />
            <h2 className="font-bold text-red-800">Ainda não está certo</h2>
          </div>
          <p className="text-red-700 text-sm">Revise as pistas e tente novamente.</p>
          <button onClick={() => setStatus('jogando')}
            className="px-4 py-2 bg-white border border-red-300 rounded-xl text-red-700 text-sm font-medium hover:bg-red-50 transition-colors">
            Continuar tentando
          </button>
        </div>
      )}
    </div>
  )
}
