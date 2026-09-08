// Sistema de conquistas/badges
// Avaliado após cada resultado — exibe notificação in-game

import { GlobalStats, GameResult } from './stats'

export interface Badge {
  id: string
  emoji: string
  titulo: string
  descricao: string
}

// Definição de todas as conquistas
export const TODAS_BADGES: Badge[] = [
  { id: 'primeiro_passo',    emoji: '🚀', titulo: 'Primeiro Passo',       descricao: 'Resolveu o primeiro desafio'                        },
  { id: 'sem_dicas_3',       emoji: '💡', titulo: 'Mente Pura',           descricao: 'Resolveu 3 desafios sem pedir dica'                 },
  { id: 'sem_dicas_10',      emoji: '🔦', titulo: 'Iluminado',            descricao: 'Resolveu 10 desafios sem pedir dica'                },
  { id: 'sequencia_5',       emoji: '🔥', titulo: 'Em Chamas',            descricao: '5 desafios corretos seguidos'                       },
  { id: 'sequencia_10',      emoji: '⚡', titulo: 'Imparável',            descricao: '10 desafios corretos seguidos'                      },
  { id: 'rapido_60',         emoji: '⏱️', titulo: 'Relâmpago',            descricao: 'Resolveu um desafio em menos de 1 minuto'           },
  { id: 'rapido_30',         emoji: '🏎️', titulo: 'Velocista',            descricao: 'Resolveu um desafio em menos de 30 segundos'        },
  { id: 'total_10',          emoji: '🧩', titulo: 'Viciado em Lógica',    descricao: 'Resolveu 10 desafios no total'                      },
  { id: 'total_50',          emoji: '🏅', titulo: 'Meio Centurião',       descricao: 'Resolveu 50 desafios no total'                      },
  { id: 'total_100',         emoji: '🏆', titulo: 'Centurião',            descricao: 'Resolveu 100 desafios no total'                     },
  { id: 'dificil_1',         emoji: '💪', titulo: 'Corajoso',             descricao: 'Resolveu o primeiro desafio difícil'                },
  { id: 'dificil_5',         emoji: '🔴', titulo: 'Caçador de Dificuldades', descricao: 'Resolveu 5 desafios difíceis ou expert'          },
  { id: 'detetive_5',        emoji: '🕵️', titulo: 'Detetive da Lógica',   descricao: 'Resolveu 5 casos de detetive'                      },
  { id: 'codigo_5',          emoji: '🔐', titulo: 'Mestre do Código',     descricao: 'Decifrou 5 códigos secretos'                       },
  { id: 'cifra_5',           emoji: '🔤', titulo: 'Criptógrafo',          descricao: 'Decifrou 5 cifras simbólicas'                      },
  { id: 'grade_10',          emoji: '🔍', titulo: 'Einstein Jr.',         descricao: 'Resolveu 10 grades de dedução'                     },
  { id: 'questoes_10',       emoji: '📝', titulo: 'Candidato Dedicado',   descricao: 'Respondeu 10 questões de concurso'                 },
  { id: 'pontos_500',        emoji: '⭐', titulo: 'Intermediário',        descricao: 'Atingiu 500 pontos'                                },
  { id: 'pontos_2000',       emoji: '🌟', titulo: 'Avançado',             descricao: 'Atingiu 2000 pontos'                               },
  { id: 'pontos_5000',       emoji: '👑', titulo: 'Expert',               descricao: 'Atingiu 5000 pontos — você está no topo!'          },
  { id: 'mente_brilhante',   emoji: '🧠', titulo: 'Mente Brilhante',      descricao: 'Resolveu um difícil/expert em menos de 1 minuto'   },
]

const BADGES_KEY = 'lm_badges'

export function getBadgesDesbloqueadas(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(BADGES_KEY) ?? '[]') } catch { return [] }
}

function salvarBadge(id: string) {
  const atual = getBadgesDesbloqueadas()
  if (!atual.includes(id)) {
    localStorage.setItem(BADGES_KEY, JSON.stringify([...atual, id]))
  }
}

// Avalia quais badges novos foram desbloqueados após um resultado
// Retorna array de badges NOVAS (para mostrar notificação)
export function avaliarBadges(stats: GlobalStats, result: GameResult): Badge[] {
  const jaDesbloqueadas = getBadgesDesbloqueadas()
  const novas: Badge[] = []

  function checar(id: string, condicao: boolean) {
    if (condicao && !jaDesbloqueadas.includes(id)) {
      const badge = TODAS_BADGES.find(b => b.id === id)
      if (badge) { salvarBadge(id); novas.push(badge) }
    }
  }

  const hist = stats.historico
  const tipo = result.tipo === 'puzzle'
    ? (hist.find(h => h.id === result.id) as any)?.tipoPuzzle ?? ''
    : 'questao'

  // Contagens por tipo (do histórico completo)
  const resolvidos = hist.filter(h => h.resolvido)
  const dificeis   = resolvidos.filter(h => (h as any).nivel === 'dificil' || (h as any).nivel === 'expert')

  checar('primeiro_passo',  stats.totalResolvidos >= 1)
  checar('sem_dicas_3',     stats.totalSemDicas >= 3)
  checar('sem_dicas_10',    stats.totalSemDicas >= 10)
  checar('sequencia_5',     stats.sequenciaAtual >= 5 || stats.melhorSequencia >= 5)
  checar('sequencia_10',    stats.sequenciaAtual >= 10 || stats.melhorSequencia >= 10)
  checar('rapido_60',       result.resolvido && result.tempoSegundos > 0 && result.tempoSegundos <= 60)
  checar('rapido_30',       result.resolvido && result.tempoSegundos > 0 && result.tempoSegundos <= 30)
  checar('total_10',        stats.totalResolvidos >= 10)
  checar('total_50',        stats.totalResolvidos >= 50)
  checar('total_100',       stats.totalResolvidos >= 100)
  checar('dificil_1',       dificeis.length >= 1)
  checar('dificil_5',       dificeis.length >= 5)
  checar('questoes_10',     stats.totalQuestoes >= 10)
  checar('pontos_500',      stats.pontuacao >= 500)
  checar('pontos_2000',     stats.pontuacao >= 2000)
  checar('pontos_5000',     stats.pontuacao >= 5000)
  checar('mente_brilhante', result.resolvido && result.tempoSegundos <= 60 && dificeis.some(h => h.id === result.id))

  return novas
}
