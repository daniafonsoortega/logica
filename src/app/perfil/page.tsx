'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'
import { Save, LogOut, Trophy, Flame, CheckCircle2 } from 'lucide-react'
import AchievementsBadges from '@/components/AchievementsBadges'

type Profile = {
  nome?: string; idade?: number; cidade?: string; escolaridade?: string
  objetivo?: string; area_concurso?: string; nivel?: string; frequencia?: string
  notificacoes?: boolean; desafios_completos?: number; streak_atual?: number
  streak_max?: number; ultima_atividade?: string; created_at?: string
}

const ESCOLARIDADE_OPTS = ['Ensino Fundamental', 'Ensino Médio', 'Superior Incompleto', 'Superior Completo', 'Pós-graduação']
const OBJETIVO_OPTS     = ['Concurso Público', 'OAB', 'Vestibular / ENEM', 'Desenvolvimento pessoal', 'Lazer', 'Outro']
const AREA_OPTS         = ['Fiscal / Tributário', 'Policial / Segurança', 'Jurídico / Advocacia', 'Bancário', 'TI / Tecnologia', 'Saúde', 'Educação', 'Administrativo', 'Outro']
const NIVEL_OPTS        = ['Iniciante', 'Intermediário', 'Avançado']
const FREQ_OPTS         = ['Diária', '3× por semana', 'Final de semana', 'Casual']

export default function PerfilPage() {
  const [user, setUser]       = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function save() {
    if (!user) return
    setSaving(true)
    await supabase.from('profiles').upsert({ id: user.id, ...profile })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function signOut() { await supabase.auth.signOut(); window.location.href = '/' }
  function field(key: keyof Profile) { return (val: string | number | boolean) => setProfile(p => ({ ...p, [key]: val })) }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!user) return (
    <div className="max-w-md mx-auto py-24 text-center space-y-4">
      <div className="text-5xl">🔒</div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Acesso restrito</h1>
      <p className="text-gray-500">Você precisa estar logado para ver seu perfil.</p>
      <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors">Voltar ao início</a>
    </div>
  )

  const avatarUrl   = user.user_metadata?.avatar_url
  const displayName = profile.nome || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : ''

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white flex items-center gap-5">
        {avatarUrl
          ? <img src={avatarUrl} className="w-16 h-16 rounded-full border-2 border-white/40" alt="" />
          : <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-black">{displayName.slice(0,2).toUpperCase()}</div>
        }
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black truncate">{displayName}</h1>
          <p className="text-white/70 text-sm truncate">{user.email}</p>
          {memberSince && <p className="text-white/50 text-xs mt-0.5">Membro desde {memberSince}</p>}
        </div>
        <button onClick={signOut} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors">
          <LogOut size={15} /> Sair
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: CheckCircle2, label: 'Desafios', value: profile.desafios_completos ?? 0, color: 'text-blue-600' },
          { icon: Flame,        label: 'Streak',   value: `${profile.streak_atual ?? 0}d`, color: 'text-orange-500' },
          { icon: Trophy,       label: 'Recorde',  value: `${profile.streak_max ?? 0}d`,   color: 'text-yellow-500' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center shadow-sm">
            <Icon size={20} className={`${color} mx-auto mb-1`} />
            <div className="text-2xl font-black text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <AchievementsBadges />
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-6">
        <h2 className="font-bold text-gray-900 dark:text-white text-lg">Seus dados</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: 'nome' as const, label: 'Nome', placeholder: 'Como quer ser chamado', type: 'text' },
            { key: 'cidade' as const, label: 'Cidade', placeholder: 'Ex: São Paulo - SP', type: 'text' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
              <input type={type} value={(profile[key] as string) ?? ''} placeholder={placeholder}
                onChange={e => field(key)(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Idade</label>
            <input type="number" min={10} max={99} value={profile.idade ?? ''} placeholder="Ex: 28"
              onChange={e => field('idade')(Number(e.target.value))}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Escolaridade</label>
            <select value={profile.escolaridade ?? ''} onChange={e => field('escolaridade')(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Selecionar...</option>
              {ESCOLARIDADE_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Objetivo principal</label>
            <select value={profile.objetivo ?? ''} onChange={e => field('objetivo')(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Selecionar...</option>
              {OBJETIVO_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {(profile.objetivo === 'Concurso Público' || profile.objetivo === 'OAB') && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Área do concurso</label>
              <select value={profile.area_concurso ?? ''} onChange={e => field('area_concurso')(e.target.value)}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Selecionar...</option>
                {AREA_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nível atual</label>
            <div className="flex gap-2">
              {NIVEL_OPTS.map(o => (
                <button key={o} onClick={() => field('nivel')(o.toLowerCase())}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors
                    ${(profile.nivel ?? 'iniciante') === o.toLowerCase()
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300'}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Frequência de treino</label>
            <select value={profile.frequencia ?? 'diaria'} onChange={e => field('frequencia')(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              {FREQ_OPTS.map(o => <option key={o} value={o.toLowerCase().replace(/[×\s]+/g,'-')}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Lembrete diário</p>
            <p className="text-xs text-gray-400">Receba uma notificação para treinar todo dia</p>
          </div>
          <button onClick={() => field('notificacoes')(!profile.notificacoes)}
            className={`relative w-11 h-6 rounded-full transition-colors ${profile.notificacoes ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${profile.notificacoes ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saved ? <><CheckCircle2 size={16} /> Salvo!</>
            : saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Save size={16} /> Salvar perfil</>}
        </button>
      </div>
    </div>
  )
}
