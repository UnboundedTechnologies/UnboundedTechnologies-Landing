'use client';
import { Float } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useEffect, useMemo, useRef } from 'react';
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

// Match the text's CSS gradient EXACTLY: blue at 0% → purple at 50% → cyan at 100%
// (linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-purple), var(--color-brand-cyan)))
const BRAND_BLUE = new THREE.Color('#5d6fff');
const BRAND_PURPLE = new THREE.Color('#a35dff');
const BRAND_CYAN = new THREE.Color('#5dc7ff');

// Curve bounds; used to normalize vertex position for color mapping.
const CURVE_X_HALF = 1.4;
const CURVE_Y_HALF = 0.65;

// Higher HDR boost so the brand colors dominate and survive the lighting/clearcoat passes.
const HDR_BOOST = 1.55;

// 135-degree diagonal direction (matches the CSS gradient angle on the headline text).
// 135deg in CSS means "from top-left to bottom-right", so the gradient axis is normalized (1,1)/sqrt(2).
const SQRT2_INV = 1 / Math.SQRT2;

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

// Spatial color mapping along the 135-degree diagonal (matches the CSS text gradient).
// Color is anchored to vertex position in 3D space, not curve parameter, so at the
// crossing the front and back tubes share the same local color and read as one
// continuous infinity instead of a hard X.
function colorAtPosition(x: number, y: number, out: THREE.Color): void {
  // Project (x, y) onto the diagonal axis (1, 1) / sqrt(2). Top-left is the high end.
  // CSS 135deg goes from top-left (start) toward bottom-right (end), but in our 3D
  // coordinate system y increases upward, so we project (-x + y) for the same visual.
  const projected = (-x + y) * SQRT2_INV;
  const projectedMax = (CURVE_X_HALF + CURVE_Y_HALF) * SQRT2_INV;
  // Normalize to [0, 1]. t=0 corresponds to top-left of the curve (where blue starts).
  const t = Math.max(0, Math.min(1, (projected + projectedMax) / (2 * projectedMax)));
  // Three-stop interpolation: blue at 0, purple at 0.5, cyan at 1 (CSS gradient stops).
  if (t < 0.5) {
    out.copy(BRAND_BLUE).lerp(BRAND_PURPLE, t * 2);
  } else {
    out.copy(BRAND_PURPLE).lerp(BRAND_CYAN, (t - 0.5) * 2);
  }
}

// Frame-kicker: listens for browser events that commonly leave the WebGL render
// loop in a paused state (page visibility flips, bfcache restoration, focus
// regaining) and explicitly calls invalidate() so the next frame request is
// queued. Belt-and-suspenders alongside the Hero's pageshow/popstate remount key.
function CanvasFrameKicker() {
  const { invalidate } = useThree();
  useEffect(() => {
    function kick() {
      invalidate();
    }
    document.addEventListener('visibilitychange', kick);
    window.addEventListener('pageshow', kick);
    window.addEventListener('focus', kick);
    // Kick once on mount to bootstrap.
    invalidate();
    return () => {
      document.removeEventListener('visibilitychange', kick);
      window.removeEventListener('pageshow', kick);
      window.removeEventListener('focus', kick);
    };
  }, [invalidate]);
  return null;
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
    // floatIntensity at 0 with explicit floatingRange of [0, 0] disables Float's
    // positional drift entirely, leaving only the rotation tweens it adds. If the
    // logo had been visibly off-center, this rules out Float as the cause.
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0} floatingRange={[0, 0]}>
      <mesh ref={ref} geometry={geometry}>
        {/* Iridescent physical material: vertex colors carry the brand gradient base,
            iridescence shifts hue at glancing angles so the surface shimmers as it
            rotates, clearcoat adds a wet glossy top layer, lights contribute the
            highlights and shading that previously made the tube look like a flat
            colored ribbon. The combination reads as glass-glow rather than as solid. */}
        {/* Iridescence and metalness are dialed WAY down compared to the previous attempt
            because they were desaturating the brand colors into uniform lavender. The
            current goal is to look like the text gradient pulled into 3D, not like a
            soap-bubble shimmer. Vertex colors carry the saturated brand gradient,
            modest clearcoat and a touch of iridescence add 3D specular interest, and
            white emissive at low intensity gives the bloom something to grab onto. */}
        <meshPhysicalMaterial
          vertexColors
          toneMapped={false}
          metalness={0.0}
          roughness={0.28}
          iridescence={0.35}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[300, 600]}
          clearcoat={0.6}
          clearcoatRoughness={0.18}
          emissive={'#ffffff'}
          emissiveIntensity={0.08}
        />
      </mesh>
    </Float>
  );
}

export function InfinityLogo3D({ paused = false }: { paused?: boolean } = {}) {
  return (
    <div className="w-full h-full">
      <Canvas
        // Camera moved further back so rotation never clips the mesh edges.
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        // Pause the frame loop entirely when the Canvas is hidden so it does not
        // burn CPU/GPU on routes that do not show it. When unpaused, render every
        // frame so motion never freezes after a visibility change.
        frameloop={paused ? 'never' : 'always'}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        // Force the WebGL clear color to be fully transparent so the page background
        // (aurora orbs, glow halo, etc.) shows through behind the mesh. Also kicks
        // an immediate frame request to bootstrap the loop on first paint.
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0);
          // Surface WebGL context loss/restore so silent failures stop being silent.
          // Long sessions or GPU resets occasionally drop the context; logging it
          // means future regressions are diagnosable instead of mysterious.
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (event) => {
            event.preventDefault();
            console.warn('[InfinityLogo3D] WebGL context lost');
          });
          canvas.addEventListener('webglcontextrestored', () => {
            console.warn('[InfinityLogo3D] WebGL context restored');
            invalidate();
          });
          invalidate();
        }}
      >
        <Suspense fallback={null}>
          <CanvasFrameKicker />
          {/* Calmer lighting: previous rig had four bright lights that were washing the
              vertex colors into pale lavender. Now: soft white ambient for base
              readability, plus two gentle white directional lights for shading depth.
              The brand colors come ENTIRELY from the vertex colors, not from tinted
              lights. */}
          <ambientLight intensity={0.55} />
          <directionalLight position={[2, 3, 4]} intensity={0.9} color="#ffffff" />
          <directionalLight position={[-2, -1, 3]} intensity={0.4} color="#ffffff" />
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
