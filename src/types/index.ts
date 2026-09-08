// ── Tipos compartilhados ─────────────────────────────────────────

export type Nivel = 'facil' | 'medio' | 'dificil' | 'expert'
export type TipoPuzzle = 'grade' | 'detetive' | 'sequencia' | 'mentiu' | 'codigo'

// ── Puzzle Tipo 1: Grade (Einstein) ──────────────────────────────
export interface AtributoPuzzle {
  chave: string
  nome: string
  valores: string[]
}
export interface SolucaoPosicao {
  posicao: number
  [atributo: string]: string | number
}
export interface PuzzleGrade {
  id: string
  tipo: 'grade'
  nivel: Nivel
  tema: string
  intro: string
  num_posicoes: number
  atributos: AtributoPuzzle[]
  pistas: string[]
  num_pistas: number
  solucao: SolucaoPosicao[]
  dicas?: string[]
}

// ── Puzzle Tipo 2: Detetive ───────────────────────────────────────
export interface PersonagemDetetive {
  nome: string
  emoji: string
  alibi: string
}
export interface PuzzleDetetive {
  id: string
  tipo: 'detetive'
  nivel: Nivel
  tema: string
  intro: string
  personagens: PersonagemDetetive[]
  metodos: string[]
  locais: string[]
  pistas: string[]
  solucao: { culpado: string; metodo: string; local: string }
  explicacao: string
}

// ── Puzzle Tipo 3: Sequência ──────────────────────────────────────
export interface PuzzleSequencia {
  id: string
  tipo: 'sequencia'
  nivel: Nivel
  tema: string
  intro: string
  itens: string[]
  pistas: string[]
  solucao: string[]
  explicacao: string
}

// ── Puzzle Tipo 4: Quem Mentiu? ───────────────────────────────────
export interface PersonagemMentiu {
  nome: string
  emoji: string
  declaracoes: string[]
}
export interface PuzzleMentiu {
  id: string
  tipo: 'mentiu'
  nivel: Nivel
  tema: string
  intro: string
  personagens: PersonagemMentiu[]
  mentiroso: string
  explicacao: string
}

// ── Puzzle Tipo 5: Código Secreto ─────────────────────────────────
export interface PuzzleCodigo {
  id: string
  tipo: 'codigo'
  nivel: Nivel
  tema: string
  intro: string
  num_digitos: number
  tipo_codigo: 'numerico' | 'palavra'
  pistas: string[]
  solucao: string
  explicacao: string
}

// ── Union type ────────────────────────────────────────────────────
export type Puzzle = PuzzleGrade | PuzzleDetetive | PuzzleSequencia | PuzzleMentiu | PuzzleCodigo

// Legado: sem tipo definido (puzzles antigos migrados)
export type PuzzleLegado = Omit<PuzzleGrade, 'tipo' | 'intro'> & { tipo?: 'grade'; intro?: string }

// ── Questão de Concurso (CQ) ──────────────────────────────────────
export interface Alternativas { A: string; B: string; C: string; D: string; E?: string }
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
  dicas?: string[]
}

// ── Estados de jogo ───────────────────────────────────────────────
export interface GridState {
  [posicao: number]: { [atributo: string]: string | null }
}
export type EstadoQuestao = 'respondendo' | 'errou' | 'acertou'
