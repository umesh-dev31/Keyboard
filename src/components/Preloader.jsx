import { useEffect, useState } from 'react'

const R = 70
const CIRC = 2 * Math.PI * R // 439.82

/**
 * Preloader — real window.load progress tracked into an SVG ring.
 * strokeDasharray = circumference, strokeDashoffset = circumference * (1 - p/100).
 * Drawn as a keycap icon instead of a bicycle wheel. z-100 layer.
 */
export default function Preloader({ accent = '#22d3ee' }) {
  const [percent, setPercent] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let raf = 0
    let simulated = 0
    const tick = () => {
      // Ease toward 90% until window.load fires, then complete to 100%
      simulated = Math.min(simulated + Math.random() * 6, 90)
      setPercent((prev) => Math.max(prev, Math.floor(simulated)))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onLoad = () => {
      cancelAnimationFrame(raf)
      let p = 90
      const finish = setInterval(() => {
        p += 4
        setPercent(Math.min(p, 100))
        if (p >= 100) {
          clearInterval(finish)
          setTimeout(() => setDone(true), 450)
        }
      }, 40)
    }

    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad)
    // Safety: never trap the user behind the loader
    const t = setTimeout(() => setDone(true), 6000)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('load', onLoad)
      clearTimeout(t)
    }
  }, [])

  if (done) return null

  const offset = CIRC * (1 - percent / 100)

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500"
      style={{ opacity: percent >= 100 ? 0 : 1, pointerEvents: percent >= 100 ? 'none' : 'auto', background: '#141412' }}

    >
      <div className="relative h-48 w-48">
        <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
          <circle cx="90" cy="90" r={R} fill="none" stroke="#2a2a28" strokeWidth="6" />
          <circle
            cx="90"
            cy="90"
            r={R}
            fill="none"
            stroke={accent}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.2s ease-out, stroke 0.4s', filter: `drop-shadow(0 0 8px ${accent})` }}
          />
        </svg>
        {/* keycap icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl border-2 font-mono text-2xl font-semibold"
            style={{ borderColor: accent, color: accent, boxShadow: `0 0 24px ${accent}66, inset 0 0 12px ${accent}33` }}
          >
            N
          </div>
        </div>
      </div>
      <div className="overline-condensed mt-6 text-zinc-400">NOVA — Loading {percent}%</div>
    </div>
  )
}
