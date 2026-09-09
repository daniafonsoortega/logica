'use client'
import { useState, useEffect } from 'react'

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushSubscribe() {
  const [state, setState] = useState<'idle' | 'subscribed' | 'denied' | 'loading'>('idle')

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') setState('subscribed')
    if (Notification.permission === 'denied') setState('denied')
  }, [])

  async function subscribe() {
    if (!('serviceWorker' in navigator) || !VAPID_PUBLIC) return
    setState('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const sub = existing ?? await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setState('subscribed')
    } catch {
      setState('idle')
    }
  }

  if (state === 'subscribed') return (
    <p className="text-xs text-green-600 font-medium">🔔 Notificações ativas</p>
  )
  if (state === 'denied') return null

  return (
    <button
      onClick={subscribe}
      disabled={state === 'loading'}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50"
    >
      {state === 'loading' ? '...' : '🔔 Ativar notificações'}
    </button>
  )
}
