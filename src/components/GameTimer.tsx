'use client'

// Shows elapsed time during a puzzle and records personal best on completion.
import { useEffect, useRef, useState } from 'react'
import { getBestTime, updateBestTime } from '@/lib/stats'

interface Props {
  puzzleId: string
  isComplete: boolean
  onTime?: (seconds: number) => void  // optional callback to pass time to parent
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}m ${String(sec).padStart(2,'0')}s` : `${String(sec).padStart(2,'0')}s`
}

export default function GameTimer({ puzzleId, isComplete, onTime }: Props) {
  const startRef    = useRef(Date.now())
  const [elapsed, setElapsed]   = useState(0)
  const [newBest,  setNewBest]  = useState(false)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const reportedRef = useRef(false)

  useEffect(() => {
    setBestTime(getBestTime(puzzleId))
  }, [puzzleId])

  useEffect(() => {
    if (isComplete) return  // stop counting
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [isComplete])

  // Record best time once on completion
  useEffect(() => {
    if (!isComplete || reportedRef.current) return
    reportedRef.current = true
    const t = Math.floor((Date.now() - startRef.current) / 1000)
    setElapsed(t)
    onTime?.(t)
    const isNew = updateBestTime(puzzleId, t)
    setNewBest(isNew)
    setBestTime(getBestTime(puzzleId))
  }, [isComplete, puzzleId, onTime])

  if (!isComplete) {
    return (
      <div className="flex items-center justify-end">
        <span className="font-mono text-xs text-gray-400 tabular-nums">
          ⏱ {fmt(elapsed)}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
      <span className="font-mono font-semibold text-gray-700">⏱ {fmt(elapsed)}</span>
      {newBest && (
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
          🏅 Novo recorde pessoal!
        </span>
      )}
      {!newBest && bestTime !== null && (
        <span className="text-gray-400 text-xs">
          Melhor: {fmt(bestTime)}
        </span>
      )}
    </div>
  )
}
