import { ImageResponse } from 'next/og'
import { allPuzzles } from '@/lib/data'

// Sem edge runtime — usa Node.js serverless para evitar limite de bundle com JSON grande
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

const TIPO_LABELS: Record<string, string> = {
  grade:     '🔍 Einstein Grid',
  detetive:  '🕵️ Detetive',
  sequencia: '📅 Sequência',
  mentiu:    '🎭 Quem Mentiu?',
  codigo:    '🔐 Código Secreto',
  cifra:     '🔑 Cifra',
}

const NIVEL_LABELS: Record<string, string> = {
  facil:   '⭐ Fácil',
  medio:   '⭐⭐ Médio',
  dificil: '⭐⭐⭐ Difícil',
  expert:  '⭐⭐⭐⭐ Expert',
}

const NIVEL_BG: Record<string, string> = {
  facil:   '#dcfce7',
  medio:   '#fef9c3',
  dificil: '#fee2e2',
  expert:  '#f3e8ff',
}

const NIVEL_TEXT: Record<string, string> = {
  facil:   '#166534',
  medio:   '#854d0e',
  dificil: '#991b1b',
  expert:  '#6b21a8',
}

export default async function Image({ params }: { params: { id: string } }) {
  const puzzle = allPuzzles.find(p => p.id === params.id)
  if (!puzzle) return new Response('Not found', { status: 404 })

  const tipo  = puzzle.tipo ?? 'grade'
  const nivel = puzzle.nivel
  const bg    = NIVEL_BG[nivel]   ?? '#e0f2fe'
  const tc    = NIVEL_TEXT[nivel] ?? '#0369a1'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 55%, #3b82f6 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px 80px',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 8,
          background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)',
          display: 'flex',
        }} />

        {/* Logo row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 28,
        }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
          }}>
            🧠
          </div>
          <span style={{
            fontSize: 32,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
          }}>
            MalhaMente
          </span>
        </div>

        {/* Puzzle type */}
        <div style={{
          fontSize: 22,
          color: '#93c5fd',
          marginBottom: 20,
          letterSpacing: '0.04em',
          fontWeight: 500,
          display: 'flex',
        }}>
          {TIPO_LABELS[tipo] ?? tipo}
        </div>

        {/* Puzzle title */}
        <div style={{
          fontSize: puzzle.tema.length > 40 ? 44 : 54,
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: 900,
          marginBottom: 36,
          letterSpacing: '-0.02em',
          display: 'flex',
        }}>
          {puzzle.tema}
        </div>

        {/* Level badge */}
        <div style={{
          background: bg,
          color: tc,
          padding: '10px 28px',
          borderRadius: 999,
          fontSize: 20,
          fontWeight: 700,
          display: 'flex',
        }}>
          {NIVEL_LABELS[nivel] ?? nivel}
        </div>

        {/* Bottom URL */}
        <div style={{
          position: 'absolute',
          bottom: 36,
          fontSize: 16,
          color: '#7dd3fc',
          letterSpacing: '0.05em',
          display: 'flex',
        }}>
          malha-mente.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
