'use client'

// ── Tela de anúncio entre desafios ───────────────────────────────
// Exibida quando shouldShowAd() == true.
// Mostra um anúncio AdSense + botão "Continuar" que aparece após
// COUNTDOWN segundos (premium nunca chega aqui).
//
// Para ativar AdSense: substitua AD_SLOT pelo ID real do bloco criado
// em https://www.google.com/adsense/ → Anúncios → Por bloco.
// O pub ID já está preenchido abaixo.

import { useEffect, useRef, useState } from 'react'

const AD_CLIENT = 'ca-pub-1036537609242573'
const AD_SLOT   = 'XXXXXXXXXXXXXXXX'   // ← trocar pelo slot ID real
const COUNTDOWN = 5                     // segundos até liberar "Continuar"

interface Props {
  onContinue: () => void
}

export default function AdInterstitial({ onContinue }: Props) {
  const [seconds, setSeconds] = useState(COUNTDOWN)
  const adRef = useRef<HTMLDivElement>(null)
  const ready = seconds === 0

  // Countdown
  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  // Injetar AdSense
  useEffect(() => {
    if (typeof window === 'undefined' || !adRef.current) return

    // Evita duplicar o script
    if (!document.getElementById('adsense-script')) {
      const s = document.createElement('script')
      s.id  = 'adsense-script'
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`
      s.async = true
      s.crossOrigin = 'anonymous'
      document.head.appendChild(s)
    }

    // Push do bloco
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle.push({})
    } catch (_) { /* AdSense não carregou ainda */ }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 px-4">

      {/* Aviso */}
      <div className="w-full max-w-md space-y-5">
        <div className="text-center space-y-1">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pausa rápida</p>
          <p className="text-sm text-gray-500">
            Um anúncio mantém o LogicaMente gratuito. 🙏
          </p>
        </div>

        {/* Bloco de anúncio */}
        <div
          ref={adRef}
          className="w-full min-h-[250px] bg-white border border-gray-200 rounded-2xl flex items-center justify-center overflow-hidden"
        >
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: 250 }}
            data-ad-client={AD_CLIENT}
            data-ad-slot={AD_SLOT}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />

          {/* Fallback visual enquanto o slot não está configurado */}
          {AD_SLOT === 'XXXXXXXXXXXXXXXX' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 space-y-2 pointer-events-none">
              <span className="text-4xl">📢</span>
              <span className="text-xs">Espaço reservado para anúncio</span>
            </div>
          )}
        </div>

        {/* Botão continuar */}
        <div className="text-center space-y-2">
          {ready ? (
            <button
              onClick={onContinue}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors"
            >
              Continuar →
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-bold text-base cursor-not-allowed"
            >
              Continuar em {seconds}s
            </button>
          )}

          <p className="text-xs text-gray-400">
            Quer pular os anúncios?{' '}
            <a href="/premium" className="text-blue-600 hover:underline font-medium">
              Assine o Premium →
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
