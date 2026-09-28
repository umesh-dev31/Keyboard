import { Suspense, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { VARIANTS } from './variants'

// Preload the keyboard model up-front
VARIANTS.forEach((v) => useGLTF.preload(v.model))

/* ---------------------------------- rig ---------------------------------- */

function CameraRig({ cameraState }) {
  const target = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera }) => {
    // Debug override (DebugCameraPanel "apply") wins over scroll state.
    // ScrollTrigger keeps writing cameraState.current underneath, so the
    // override must be consulted every frame — not just once on toggle.
    const override = window.__NOVA_CAM_OVERRIDE__
    const s = override && override.active ? override : cameraState.current
    if (!s) return
    target.set(s.position[0], s.position[1], s.position[2])
    // Smooth cinematic motion: lerp 0.08 per frame
    camera.position.lerp(target, 0.08)
    camera.fov = THREE.MathUtils.lerp(camera.fov, s.fov, 0.08)
    camera.updateProjectionMatrix()
    camera.lookAt(0, 0, 0)
  })
  return null
}

/* ------------------------------ keyboard model ---------------------------- */

function NormalizedKeyboard({ modelUrl, accent, emissiveState }) {
  const group = useRef()
  const { scene } = useGLTF(modelUrl)
  const emissives = useRef([])

  const clone = useMemo(() => scene.clone(true), [scene])

  // Auto-normalize scale using a Box3 bounding box so the model
  // renders at a consistent, well-framed size.
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clone)
    const size = new THREE.Vector3()
    box.getSize(size)
    const longest = Math.max(size.x, Math.max(size.y, size.z)) || 1
    const TARGET = 2.4 // world units — well-framed in the hero shot
    return TARGET / longest
  }, [clone])

  useLayoutEffect(() => {
    // Center on origin
    const box = new THREE.Box3().setFromObject(clone)
    const center = new THREE.Vector3()
    box.getCenter(center)
    clone.position.sub(center)

    // Traverse the loaded GLB scene to find materials with an emissive
    // property — the RGB keycaps — and collect them for the backlight tween.
    emissives.current = []
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = false
        o.receiveShadow = false
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        mats.forEach((m) => {
          if (m && m.emissive) {
            // Seed an emissive tint so intensity tweens are visible
            if (m.emissiveIntensity === 0 || m.emissiveIntensity === undefined) {
              try {
                m.emissive = new THREE.Color(accent)
              } catch {
                /* noop */
              }
            }
            m.emissiveIntensity = 0
            emissives.current.push(m)
          }
        })
      }
    })
  }, [clone, accent])

  // Scroll-driven backlight: tween emissiveIntensity 0 → 2
  useFrame(() => {
    const v = emissiveState?.current?.intensity ?? 0
    for (const m of emissives.current) {
      if (m && m.emissive) m.emissiveIntensity = v
    }
  })

  return (
    <group ref={group} scale={scale} rotation={[0, -0.35, 0]}>
      <primitive object={clone} />
    </group>
  )
}

// Error boundary: renders nothing (transparent canvas = page still works)
// and logs loudly so a missing GLB can never silently look "fine".
import { Component } from 'react'
class ModelBoundary extends Component {
  constructor(p) {
    super(p)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err) {
    // eslint-disable-next-line no-console
    console.error('[NOVA] failed to load keyboard GLB:', this.props.modelUrl, err)
  }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

/* --------------------------------- scene ---------------------------------- */

export default function Scene({ activeVariantIndex, cameraState, emissiveState }) {
  const variant = VARIANTS[activeVariantIndex]
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      camera={{ position: [2.5, 1.4, 3.0], fov: 28 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    >
      <CameraRig cameraState={cameraState} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 4]} intensity={1.4} />
      <directionalLight position={[-4, 3, -3]} intensity={0.4} />
      <pointLight position={[0, -0.5, 1.5]} color={new THREE.Color(variant.color)} intensity={1.1} distance={7} />
      <Suspense fallback={null}>
        <ModelBoundary modelUrl={variant.model}>
          <NormalizedKeyboard
            modelUrl={variant.model}
            accent={variant.color}
            emissiveState={emissiveState}
          />
        </ModelBoundary>
      </Suspense>
    </Canvas>
  )
}
