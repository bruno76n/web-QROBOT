import { Suspense, useEffect, useMemo, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { colorHex, letterTone, type MakerState } from '@/lib/customizer';

const FONT_URL = '/fonts/geist-bold.typeface.json';
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Shapes of the keychain, star and heart, all about 2 units wide (docs/11 §3). */
function makeShape(kind: MakerState['shape']): THREE.Shape {
  const s = new THREE.Shape();
  if (kind === 'llavero') {
    s.absarc(0, 0, 1, 0, Math.PI * 2, false);
  } else if (kind === 'estrella') {
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 1.05 : 0.46;
      const a = (i / (points * 2)) * Math.PI * 2 + Math.PI / 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) s.moveTo(x, y);
      else s.lineTo(x, y);
    }
    s.closePath();
  } else {
    s.moveTo(0, -1);
    s.bezierCurveTo(-1.5, -0.1, -1.2, 0.95, -0.55, 0.95);
    s.bezierCurveTo(-0.2, 0.95, 0, 0.7, 0, 0.45);
    s.bezierCurveTo(0, 0.7, 0.2, 0.95, 0.55, 0.95);
    s.bezierCurveTo(1.2, 0.95, 1.5, -0.1, 0, -1);
  }
  return s;
}

function Piece({ state }: { state: MakerState }) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(makeShape(state.shape), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
      curveSegments: 48,
    });
    g.translate(0, 0, -0.11);
    return g;
  }, [state.shape]);
  const top = state.shape === 'corazón' ? 1.0 : state.shape === 'llavero' ? 1.0 : 1.05;
  const size = Math.max(0.2, 0.55 - Math.max(0, state.name.length - 3) * 0.04);
  const lettersLight = letterTone(state.color) === 'light';
  return (
    <group>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={colorHex(state.color)} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* the ring the key chain goes through */}
      <mesh position={[0, top + 0.12, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.16, 0.045, 12, 32]} />
        <meshStandardMaterial color="#b8b8c2" roughness={0.3} metalness={0.7} />
      </mesh>
      <Suspense fallback={null}>
        <Center position={[0, state.shape === 'estrella' ? -0.08 : 0, 0.17]}>
          <Text3D font={FONT_URL} size={size} height={0.06} curveSegments={8} bevelEnabled={false}>
            {state.name || ' '}
            <meshStandardMaterial color={lettersLight ? '#ffffff' : '#121214'} roughness={0.5} />
          </Text3D>
        </Center>
      </Suspense>
    </group>
  );
}

function Scene({
  state,
  controlsRef,
}: {
  state: MakerState;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const [auto] = useState(() => !reduceMotion());
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[2.5, 3, 4]} intensity={2.2} />
      <directionalLight position={[-3, -1, 2]} intensity={0.6} />
      <Piece state={state} />
      {/* Only rotation: no zoom, no pan (docs/11 §3). No automatic spin with reduced motion. */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        autoRotate={auto}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={(Math.PI * 2) / 3}
      />
    </>
  );
}

type Subscribe = (listener: (s: MakerState) => void) => () => void;

function App({
  initial,
  subscribe,
  controls,
}: {
  initial: MakerState;
  subscribe: Subscribe;
  controls: React.RefObject<OrbitControlsImpl | null>;
}) {
  const [state, setState] = useState(initial);
  useEffect(() => subscribe(setState), [subscribe]);
  return (
    <Canvas camera={{ position: [0, 0, 4.4], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true }}>
      <Scene state={state} controlsRef={controls} />
    </Canvas>
  );
}

export interface MakerHandle {
  update: (s: MakerState) => void;
  turn: (dir: number) => void;
  destroy: () => void;
}

/** Mounts the 3D view into `container` (only called after someone touches the static view). */
export function mountMaker3D(container: HTMLElement, initial: MakerState): Promise<MakerHandle> {
  const controls: React.RefObject<OrbitControlsImpl | null> = { current: null };
  let listener: ((s: MakerState) => void) | null = null;
  const subscribe: Subscribe = (fn) => {
    listener = fn;
    return () => {
      listener = null;
    };
  };
  const root: Root = createRoot(container);
  root.render(<App initial={initial} subscribe={subscribe} controls={controls} />);
  // Resolve when the canvas exists, so the caller can swap views without a blank flash.
  return new Promise((resolve) => {
    const finish = () =>
      resolve({
        update: (s) => listener?.(s),
        // Button way to rotate, for people who cannot drag (docs/11 §7).
        turn: (dir) => {
          const c = controls.current;
          if (!c) return;
          c.setAzimuthalAngle(c.getAzimuthalAngle() + dir * 0.5);
          c.update();
        },
        destroy: () => root.unmount(),
      });
    const check = () =>
      container.querySelector('canvas') ? finish() : requestAnimationFrame(check);
    check();
  });
}
