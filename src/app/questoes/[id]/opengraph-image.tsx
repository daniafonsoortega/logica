import { ImageResponse } from 'next/og'
import { allQuestoes } from '@/lib/data'

export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

const NIVEL_LABELS: Record<string, string> = {
  facil:   '⭐ Fácil',
  medio:   '⭐⭐ Médio',
  dificil: '⭐⭐⭐ Difícil',
  expert:  '⭐⭐⭐⭐ Expert',
}
const NIVEL_BG:   Record<string, string> = { facil:'#dcfce7', medio:'#fef9c3', dificil:'#fee2e2', expert:'#f3e8ff' }
const NIVEL_TEXT: Record<string, string> = { facil:'#166534', medio:'#854d0e', dificil:'#991b1b', expert:'#6b21a8' }

export default async function Image({ params }: { params: { id: string } }) {
  const q = allQuestoes.find(q => q.id === params.id)
  if (!q) return new Response('Not found', { status: 404 })

  const bg = NIVEL_BG[q.nivel]   ?? '#e0f2fe'
  const tc = NIVEL_TEXT[q.nivel] ?? '#0369a1'

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #6366f1 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: '60px 80px', position: 'relative',
      }}>
        {/* Top bar */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:8, background:'linear-gradient(90deg,#818cf8,#c084fc,#818cf8)', display:'flex' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>🧠</div>
          <span style={{ fontSize:28, fontWeight:800, color:'white', letterSpacing:'-0.02em' }}>MalhaMente</span>
        </div>

        {/* Label "Questão de Concurso" */}
        <div style={{ fontSize:20, color:'#a5b4fc', marginBottom:16, letterSpacing:'0.04em', fontWeight:500, display:'flex' }}>
          📋 Questão de Concurso
        </div>

        {/* Banca + Órgão + Ano */}
        <div style={{ fontSize: 36, fontWeight:900, color:'white', textAlign:'center', lineHeight:1.25, maxWidth:900, marginBottom:20, letterSpacing:'-0.02em', display:'flex' }}>
          {q.orgao} · {q.banca} {q.ano}
        </div>

        {/* Nivel badge + banca badge */}
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div style={{ background:bg, color:tc, padding:'8px 22px', borderRadius:999, fontSize:18, fontWeight:700, display:'flex' }}>
            {NIVEL_LABELS[q.nivel] ?? q.nivel}
          </div>
          <div style={{ background:'rgba(255,255,255,0.15)', color:'white', padding:'8px 22px', borderRadius:999, fontSize:18, fontWeight:600, display:'flex' }}>
            {q.banca}
          </div>
        </div>

        {/* URL */}
        <div style={{ position:'absolute', bottom:36, fontSize:15, color:'#a5b4fc', letterSpacing:'0.05em', display:'flex' }}>
          malha-mente.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
