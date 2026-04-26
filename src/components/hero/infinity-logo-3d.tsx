'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

const PATH_SEGMENTS = 240;
const RADIAL_SEGMENTS = 24;
const TUBE_RADIUS = 0.18;

const BRAND_BLUE = new THREE.Color('#5d6fff');
const BRAND_PURPLE = new THREE.Color('#a35dff');
const BRAND_CYAN = new THREE.Color('#5dc7ff');
const HDR_BOOST = 1.6;

class InfinityCurveClass extends THREE.Curve<THREE.Vector3> {
  public constructor() {
    super();
  }
  override getPoint(t: number): THREE.Vector3 {
    const angle = t * Math.PI * 2;
    const x = 1.6 * Math.sin(angle);
    const y = 0.75 * Math.sin(angle * 2);
    return new THREE.Vector3(x, y, 0);
  }
}

function InfinityMesh() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.z = Math.sin(t * 0.18) * 0.12;
    ref.current.rotation.y = t * 0.22;
    ref.current.rotation.x = Math.sin(t * 0.12) * 0.08;
  });

  const geometry = useMemo(() => {
    const curve = new InfinityCurveClass();
    const geo = new THREE.TubeGeometry(curve, PATH_SEGMENTS, TUBE_RADIUS, RADIAL_SEGMENTS, true);

    const positionCount = geo.attributes.position.count;
    const colors = new Float32Array(positionCount * 3);
    const tmp = new THREE.Color();

    // TubeGeometry vertex layout: (PATH_SEGMENTS + 1) rings, each with (RADIAL_SEGMENTS + 1) verts.
    for (let i = 0; i <= PATH_SEGMENTS; i++) {
      const t = i / PATH_SEGMENTS;
      if (t < 0.5) {
        tmp.copy(BRAND_BLUE).lerp(BRAND_PURPLE, t * 2);
      } else {
        tmp.copy(BRAND_PURPLE).lerp(BRAND_CYAN, (t - 0.5) * 2);
      }
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
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.4}>
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
        camera={{ position: [0, 0, 3.6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <InfinityMesh />
          <EffectComposer>
            <Bloom intensity={1.4} luminanceThreshold={0.55} luminanceSmoothing={0.6} mipmapBlur />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0008, 0.0008]}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
