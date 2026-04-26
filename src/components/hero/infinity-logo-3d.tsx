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

// Three pure brand colors at the corners of the curve's bounding box. Using fewer,
// more saturated stops (instead of intermediate "muddy" interpolations) makes the
// hue separation visible: cyan on the left, purple in the center, blue on the right.
const BRAND_CYAN = new THREE.Color('#5dc7ff');
const BRAND_PURPLE = new THREE.Color('#a35dff');
const BRAND_BLUE = new THREE.Color('#5d6fff');

// Curve bounds; used to normalize vertex.x for position-based color mapping.
const CURVE_X_HALF = 1.4;

const HDR_BOOST = 1.05;

class InfinityCurveClass extends THREE.Curve<THREE.Vector3> {
  public constructor() {
    super();
  }
  override getPoint(t: number): THREE.Vector3 {
    const angle = t * Math.PI * 2;
    const x = CURVE_X_HALF * Math.sin(angle);
    const y = 0.65 * Math.sin(angle * 2);
    // Subtle Z undulation so the front and back of the crossing have real depth.
    // Without this, both halves of the loop sit on z=0 and the crossing reads
    // as a flat X instead of one tube passing in front of the other.
    const z = 0.2 * Math.sin(angle);
    return new THREE.Vector3(x, y, z);
  }
}

// Spatial color mapping: the gradient is anchored to where the vertex is in 3D space,
// not where it is along the path. Result: at the crossing both tubes share the same
// local color, so the X disappears and reads as a continuous infinity.
function colorAtPosition(x: number, y: number, out: THREE.Color): void {
  // Normalize x from [-CURVE_X_HALF, +CURVE_X_HALF] to [0, 1].
  const tx = Math.max(0, Math.min(1, (x + CURVE_X_HALF) / (2 * CURVE_X_HALF)));
  // Three-stop mapping: cyan at left edge, purple at center, blue at right edge.
  if (tx < 0.5) {
    out.copy(BRAND_CYAN).lerp(BRAND_PURPLE, tx * 2);
  } else {
    out.copy(BRAND_PURPLE).lerp(BRAND_BLUE, (tx - 0.5) * 2);
  }
  // Lift saturation slightly toward the top of the loop, deepen toward the bottom.
  // y ranges roughly [-0.65, +0.65]. Brighten by up to 12% at the top.
  const lift = 1 + (y / 0.65) * 0.12;
  out.multiplyScalar(Math.max(0.85, Math.min(1.15, lift)));
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

    const positions = geo.attributes.position;
    const positionCount = positions.count;
    const colors = new Float32Array(positionCount * 3);
    const tmp = new THREE.Color();

    // Iterate every vertex (not just the rings) and color by 3D position.
    // This is what removes the visible X at the crossing.
    for (let i = 0; i < positionCount; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      colorAtPosition(x, y, tmp);
      const idx = i * 3;
      colors[idx] = tmp.r * HDR_BOOST;
      colors[idx + 1] = tmp.g * HDR_BOOST;
      colors[idx + 2] = tmp.b * HDR_BOOST;
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
          metalness={0.4}
          roughness={0.18}
          iridescence={1.0}
          iridescenceIOR={1.45}
          iridescenceThicknessRange={[200, 720]}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          emissive={'#ffffff'}
          emissiveIntensity={0.06}
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
