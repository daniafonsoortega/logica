'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { getStats, getTier, type GlobalStats } from '@/lib/stats'
import { isPremium } from '@/lib/freemium'
import BestTimesSection from '@/components/BestTimesSection'
import { Trophy, Target, Zap, Flame, Lock, Users, BarChart2, Camera, Check, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

const GENEROS = ['Prefiro não dizer', 'Feminino', 'Masculino', 'Não-binário', 'Outro']

// ── Componente de perfil ─────────────────────────────────────────
function PerfilSection({ user }: { user: User }) {
  const meta = user.user_metadata ?? {}

  const [nome,    setNome]    = useState<string>(meta.full_name ?? meta.name ?? '')
  const [genero,  setGenero]  = useState<string>(meta.genero   ?? 'Prefiro não dizer')
  const [idade,   setIdade]   = useState<string>(meta.idade    ?? '')
  const [cidade,  setCidade]  = useState<string>(meta.cidade   ?? '')
  const [avatar,  setAvatar]  = useState<string>(meta.avatar_url ?? '')
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [errMsg,  setErrMsg]  = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const initials = nome
    ? nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
    : user.email?.slice(0, 2).toUpperCase() ?? '??'

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErrMsg(null)

    const form = new FormData()
    form.append('file', file)
    form.append('userId', user.id)

    const res  = await fetch('/api/upload-avatar', { method: 'POST', body: form })
    const data = await res.json()

    if (!res.ok || data.error) {
      setErrMsg(data.error ?? 'Erro ao enviar foto.')
    } else {
      setAvatar(data.url + '?t=' + Date.now()) // cache-bust
    }
    setUploading(false)
  }

  async function salvar() {
    setSaving(true)
    setSaved(false)
    setErrMsg(null)
    const { error } = await supabase.auth.updateUser({
      data: { full_name: nome, genero, idade, cidade, avatar_url: avatar },
    })
    if (error) setErrMsg(error.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    setSaving(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
      <h2 className="font-bold text-gray-900 text-lg">Meu perfil</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {avatar ? (
            <img src={avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-gray-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow disabled:opacity-50"
            title="Alterar foto"
          >
            {uploading ? (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera size={13} />
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div className="text-sm text-gray-500">
          <p className="font-medium text-gray-800">{nome || 'Sem nome'}</p>
          <p className="text-xs">{user.email}</p>
          <p className="text-xs mt-1 text-gray-400">JPG, PNG ou WEBP · máx. 2 MB</p>
        </div>
      </div>

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome ou apelido"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Gênero</label>
          <select
            value={genero}
            onChange={e => setGenero(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {GENEROS.map(g => <option key={g}>{g}</option>)}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Idade</label>
          <input
            type="number"
            value={idade}
            onChange={e => setIdade(e.target.value)}
            placeholder="Ex: 24"
            min={1} max={120}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600 mb-1 block">Cidade</label>
          <input
            type="text"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            placeholder="Ex: São Paulo, SP"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {errMsg && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <X size={12} /> {errMsg}
        </div>
      )}

      <button
        onClick={salvar}
        disabled={saving || uploading}
        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? (
          <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Salvando...</>
        ) : saved ? (
          <><Check size={14} /> Salvo!</>
        ) : (
          'Salvar perfil'
        )}
      </button>
    </div>
  )
}

// ── Página principal ─────────────────────────────────────────────
export default function RankingPage() {
  const [user,    setUser]    = useState<User | null>(null)
  const [stats,   setStats]   = useState<GlobalStats | null>(null)
  const [premium, setPremium] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setStats(getStats())
    setPremium(isPremium())
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  if (!stats) return null

  const tier = getTier(stats.pontuacao)
  const pctSemDicas = stats.totalResolvidos > 0
    ? Math.round((stats.totalSemDicas / stats.totalResolvidos) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Perfil &amp; Desempenho</h1>
        <p className="text-gray-500 mt-1">Acompanhe sua evolução e personalize seu perfil.</p>
      </div>

      <BestTimesSection />

      {/* Perfil — para todos */}
      {user ? (
        <PerfilSection user={user} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-gray-600 text-sm">Faça login para salvar seu perfil e acompanhar seu progresso.</p>
          <a href="/" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
            Entrar
          </a>
        </div>
      )}

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
          { icon: Target,    label: 'Puzzles',        value: stats.totalPuzzles,   cor: 'text-blue-600'   },
          { icon: BarChart2, label: 'Questões',        value: stats.totalQuestoes,  cor: 'text-purple-600' },
          { icon: Zap,       label: 'Sem dicas',       value: stats.totalSemDicas,  cor: 'text-amber-600'  },
          { icon: Flame,     label: 'Sequência atual', value: stats.sequenciaAtual, cor: 'text-red-500'    },
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
              <a
                href="/premium"
                className="inline-block px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Assinar Premium →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
