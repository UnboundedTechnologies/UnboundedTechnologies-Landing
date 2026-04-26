'use client';
import { Float } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Silence the THREE.Clock deprecation warning emitted by react-three-fiber's
// internal frame loop. R3F still uses Clock; the deprecation is upstream noise
// the owner does not want surfacing in DevTools. Runs once when this module is
// first evaluated on the client, before any Canvas instantiates the warning.
if (typeof window !== 'undefined') {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && /THREE\.Clock.*deprecated/i.test(args[0])) {
      return;
    }
    originalWarn(...args);
  };
}

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

// Lower HDR boost than before because lighting now contributes to brightness;
// pushing too high blows out the iridescent highlights.
const HDR_BOOST = 0.95;

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
        {/* Iridescent physical material: vertex colors carry the brand gradient base,
            iridescence shifts hue at glancing angles so the surface shimmers as it
            rotates, clearcoat adds a wet glossy top layer, lights contribute the
            highlights and shading that previously made the tube look like a flat
            colored ribbon. The combination reads as glass-glow rather than as solid. */}
        <meshPhysicalMaterial
          vertexColors
          toneMapped={false}
          metalness={0.55}
          roughness={0.2}
          iridescence={1.0}
          iridescenceIOR={1.5}
          iridescenceThicknessRange={[120, 580]}
          clearcoat={1.0}
          clearcoatRoughness={0.06}
          emissive={'#a35dff'}
          emissiveIntensity={0.18}
        />
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
          {/* Lighting rig: ambient softens shadows, three colored point lights
              create the iridescent shimmer effect from different angles, one
              white directional light keeps the gradient readable. */}
          <ambientLight intensity={0.35} />
          <pointLight position={[3, 2.5, 4]} intensity={3.2} color="#5d6fff" />
          <pointLight position={[-3, -2, 4]} intensity={2.8} color="#a35dff" />
          <pointLight position={[0, 3.5, 2.5]} intensity={2.2} color="#5dc7ff" />
          <directionalLight position={[2, 3, 5]} intensity={0.9} color="#ffffff" />
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
