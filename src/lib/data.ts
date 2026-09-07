// Carrega os bancos de dados locais (JSON estáticos)
import puzzlesData from '../../data/puzzles_lp.json'
import questoesData from '../../data/questoes_cq.json'
import type { Puzzle, Questao, Nivel } from '@/types'

export const allPuzzles: Puzzle[] = puzzlesData as Puzzle[]
export const allQuestoes: Questao[] = questoesData as Questao[]

export function getPuzzlesByNivel(nivel: Nivel): Puzzle[] {
  return allPuzzles.filter(p => p.nivel === nivel)
}

export function getPuzzleById(id: string): Puzzle | undefined {
  return allPuzzles.find(p => p.id === id)
}

export function getQuestoesByNivel(nivel: Nivel): Questao[] {
  return allQuestoes.filter(q => q.nivel === nivel)
}

export function getQuestaoById(id: string): Questao | undefined {
  return allQuestoes.find(q => q.id === id)
}

export function getRandomPuzzle(nivel?: Nivel): Puzzle {
  const pool = nivel ? getPuzzlesByNivel(nivel) : allPuzzles
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getRandomQuestao(nivel?: Nivel): Questao {
  const pool = nivel ? getQuestoesByNivel(nivel) : allQuestoes
  return pool[Math.floor(Math.random() * pool.length)]
}

export const NIVEL_LABELS: Record<Nivel, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
  expert: 'Expert',
}

export const NIVEL_COLORS: Record<Nivel, string> = {
  facil: 'bg-green-100 text-green-800 border-green-300',
  medio: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  dificil: 'bg-red-100 text-red-800 border-red-300',
  expert: 'bg-purple-100 text-purple-800 border-purple-300',
}
