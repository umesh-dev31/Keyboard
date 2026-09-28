# NOVA — Alfa 75

An interactive 3D product showcase for the NOVA Alfa 75 custom mechanical keyboard. Built with React, Three.js, React Three Fiber, and GSAP. A single high-fidelity 3D GLB model is rendered persistently on screen while page scroll drives the camera across six cinematic keyframes, seamlessly transitioning from macro switch views to full top-down layout perspectives.

---

## Live Repository

[https://github.com/umesh-dev31/Keyboard](https://github.com/umesh-dev31/Keyboard)

---

## Tech Stack

| Tool | Purpose |
|---|---|
| Vite 5 + React 18 | High-speed frontend build tooling and component tree |
| Three.js | WebGL 3D graphics rendering engine |
| @react-three/fiber | React declarative scene graph wrapper for Three.js |
| @react-three/drei | Helpers: useGLTF, Environment, PerspectiveCamera |
| GSAP + ScrollTrigger | Scroll-driven camera timeline interpolation and SVG path drawing |
| Tailwind CSS v4 | Utility-first styling via the Vite plugin |
| Leva | Real-time debug control panel for camera fine-tuning |

---

## Project Structure

```
NOVA/
  index.html                   HTML entry point with boot error probe
  vite.config.js               Vite configuration with React and Tailwind v4
  package.json                 Dependencies and npm scripts
  src/
    main.jsx                   Application mount and DOM bootstrap
    App.jsx                    Root composite page: all HTML sections, scrims, counters
    Scene.jsx                  Fixed transparent WebGL canvas and GLB model rig
    variants.js                Product variant registry and model configuration
    index.css                  Tailwind CSS tokens, typography, and dark theme
    components/
      Navbar.jsx               Fixed top navigation with variant indicator
      Preloader.jsx            SVG circular progress indicator tracking asset load
      DebugCameraPanel.jsx     Developer slider panel for tuning camera angles
    hooks/
      useScrollCamera.js       GSAP ScrollTrigger mapping scroll to 6 camera keyframes
      useSectionInView.js      IntersectionObserver hook for fluid section reveals
  public/
    models/
      keyboard-alfa75.glb      High-poly 3D Alfa 75 mechanical keyboard model
```

---

## How It Works

### Layer Composition

The interface relies on a strict z-index stacking model to allow the 3D keyboard model to sit seamlessly behind the text without clipping:

```
z-1    HeroBackdrop        Color glow blur, bottom gradient floor, and ghost wordmark
z-2    Scene / Canvas      3D keyboard model (alpha: true, transparent background)
z-10   HTML sections       Text columns, feature cards, force curve, spec table
z-30   Navbar              Fixed top navigation
z-40   LikeWidget          Persistent bottom-right like counter with micro-animation
z-100  Preloader           Asset loading screen
```

The canvas uses `position: fixed` with a transparent WebGL background. Each HTML section includes a left-biased radial gradient scrim (`pointer-events: none`) to guarantee readable text against the 3D model regardless of camera angle.

### Scroll-Driven Camera Rig

`useScrollCamera.js` defines six cinematic camera keyframes:

```js
export const CAMERA_KEYFRAMES = [
  { position: [2.5, 1.4, 3.0], fov: 28 },   // 1. Hero: top-angle full keyboard
  { position: [0.4, 0.6, 1.2], fov: 14 },   // 2. Close zoom on keycap row, telephoto
  { position: [-2.8, 0.9, 2.2], fov: 20 },  // 3. Side profile, case + switch stems
  { position: [1.2, -0.6, 1.0], fov: 26 },  // 4. Low angle, RGB backlight glow
  { position: [0.0, 2.2, 0.6], fov: 17 },   // 5. Top-down full layout
  { position: [2.5, 1.4, 3.0], fov: 28 },   // 6. Return to hero for final CTA
];
```

A single `ScrollTrigger` instance pinned to `#scroll-root` samples scroll progress (`0 -> 1`), normalizes it across the 5 segments, and smoothly blends camera position and field-of-view using `gsap.utils.interpolate()`.

The `CameraRig` component inside `useFrame` lerps the actual Three.js camera toward the interpolated target every frame, yielding smooth inertia.

### Dynamic RGB Backlight Tweening

When scrolling into the RGB section, `useScrollCamera` calculates an emissive intensity progress variable (`0 -> 2`). `Scene.jsx` traverses the model's materials and dynamically scales the emissive intensity of the keycap materials, causing the keyboard to illuminate on scroll.

### Accessibility and Reduced Motion

When `prefers-reduced-motion: reduce` is detected:
- Scroll scrub triggers are disabled.
- The camera is safely parked at the default hero keyframe.
- Backlight illumination is set to a static, balanced level.

---

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm, pnpm, or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/umesh-dev31/Keyboard.git
cd Keyboard
```

2. Install dependencies:
```bash
npm install
```

3. Launch development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

---

## Build and Production

To build the production bundle:

```bash
# Build the application
npm run build

# Preview the local production build
npm run preview
```

---

## Scripts

| Command | Action |
|---|---|
| npm run dev | Starts the Vite development server on port 5173 |
| npm run build | Compiles and minifies assets into dist/ |
| npm run preview | Serves the production build locally |

---

## License

This project is open source and available under the MIT License.
