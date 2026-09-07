// ── Types compartilhados ─────────────────────────────────────────────────────

export type Nivel = 'facil' | 'medio' | 'dificil' | 'expert'

// Logic Puzzle (LP)
export interface AtributoPuzzle {
  chave: string
  nome: string
  valores: string[]
}

export interface SolucaoPosicao {
  posicao: number
  [atributo: string]: string | number
}

export interface Puzzle {
  id: string
  nivel: Nivel
  tema: string
  num_posicoes: number
  atributos: AtributoPuzzle[]
  pistas: string[]
  num_pistas: number
  solucao: SolucaoPosicao[]
  dicas?: string[]   // opcional — se ausente, gera automaticamente
}

// Questão de Concurso (CQ)
export interface Alternativas {
  A: string
  B: string
  C: string
  D: string
  E?: string
}

export interface Questao {
  id: string
  nivel: Nivel
  banca: string
  orgao: string
  ano: number
  area: string
  tipo: string
  enunciado: string
  alternativas: Alternativas
  gabarito: string
  explicacao: string
  dicas?: string[]   // opcional — se ausente, gera automaticamente
}

// Estado do jogo — puzzle
export interface GridState {
  [posicao: number]: {
    [atributo: string]: string | null
  }
}

// Estado do jogo — questão
export type EstadoQuestao = 'respondendo' | 'errou' | 'acertou'
