import { Component, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import Scene from './Scene'
import useScrollCamera from './hooks/useScrollCamera'
import useSectionInView from './hooks/useSectionInView'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'

gsap.registerPlugin(ScrollTrigger)

import { VARIANTS } from './variants'
export { VARIANTS }

/* ─────────────────────── palette constants ──────────────────────────────── */
const ACCENT       = '#7B9EC4'
const ACCENT_HOVER = '#6B8CAE'
const CREAM        = '#F3EEE4'
const BG           = '#141412'

/* ─────────────────────── error boundary ────────────────────────────────── */
class SceneErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.error('[NOVA] 3D scene crashed:', err) }
  render() { return this.state.failed ? null : this.props.children }
}

/* ─────────────────────── primitives ────────────────────────────────────── */

/**
 * Section wrapper — every section after Hero uses this.
 * Scrim is a left-biased radial gradient panel (NOT position:absolute on the
 * section itself, which would fight grid/flex children). It's rendered as a
 * sibling div with pointer-events:none and position:absolute so it never
 * affects document flow of its siblings.
 */
export function Section({ id, children, className = '' }) {
  return (
    <section id={id} className={`relative flex min-h-screen w-full items-center ${className}`}>
      {/* Left-column scrim — keeps text legible over the 3D model */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 100% at 0% 50%, rgba(10,10,8,0.62) 0%, rgba(10,10,8,0.28) 58%, rgba(10,10,8,0.00) 100%)',
          zIndex: 0,
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-28">
        {children}
      </div>
    </section>
  )
}

export function Fade({ from = 'up', children, className = '', delay = 0 }) {
  const [ref, inView] = useSectionInView(0.45)
  const base   = 'transition-all duration-700 ease-out will-change-transform'
  const hidden = from === 'left' ? 'opacity-0 -translate-x-8'
               : from === 'right' ? 'opacity-0 translate-x-8'
               : 'opacity-0 translate-y-8'
  const shown  = 'opacity-100 translate-x-0 translate-y-0'
  return (
    <div ref={ref} className={`${base} ${inView ? shown : hidden} ${className}`}
         style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function Overline({ children }) {
  return <p className="overline-condensed mb-4" style={{ color: ACCENT }}>{children}</p>
}

/** Animated stat counter — used in RGB section. */
function Counter({ to, suffix = '', label }) {
  const [ref, inView] = useSectionInView(0.45)
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const dur = 1400
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1)
      setVal(Math.floor(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])
  return (
    /* Each counter lives in its own grid cell — left-aligned, self-contained */
    <div ref={ref} className="flex flex-col gap-2">
      <div
        className="font-display text-4xl font-bold leading-none md:text-5xl"
        style={{ color: ACCENT, textShadow: `0 0 24px ${ACCENT}44` }}
      >
        {val.toLocaleString()}{suffix}
      </div>
      <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </div>
    </div>
  )
}

/* ─────────────────────── LikeWidget (fixed, persists) ──────────────────── */
function LikeWidget() {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(214)
  const btnRef            = useRef(null)

  const toggle = () => {
    setLiked(l => !l)
    setCount(c => liked ? c - 1 : c + 1)
    if (btnRef.current) {
      gsap.fromTo(btnRef.current, { scale: 0.8 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' })
    }
  }

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      aria-label="Like this keyboard"
      className="fixed bottom-8 right-6 z-40 flex items-center gap-2 rounded-full border px-4 py-2.5 backdrop-blur-sm transition-all hover:scale-105"
      style={{
        background: 'rgba(20,20,18,0.85)',
        borderColor: liked ? `${ACCENT}88` : `${CREAM}20`,
        boxShadow: liked ? `0 0 20px ${ACCENT}44` : 'none',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? ACCENT : 'none'}
           stroke={liked ? ACCENT : '#71717a'} strokeWidth="2" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="font-mono text-[11px] tracking-[0.15em]"
            style={{ color: liked ? ACCENT : '#a1a1aa' }}>
        {count}
      </span>
    </button>
  )
}

/* ─────────────────────── Hero feature data ─────────────────────────────── */
const HERO_FEATURES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M8 12h8M12 8v8" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Hot-Swap Sockets',
    desc:  'Swap switches in seconds, no soldering.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <ellipse cx="12" cy="12" rx="10" ry="5"/>
        <path d="M12 7v10M2 12h20" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Gasket Mount',
    desc:  'Silicone isolation for a flexible, premium feel.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round"/>
      </svg>
    ),
    title: 'RGB Backlight',
    desc:  'Per-key south-facing LEDs, 16.8M colors.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Per-Key Programmable',
    desc:  'Full QMK/VIA support, unlimited layers.',
  },
]

/* ─────────────────────── Stat bar data ─────────────────────────────────── */
const STAT_ITEMS = [
  {
    id: 'hotswap',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    value: 'Hot-Swap',
    label: '5-Pin',
  },
  {
    id: 'switch',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round"/>
      </svg>
    ),
    value: 'Switches',
    label: 'Linear 45g',
  },
  {
    id: 'weight',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z"/>
        <rect x="4" y="7" width="16" height="14" rx="2"/>
      </svg>
    ),
    value: 'Weight',
    label: '780g',
  },
  {
    id: 'rgb',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeLinecap="round"/>
      </svg>
    ),
    value: 'Backlight',
    label: '16.8M',
  },
]

/* ═══════════════════════════════ APP ═══════════════════════════════════════ */
export default function App() {
  const [activeVariantIndex] = useState(0)
  const variant = VARIANTS[activeVariantIndex]

  /* 3D / camera — NOT TOUCHED */
  const { cameraState, emissiveState } = useScrollCamera()

  const headlineRef     = useRef(null)
  const heroBackdropRef = useRef(null)
  const heroFeaturesRef = useRef(null)
  const heroDotsRef     = useRef(null)

  /* ── Headline entrance ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headlineRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 })
    })
    return () => ctx.revert()
  }, [])

  /* ── Hero backdrop scroll fade ── */
  useEffect(() => {
    const onScroll = () => {
      const fade = 1 - window.scrollY / (window.innerHeight * 0.8)
      if (heroBackdropRef.current)
        heroBackdropRef.current.style.opacity = String(Math.max(0, Math.min(1, fade)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Force curve draw-on (unchanged) ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const path = document.querySelector('#force-curve-path')
      if (!path) return
      const len = 600
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      gsap.to(path, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: { trigger: '#section-feel', start: 'top 75%', end: 'center center', scrub: 1 },
      })
    })
    return () => ctx.revert()
  }, [])

  /* ── Hero elements fade out as user scrolls into section-feel ──
     Only animates elements that are purely in the hero viewport:
     the right feature column and dot pagination.
     The stat bar stays visible (it's in normal flow, not absolute). */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: '#section-feel',
          start: 'top 90%',
          end: 'top 40%',
          scrub: 0.6,
        },
      })
      if (heroFeaturesRef.current) tl.to(heroFeaturesRef.current, { opacity: 0, x: 16, duration: 1 }, 0)
      if (heroDotsRef.current)     tl.to(heroDotsRef.current,     { opacity: 0, y: 6,  duration: 1 }, 0)
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="relative min-h-screen text-zinc-100" style={{ background: BG }}>
      <Preloader accent={ACCENT} />
      <Navbar accent={ACCENT} accentHover={ACCENT_HOVER} cream={CREAM} variantName={variant.name} />

      {/* Persistent like widget */}
      <LikeWidget />

      {/* ── z-1 : hero backdrop (behind canvas) ── */}
      <div ref={heroBackdropRef} className="pointer-events-none fixed inset-0 z-[1]">
        <div
          className="absolute left-1/2 top-[28%] h-[480px] w-[780px] -translate-x-1/2 rounded-full blur-[150px]"
          style={{ backgroundColor: `${ACCENT}1e` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[32vh]"
          style={{ background: `linear-gradient(to top, ${CREAM}09 0%, transparent 70%)` }}
        />
        {/* Ghost wordmark — clamped to top 40vh via .ghost-text max-height */}
        <div
          className="ghost-text absolute inset-x-0 text-center"
          style={{ top: '4%', fontSize: '22vw', letterSpacing: '-0.05em' }}
        >
          ALFA 75
        </div>
      </div>

      {/* ── z-2 : fixed transparent 3D canvas ── */}
      <SceneErrorBoundary>
        <Scene activeVariantIndex={activeVariantIndex} cameraState={cameraState} emissiveState={emissiveState} />
      </SceneErrorBoundary>

      {/* ── z-10 : HTML scroll sections ── */}
      <div id="scroll-root" className="relative z-10">

        {/* ══════════════════════ 1. HERO ══════════════════════════════════ */}
        <section id="section-hero" className="relative flex min-h-screen w-full flex-col">
          {/* Left-column scrim */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 52% 100% at 0% 50%, rgba(10,10,8,0.60) 0%, rgba(10,10,8,0.20) 62%, rgba(10,10,8,0.00) 100%)',
              zIndex: 0,
            }}
          />

          {/* Main hero content */}
          <div className="relative z-10 flex flex-1 w-full max-w-7xl mx-auto px-6 pt-32 pb-4">

            {/* Left text column */}
            <div className="flex flex-col justify-center w-full md:max-w-[40%] gap-0">

              {/* Badge */}
              <Fade from="up">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-[10px] uppercase tracking-[0.28em] w-fit"
                  style={{ borderColor: `${CREAM}38`, color: ACCENT, background: `${ACCENT}0c` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
                  Limited First Run
                </span>
              </Fade>

              {/* Headline */}
              <h1
                ref={headlineRef}
                className="font-display mt-6 text-5xl font-bold leading-[1.02] tracking-tight md:text-[4.5rem] lg:text-[5.5rem]"
                style={{ opacity: 0 }}
              >
                <span className="block text-white">Type Like It</span>
                <span className="block" style={{ color: ACCENT, textShadow: `0 0 32px ${ACCENT}55` }}>
                  Matters.
                </span>
              </h1>

              <Fade from="up" delay={140}>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-zinc-400 md:text-base">
                  Gasket-mounted. Hot-swappable.<br />
                  Tuned for thock, built to last.
                </p>
              </Fade>

              {/* CTA row */}
              <Fade from="up" delay={240}>
                <div className="mt-7 flex items-center gap-3">
                  <a
                    href="#section-story"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.2em] transition-all hover:scale-105"
                    style={{ background: ACCENT, color: BG, boxShadow: `0 0 30px ${ACCENT}55` }}
                    onMouseEnter={e => { e.currentTarget.style.background = ACCENT_HOVER }}
                    onMouseLeave={e => { e.currentTarget.style.background = ACCENT }}
                  >
                    Pre-order Alfa 75 <span aria-hidden>→</span>
                  </a>
                  <button
                    aria-label="View spec sheet"
                    className="flex h-11 w-11 items-center justify-center rounded-full border transition-all hover:bg-white/5"
                    style={{ borderColor: `${CREAM}28`, color: CREAM }}
                  >
                    <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor">
                      <path d="M0 0l12 7-12 7V0z" />
                    </svg>
                  </button>
                </div>
              </Fade>

              {/* Mobile-only feature list */}
              <Fade from="up" delay={320} className="mt-6 md:hidden">
                <ul className="space-y-1.5 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {HERO_FEATURES.map(f => (
                    <li key={f.title} className="flex items-center gap-2">
                      <span style={{ color: ACCENT }}>▸</span> {f.title}
                    </li>
                  ))}
                </ul>
              </Fade>
            </div>

            {/* Right feature column — desktop only, fades as user scrolls away */}
            <div
              ref={heroFeaturesRef}
              className="hidden md:flex flex-col justify-center absolute right-0 top-1/2 -translate-y-1/2 w-[256px] lg:w-[272px]"
            >
              {HERO_FEATURES.map((f, i) => (
                <div key={f.title}>
                  <div className="flex items-start gap-3 py-4">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                      style={{ borderColor: `${ACCENT}44`, color: ACCENT, background: `${ACCENT}0d` }}
                    >
                      {f.icon}
                    </span>
                    <div>
                      <p className="font-display text-sm font-semibold text-white">{f.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{f.desc}</p>
                    </div>
                  </div>
                  {i < HERO_FEATURES.length - 1 && (
                    <div className="w-full h-px" style={{ background: `${CREAM}10` }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Bottom: dot pagination + stat bar ── */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-10 mt-auto">
            {/* Dot pagination */}
            <div ref={heroDotsRef} className="mb-3 flex justify-center gap-2">
              {VARIANTS.map((_, i) => (
                <span
                  key={i}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === activeVariantIndex ? '22px' : '6px',
                    background: i === activeVariantIndex ? ACCENT : `${CREAM}28`,
                  }}
                />
              ))}
            </div>

            {/* Stat bar — normal flow, isolated from all other sections */}
            <div
              className="overflow-hidden rounded-2xl border"
              style={{
                background: 'rgba(20,20,18,0.90)',
                borderColor: `${CREAM}16`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
                {STAT_ITEMS.map(s => (
                  <div key={s.id} className="flex items-center gap-3 px-5 py-4">
                    <span style={{ color: ACCENT }}>{s.icon}</span>
                    <div>
                      <div className="font-display text-sm font-bold md:text-base" style={{ color: '#e4e4e7' }}>
                        {s.value}
                      </div>
                      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                        {s.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ 2. SWITCH FEEL ══════════════════════════════ */}
        {/*
          This section is entirely self-contained in normal document flow.
          The stat-morph absolute layer has been removed — it was the cause
          of "5-Pin" and "45g" text bleeding into this section.
          The force-curve card gets opacity 0.92 + backdrop-blur so nothing
          bleeds through from behind it.
        */}
        <Section id="section-feel">
          {/* Two-column layout: explicit gap so nothing stacks or overlaps */}
          <div className="grid items-center gap-16 md:grid-cols-2">

            {/* Left — text block */}
            <Fade from="left">
              <div className="flex flex-col gap-6">
                <Overline>01 — Switch Feel</Overline>
                <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  Tuned force curve
                </h2>
                <p className="max-w-md leading-relaxed text-zinc-400">
                  A 45g actuation with a rounded tactile bump at 1.8mm. Factory-lubed linear stems
                  glide — no scratch, no ping, just a deep, even press on every key.
                </p>
                <ul className="flex flex-col gap-2 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <li><span style={{ color: ACCENT }}>▸</span> Actuation — 45g @ 1.8mm</li>
                  <li><span style={{ color: ACCENT }}>▸</span> Bottom-out — 60g @ 3.6mm</li>
                  <li><span style={{ color: ACCENT }}>▸</span> Pre-lubed POM stem</li>
                </ul>
              </div>
            </Fade>

            {/* Right — force curve card. Background 0.92 opacity so nothing
                bleeds through from behind; backdrop-blur adds extra isolation. */}
            <Fade from="right">
              <div
                className="rounded-2xl border p-6"
                style={{
                  borderColor: `${CREAM}18`,
                  background: 'rgba(20,20,18,0.92)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: `0 0 40px ${ACCENT}14, 0 8px 32px rgba(0,0,0,0.5)`,
                }}
              >
                <svg viewBox="0 0 400 240" className="w-full">
                  {[40, 90, 140, 190].map(y => (
                    <line key={y} x1="40" y1={y} x2="380" y2={y} stroke="#27272a" strokeWidth="1" />
                  ))}
                  <line x1="40" y1="10" x2="40" y2="210" stroke="#3f3f46" strokeWidth="1.5" />
                  <line x1="40" y1="210" x2="380" y2="210" stroke="#3f3f46" strokeWidth="1.5" />
                  <text x="8" y="60"  fill="#71717a" fontSize="10" fontFamily="JetBrains Mono">60g</text>
                  <text x="8" y="140" fill="#71717a" fontSize="10" fontFamily="JetBrains Mono">45g</text>
                  <text x="330" y="228" fill="#71717a" fontSize="10" fontFamily="JetBrains Mono">travel →</text>
                  <path
                    id="force-curve-path"
                    d="M40,190 C90,185 120,140 160,132 C200,124 210,150 250,148 C300,146 330,110 370,105"
                    fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 5px ${ACCENT}88)` }}
                  />
                  <circle cx="160" cy="132" r="4" fill={ACCENT} />
                  <text x="172" y="120" fill={ACCENT} fontSize="11" fontFamily="JetBrains Mono">actuation</text>
                </svg>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Actuation force vs key travel
                </p>
              </div>
            </Fade>
          </div>
        </Section>

        {/* ══════════════════ 3. RGB & SOFTWARE ═══════════════════════════ */}
        {/*
          Counter grid: explicit grid-cols-4 with gap-10 so numbers never
          collide. Each Counter renders in its own isolated grid cell.
        */}
        <Section id="section-rgb">
          <Fade from="up">
            <Overline>02 — RGB &amp; Software</Overline>
            <h2 className="font-display max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
              Backlight that{' '}
              <span style={{ color: ACCENT, textShadow: `0 0 24px ${ACCENT}66` }}>turns on</span>
              {' '}as you scroll
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-zinc-400">
              South-facing shine-through, per-key addressable. Scroll deeper and the board lights
              up behind this copy — emissive intensity rides the scroll progress.
            </p>
          </Fade>

          {/*
            Grid with explicit column sizing and generous gap.
            Each counter is left-aligned in its own cell.
          */}
          <div
            className="mt-14"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2.5rem',
            }}
          >
            <Counter to={16}   suffix="M"  label="RGB colors / key" />
            <Counter to={8000} suffix="Hz" label="Polling rate" />
            <Counter to={128}  suffix=""   label="Keys programmable" />
            <Counter to={100}  suffix="%"  label="N-key rollover" />
          </div>

          <Fade from="up" delay={200}>
            <div
              className="mt-10 h-20 rounded-2xl border"
              style={{
                borderColor: `${ACCENT}44`,
                background: `linear-gradient(90deg, ${ACCENT}00, ${ACCENT}3a, ${ACCENT}00)`,
                boxShadow: `0 0 40px ${ACCENT}44`,
              }}
            />
          </Fade>
        </Section>

        {/* ══════════════════ 4. BUILD QUALITY ════════════════════════════ */}
        <Section id="section-build">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <Fade from="left">
              <div className="flex flex-col gap-5">
                <Overline>03 — Build Quality</Overline>
                <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  Gasket-mounted tank
                </h2>
                <p className="max-w-md leading-relaxed text-zinc-400">
                  CNC aluminium case, flex-cut PC plate, five layers of dampening. The model holds
                  still center-frame while these callouts point at it.
                </p>
              </div>
            </Fade>
            <div className="flex flex-col gap-4">
              {[
                ['Gasket mount',       'Silicone gaskets isolate plate from case — soft, even bottom-out.'],
                ['Hot-swap sockets',   'Kailh sockets, 5-pin support. Swap switches with zero solder.'],
                ['Screw-in stabilizers','Clipped, lubed, holee-modded. Silent spacebar, guaranteed.'],
              ].map(([t, d], i) => (
                <Fade key={t} from="right" delay={i * 120}>
                  <div
                    className="flex gap-5 rounded-2xl border p-5"
                    style={{
                      borderColor: `${CREAM}14`,
                      background: 'rgba(20,20,18,0.90)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                    }}
                  >
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <span className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: ACCENT, boxShadow: `0 0 8px ${ACCENT}88` }} />
                      <span className="mt-1 w-px flex-1"
                            style={{ background: `linear-gradient(${ACCENT}55, transparent)` }} />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-semibold">{t}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{d}</p>
                    </div>
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </Section>

        {/* ══════════════════ 5. TYPING SOUND ═════════════════════════════ */}
        <Section id="section-sound">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <Fade from="left"><Waveform /></Fade>
            <Fade from="right">
              <div className="flex flex-col gap-5">
                <Overline>04 — Typing Sound</Overline>
                <h2 className="font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  Deep thock, zero ping
                </h2>
                <p className="max-w-md leading-relaxed text-zinc-400">
                  Tape-modded PCB, case foam, PE sheet. The sound profile sits low and marbly —
                  <span className="text-zinc-200"> clack on top, thock underneath</span>.
                </p>
                <div className="flex gap-3 font-mono text-[11px] uppercase tracking-[0.2em]">
                  <span className="rounded-full border px-4 py-1.5"
                        style={{ borderColor: `${ACCENT}55`, color: ACCENT }}>Thock 78%</span>
                  <span className="rounded-full border px-4 py-1.5 text-zinc-400"
                        style={{ borderColor: `${CREAM}22` }}>Clack 22%</span>
                </div>
              </div>
            </Fade>
          </div>
        </Section>

        {/* ══════════════════ 6. STORY + CTA ══════════════════════════════ */}
        <Section id="section-story">
          <div className="text-center flex flex-col items-center gap-6">
            <Fade from="up">
              <Overline>05 — Story</Overline>
              <h2 className="font-display mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
                Built by typists, for typists
              </h2>
              <p className="mx-auto mt-4 max-w-xl leading-relaxed text-zinc-400">
                NOVA started in a group-buy thread with one obsession: the perfect keystroke.
                Three years, eleven prototypes, one board that finally felt inevitable.
                This is it — in <span style={{ color: ACCENT }}>{variant.name}</span>.
              </p>
            </Fade>
            <Fade from="up" delay={200}>
              <div className="flex flex-col items-center gap-4 mt-4">
                <a
                  href="#section-hero"
                  className="inline-flex items-center gap-2 rounded-full px-12 py-4 font-mono text-sm font-bold uppercase tracking-[0.22em] transition-all hover:scale-105"
                  style={{ background: ACCENT, color: BG, boxShadow: `0 0 48px ${ACCENT}55` }}
                  onMouseEnter={e => { e.currentTarget.style.background = ACCENT_HOVER }}
                  onMouseLeave={e => { e.currentTarget.style.background = ACCENT }}
                >
                  Pre-order {variant.name} — $189 <span aria-hidden>→</span>
                </a>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Ships Q1 · 2-year warranty · 30-day returns
                </p>
              </div>
            </Fade>
          </div>
        </Section>

        <footer
          className="border-t py-10 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-600"
          style={{ borderColor: `${CREAM}12` }}
        >
          NOVA Keyboards © 2026 — Type Like It Matters
        </footer>

      </div>{/* /scroll-root */}
    </div>
  )
}

/* ─── Waveform ───────────────────────────────────────────────────────────── */
function Waveform() {
  const [ref, inView] = useSectionInView(0.45)
  const bars = [14, 26, 40, 58, 44, 70, 92, 64, 48, 78, 98, 72, 52, 84, 60, 36, 68, 90, 56, 30, 46, 66, 38, 20]
  return (
    <div
      ref={ref}
      className="rounded-2xl border p-8"
      style={{
        borderColor: `${CREAM}14`,
        background: 'rgba(20,20,18,0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div className="flex h-40 items-center justify-center gap-1.5">
        {bars.map((h, i) => (
          <span
            key={i}
            className="w-2 rounded-full transition-all duration-700 ease-out"
            style={{
              height: inView ? `${h * 1.4}px` : '6px',
              opacity: inView ? 1 : 0.25,
              transitionDelay: `${i * 40}ms`,
              backgroundColor: i % 4 === 1 ? ACCENT : '#3a3a38',
              boxShadow: i % 4 === 1 ? `0 0 8px ${ACCENT}88` : 'none',
            }}
          />
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        Sound profile — {inView ? 'revealed' : 'listening…'}
      </p>
    </div>
  )
}
