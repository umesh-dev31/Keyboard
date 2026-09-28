import { useEffect, useState } from 'react'

const NAV_LINKS = [
  ['Feel',  '#section-feel'],
  ['RGB',   '#section-rgb'],
  ['Build', '#section-build'],
  ['Sound', '#section-sound'],
  ['Story', '#section-story'],
]

const SECTION_IDS = ['section-hero', 'section-feel', 'section-rgb', 'section-build', 'section-sound', 'section-story']

/** Navbar — transparent → blurred dark bar at scrollY > 40px.
 *  Active link underline in accent color, tracked by IntersectionObserver. */
export default function Navbar({ accent, accentHover, cream, variantName }) {
  const [scrolled, setScrolled]   = useState(false)
  const [activeId, setActiveId]   = useState('section-hero')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Active section via IntersectionObserver */
  useEffect(() => {
    const observers = []
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id) },
        { threshold: 0.3 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  const bg = scrolled
    ? 'rgba(20,20,18,0.75)'
    : 'transparent'

  return (
    <header
      className="fixed inset-x-0 top-0 z-30 transition-all duration-300"
      style={{
        background: bg,
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? `1px solid ${cream}14` : '1px solid transparent',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <a href="#section-hero" className="flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-sm font-bold"
            style={{
              borderColor: `${cream}38`,
              color: accent,
              boxShadow: `0 0 14px ${accent}30`,
              background: 'rgba(20,20,18,0.70)',
            }}
          >
            N
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-white">NOVA</span>
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 sm:inline">
            / {variantName}
          </span>
        </a>

        {/* Center nav links with active underline */}
        <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.22em] md:flex">
          {NAV_LINKS.map(([label, href]) => {
            const sectionId = href.replace('#', '')
            const isActive  = activeId === sectionId
            return (
              <a
                key={href}
                href={href}
                className="relative pb-1 transition-colors"
                style={{ color: isActive ? accent : '#a1a1aa' }}
              >
                {label}
                {/* Active underline */}
                <span
                  className="absolute bottom-0 left-0 right-0 h-px rounded-full transition-all duration-300"
                  style={{
                    background: accent,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                  }}
                />
              </a>
            )
          })}
        </nav>

        {/* Right CTA — bordered pill with arrow */}
        <a
          href="#section-story"
          className="inline-flex items-center gap-2 rounded-full border px-5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-all hover:scale-105"
          style={{
            borderColor: accent,
            color: accent,
            background: `${accent}0d`,
            boxShadow: `0 0 16px ${accent}28`,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = accent
            e.currentTarget.style.color = '#141412'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = `${accent}0d`
            e.currentTarget.style.color = accent
          }}
        >
          Pre-order — $189 <span aria-hidden>→</span>
        </a>
      </div>
    </header>
  )
}
