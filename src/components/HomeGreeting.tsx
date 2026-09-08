'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function HomeGreeting() {
  const [nome, setNome] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      const meta = data.user.user_metadata ?? {}
      const n = (meta.full_name ?? meta.name ?? data.user.email?.split('@')[0] ?? '').trim()
      setNome(n || null)
    })
  }, [])

  if (!nome) return null

  return (
    <p className="text-lg text-gray-600 font-medium">
      Olá, <span className="text-blue-600 font-semibold">{nome.split(' ')[0]}</span>! 👋
    </p>
  )
}
