import { useEffect, useRef, useState } from 'react'

/**
 * useSectionInView — native IntersectionObserver, threshold 0.45.
 * Returns [ref, inView]. Powers <Fade /> reveals.
 */
export default function useSectionInView(threshold = 0.45) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          // keep visible once revealed (one-shot reveal like Surge)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, inView]
}
