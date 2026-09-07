'use client'

import { useEffect, useState } from 'react'
import { getStats, getTier, type GlobalStats } from '@/lib/stats'
import { isPremium } from '@/lib/freemium'
import { Trophy, Target, Zap, Flame, Lock, Users, BarChart2 } from 'lucide-react'

export default function RankingPage() {
  const [stats, setStats]     = useState<GlobalStats | null>(null)
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    setStats(getStats())
    setPremium(isPremium())
  }, [])

  if (!stats) return null

  const tier = getTier(stats.pontuacao)
  const pctSemDicas = stats.totalResolvidos > 0
    ? Math.round((stats.totalSemDicas / stats.totalResolvidos) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Seu desempenho</h1>
        <p className="text-gray-500 mt-1">Acompanhe sua evolução no raciocínio lógico.</p>
      </div>

      {/* Pontuação principal */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm">Pontuação total</p>
            <p className="text-5xl font-black mt-1">{stats.pontuacao.toLocaleString('pt-BR')}</p>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${tier.cor}`}>
            {tier.label}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-black">{stats.totalResolvidos}</p>
            <p className="text-white/70 text-xs mt-0.5">Resolvidos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">{pctSemDicas}%</p>
            <p className="text-white/70 text-xs mt-0.5">Sem dicas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black">{stats.melhorSequencia}</p>
            <p className="text-white/70 text-xs mt-0.5">Melhor série</p>
          </div>
        </div>
      </div>

      {/* Stats detalhadas */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Target,   label: 'Puzzles',        value: stats.totalPuzzles,   cor: 'text-blue-600'   },
          { icon: BarChart2, label: 'Questões',       value: stats.totalQuestoes,  cor: 'text-purple-600' },
          { icon: Zap,      label: 'Sem dicas',       value: stats.totalSemDicas,  cor: 'text-amber-600'  },
          { icon: Flame,    label: 'Sequência atual', value: stats.sequenciaAtual, cor: 'text-red-500'    },
        ].map(({ icon: Icon, label, value, cor }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <Icon size={20} className={cor} />
            <div>
              <p className="text-xl font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela de pontuação */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
        <p className="font-semibold text-gray-800 mb-2">Como a pontuação funciona</p>
        <div className="flex justify-between"><span>Desafio resolvido</span><span className="font-bold text-gray-900">+100 pts</span></div>
        <div className="flex justify-between"><span>Sem usar nenhuma dica</span><span className="font-bold text-amber-700">+50 pts</span></div>
        <div className="flex justify-between"><span>Resolvido em menos de 2 min</span><span className="font-bold text-blue-700">+25 pts</span></div>
        <div className="border-t border-gray-200 mt-3 pt-3 space-y-1 text-xs text-gray-500">
          <div className="flex justify-between"><span>🟢 Iniciante</span><span>0 – 499 pts</span></div>
          <div className="flex justify-between"><span>🟡 Intermediário</span><span>500 – 1.999 pts</span></div>
          <div className="flex justify-between"><span>🔵 Avançado</span><span>2.000 – 4.999 pts</span></div>
          <div className="flex justify-between"><span>🟣 Expert</span><span>5.000+ pts</span></div>
        </div>
      </div>

      {/* Ranking global — em breve */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" />
          <h2 className="font-bold text-gray-900">Ranking global</h2>
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Em breve</span>
        </div>
        <div className="px-5 py-8 text-center space-y-2">
          <p className="text-gray-500 text-sm">O ranking global está a caminho.</p>
          <p className="text-gray-400 text-xs">Compare sua pontuação com outros usuários e suba de posição a cada desafio.</p>
        </div>
      </div>

      {/* Competir com amigos — premium */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users size={18} className="text-blue-500" />
          <h2 className="font-bold text-gray-900">Competir com amigos</h2>
          {!premium && (
            <span className="ml-auto flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              <Lock size={10} /> Premium
            </span>
          )}
        </div>
        <div className="px-5 py-8 text-center space-y-3">
          {premium ? (
            <p className="text-gray-400 text-sm">Grupos de amigos em breve!</p>
          ) : (
            <>
              <p className="text-gray-600 text-sm">Crie um grupo privado, convide amigos e vejam quem resolve mais desafios na semana.</p>
              <button
                onClick={() => window.open('mailto:app.usemia@gmail.com?subject=[LogicaMente] Quero ser Premium')}
                className="px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Assinar Premium →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
