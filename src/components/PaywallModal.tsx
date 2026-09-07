'use client'

import { X, Zap, Infinity as InfinityIcon, BarChart2, Users } from 'lucide-react'

interface Props {
  onClose?: () => void
  reason?: 'daily_limit' | 'feature'
}

const PLANOS = [
  { label: 'Mensal', preco: 'R$12,90', periodo: '/mês', destaque: false },
  { label: 'Anual',  preco: 'R$89',    periodo: '/ano', destaque: true,
    economia: 'Economize 43%' },
]

const FEATURES = [
  { icon: InfinityIcon, text: 'Desafios ilimitados por dia' },
  { icon: Zap,          text: 'Sem anúncios' },
  { icon: BarChart2,    text: 'Histórico e estatísticas detalhadas' },
  { icon: Users,        text: 'Competir com amigos' },
]

export default function PaywallModal({ onClose, reason = 'daily_limit' }: Props) {
  const titulo = reason === 'daily_limit'
    ? 'Você usou seus 5 desafios de hoje'
    : 'Recurso exclusivo Premium'

  const subtitulo = reason === 'daily_limit'
    ? 'Volte amanhã ou desbloqueie acesso ilimitado agora.'
    : 'Assine o Premium para usar este recurso.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 px-6 pt-8 pb-10 text-white text-center space-y-1">
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
              <X size={20} />
            </button>
          )}
          <div className="text-3xl mb-2">⚡</div>
          <h2 className="text-xl font-black">{titulo}</h2>
          <p className="text-white/80 text-sm">{subtitulo}</p>
        </div>

        <div className="px-6 py-5 space-y-5 -mt-4">
          {/* Features */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-2.5">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-gray-700">
                <Icon size={16} className="text-blue-500 shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Planos */}
          <div className="grid grid-cols-2 gap-3">
            {PLANOS.map(p => (
              <button
                key={p.label}
                onClick={() => window.open('mailto:app.usemia@gmail.com?subject=[LogicaMente] Quero ser Premium&body=Olá! Tenho interesse no plano Premium ' + p.label + '.')}
                className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                  p.destaque
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {p.destaque && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {p.economia}
                  </span>
                )}
                <div className="text-sm font-semibold text-gray-600">{p.label}</div>
                <div className="text-2xl font-black text-gray-900 mt-1">{p.preco}</div>
                <div className="text-xs text-gray-400">{p.periodo}</div>
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-gray-400">
            Pagamento via Pix ou cartão · Cancele quando quiser
          </p>
        </div>
      </div>
    </div>
  )
}
