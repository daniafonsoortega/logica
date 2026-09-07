'use client'

import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

const TIPOS = [
  { value: 'erro_conteudo', label: 'Erro no conteúdo' },
  { value: 'bug_tecnico',   label: 'Bug técnico' },
  { value: 'sugestao',      label: 'Sugestão de melhoria' },
  { value: 'outro',         label: 'Outro' },
]

export default function ReportarProblema() {
  const [aberto, setAberto]       = useState(false)
  const [tipo, setTipo]           = useState('')
  const [descricao, setDescricao] = useState('')

  const fechar = () => {
    setAberto(false)
    setTipo('')
    setDescricao('')
  }

  const enviar = () => {
    const tipoLabel = TIPOS.find(t => t.value === tipo)?.label ?? tipo
    const assunto   = `[LogicaMente] ${tipoLabel}`
    const corpo     = `Tipo: ${tipoLabel}\n\n${descricao}`
    window.open(
      `mailto:app.usemia@gmail.com?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
    )
    fechar()
  }

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="text-gray-400 hover:text-gray-600 transition-colors text-sm underline underline-offset-2"
      >
        Reportar problema
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={fechar} />

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <AlertCircle size={18} className="text-orange-500" />
                Reportar problema
              </div>
              <button onClick={fechar} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="">Selecione...</option>
                  {TIPOS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  placeholder="Descreva o problema com o máximo de detalhes possível..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={fechar}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={enviar}
                disabled={!tipo || !descricao.trim()}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
