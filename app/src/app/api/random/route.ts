import { NextRequest, NextResponse } from 'next/server'
import { getRandomPuzzle, getRandomQuestao } from '@/lib/data'
import type { Nivel } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const modo  = searchParams.get('modo')  ?? 'puzzle'
  const nivel = searchParams.get('nivel') as Nivel | null
  const tipo  = searchParams.get('tipo')  ?? undefined

  if (modo === 'questao') {
    const q = getRandomQuestao(nivel ?? undefined)
    return NextResponse.json({ id: q?.id ?? null })
  }

  const p = getRandomPuzzle(nivel ?? undefined, tipo)
  return NextResponse.json({ id: p?.id ?? null })
}
