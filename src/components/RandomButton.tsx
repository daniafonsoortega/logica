'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Modo  = 'puzzle' | 'questao'
type Nivel = 'facil' | 'medio' | 'dificil' | 'expert'
type Tipo  = 'grade' | 'detetive' | 'sequencia' | 'mentiu' | 'codigo' | 'cifra'

interface Props {
  modo: Modo
  nivel?: Nivel
  tipo?: Tipo
  className?: string
  children: React.ReactNode
}

export default function RandomButton({ modo, nivel, tipo, className, children }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ modo })
      if (nivel) params.set('nivel', nivel)
      if (tipo)  params.set('tipo',  tipo)
      const res  = await fetch(`/api/random?${params}`)
      const data = await res.json()
      if (data.id) {
        router.push(modo === 'puzzle' ? `/puzzles/${data.id}` : `/questoes/${data.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}
      style={loading ? { opacity: 0.7 } : undefined}>
      {loading ? '⏳' : children}
    </button>
  )
}
