'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

const PATH_SEGMENTS = 320;
const RADIAL_SEGMENTS = 32;
const TUBE_RADIUS = 0.16;

// Five color stops for a smoother brand gradient than three.
const STOPS: [number, THREE.Color][] = [
  [0.0, new THREE.Color('#5d6fff')],
  [0.25, new THREE.Color('#7a72ff')],
  [0.5, new THREE.Color('#a35dff')],
  [0.75, new THREE.Color('#7e95ff')],
  [1.0, new THREE.Color('#5dc7ff')],
];

const HDR_BOOST = 1.45;

class InfinityCurveClass extends THREE.Curve<THREE.Vector3> {
  public constructor() {
    super();
  }
  override getPoint(t: number): THREE.Vector3 {
    const angle = t * Math.PI * 2;
    const x = 1.4 * Math.sin(angle);
    const y = 0.65 * Math.sin(angle * 2);
    return new THREE.Vector3(x, y, 0);
  }
}

function colorAt(t: number, out: THREE.Color): void {
  for (let i = 0; i < STOPS.length - 1; i++) {
    const [t0, c0] = STOPS[i];
    const [t1, c1] = STOPS[i + 1];
    if (t >= t0 && t <= t1) {
      const local = (t - t0) / (t1 - t0);
      out.copy(c0).lerp(c1, local);
      return;
    }
  }
  out.copy(STOPS[STOPS.length - 1][1]);
}

function InfinityMesh() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    // Slower, gentler motion so the mesh stays well within frustum.
    ref.current.rotation.z = Math.sin(t * 0.15) * 0.08;
    ref.current.rotation.y = t * 0.18;
    ref.current.rotation.x = Math.sin(t * 0.1) * 0.05;
  });

  const geometry = useMemo(() => {
    const curve = new InfinityCurveClass();
    const geo = new THREE.TubeGeometry(curve, PATH_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, true);

    const positionCount = geo.attributes.position.count;
    const colors = new Float32Array(positionCount * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i <= PATH_SEGMENTS; i++) {
      const t = i / PATH_SEGMENTS;
      colorAt(t, tmp);
      for (let j = 0; j <= RADIAL_SEGMENTS; j++) {
        const idx = (i * (RADIAL_SEGMENTS + 1) + j) * 3;
        colors[idx] = tmp.r * HDR_BOOST;
        colors[idx + 1] = tmp.g * HDR_BOOST;
        colors[idx + 2] = tmp.b * HDR_BOOST;
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    // Calmer Float so the mesh does not drift outside the canvas viewport.
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.18}>
      <mesh ref={ref} geometry={geometry}>
        <meshBasicMaterial vertexColors toneMapped={false} />
      </mesh>
    </Float>
  );
}

export function InfinityLogo3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        // Camera moved further back so rotation never clips the mesh edges.
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        // Force the WebGL clear color to be fully transparent so the page background
        // (aurora orbs, glow halo, etc.) shows through behind the mesh.
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <InfinityMesh />
          <EffectComposer>
            <Bloom intensity={1.6} luminanceThreshold={0.5} luminanceSmoothing={0.7} mipmapBlur />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0009, 0.0009]}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
