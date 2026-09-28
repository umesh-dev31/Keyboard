import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * useScrollCamera — the core of the site.
 *
 * Exactly 6 camera keyframes as { position: [x,y,z], fov }.
 * All orbit/zoom around the SAME single static keyboard model —
 * no explode, no disassembly, just cinematic camera movement.
 *
 * One ScrollTrigger pinned to #scroll-root:
 *   trigger: top top, end: bottom bottom, scrub: 1
 * onUpdate reads self.progress (0→1), maps to segment (progress * 5),
 * uses gsap.utils.interpolate() to blend position/fov between the
 * two nearest keyframes. Result stored in a ref (NOT React state).
 */
export const CAMERA_KEYFRAMES = [
  { position: [2.5, 1.4, 3.0], fov: 28 },   // 1. Hero: top-angle full keyboard
  { position: [0.4, 0.6, 1.2], fov: 14 },   // 2. Close zoom on keycap row, telephoto
  { position: [-2.8, 0.9, 2.2], fov: 20 },  // 3. Side profile, case + switch stems
  { position: [1.2, -0.6, 1.0], fov: 26 },  // 4. Low angle, RGB backlight glow hero
  { position: [0.0, 2.2, 0.6], fov: 17 },   // 5. Top-down full layout
  { position: [2.5, 1.4, 3.0], fov: 28 },   // 6. Return to hero for final CTA
]

export default function useScrollCamera() {
  // Mutable render-loop state — never React state (avoids re-renders)
  const cameraState = useRef({
    position: [...CAMERA_KEYFRAMES[0].position],
    fov: CAMERA_KEYFRAMES[0].fov,
  })
  // 0 → 2 emissiveIntensity, driven by the RGB section progress
  const emissiveState = useRef({ intensity: 0, progress: 0 })

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      // Static layout: park camera on hero keyframe, backlight half-on
      cameraState.current = {
        position: [...CAMERA_KEYFRAMES[0].position],
        fov: CAMERA_KEYFRAMES[0].fov,
      }
      emissiveState.current = { intensity: 1.2, progress: 1 }
      return
    }

    const ctx = gsap.context(() => {
      // Core camera scrub — pinned to the #scroll-root wrapper
      ScrollTrigger.create({
        trigger: '#scroll-root',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress // 0 → 1
          const total = CAMERA_KEYFRAMES.length - 1 // 5 segments
          const seg = Math.min(Math.floor(p * total), total - 1)
          const local = p * total - seg
          const a = CAMERA_KEYFRAMES[seg]
          const b = CAMERA_KEYFRAMES[seg + 1]
          cameraState.current = {
            position: [
              gsap.utils.interpolate(a.position[0], b.position[0], local),
              gsap.utils.interpolate(a.position[1], b.position[1], local),
              gsap.utils.interpolate(a.position[2], b.position[2], local),
            ],
            fov: gsap.utils.interpolate(a.fov, b.fov, local),
          }
        },
      })

      // Emissive backlight reveal — driven by RGB section progress
      ScrollTrigger.create({
        trigger: '#section-rgb',
        start: 'top bottom',
        end: 'center center',
        scrub: 1,
        onUpdate: (self) => {
          const v = gsap.utils.interpolate(0, 2, self.progress)
          emissiveState.current = { intensity: v, progress: self.progress }
        },
      })
    })

    // Expose for DebugCameraPanel tuning
    window.__NOVA_CAMERA__ = cameraState
    window.__NOVA_EMISSIVE__ = emissiveState

    return () => {
      ctx.revert()
      delete window.__NOVA_CAMERA__
      delete window.__NOVA_EMISSIVE__
    }
  }, [])

  return { cameraState, emissiveState }
}
