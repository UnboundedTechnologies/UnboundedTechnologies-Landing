'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';

function InfinityCurve() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
    ref.current.rotation.y = state.clock.elapsedTime * 0.15;
  });

  class InfinityCurveClass extends THREE.Curve<THREE.Vector3> {
    constructor() {
      super();
    }
    getPoint(t: number) {
      const angle = t * Math.PI * 2;
      const x = 1.5 * Math.sin(angle);
      const y = 0.7 * Math.sin(angle * 2);
      return new THREE.Vector3(x, y, 0);
    }
  }

  const curve = new InfinityCurveClass();
  const geometry = new THREE.TubeGeometry(curve, 200, 0.12, 16, true);

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh ref={ref} geometry={geometry}>
        <MeshTransmissionMaterial
          color="#a35dff"
          thickness={0.6}
          roughness={0.05}
          chromaticAberration={0.1}
          ior={1.5}
          backside
          transmission={1}
          attenuationColor="#5dc7ff"
        />
      </mesh>
    </Float>
  );
}

export function InfinityLogo3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 3, 5]} intensity={2} color="#5d6fff" />
          <pointLight position={[-3, -2, 4]} intensity={1.8} color="#a35dff" />
          <InfinityCurve />
          <EffectComposer>
            <Bloom intensity={0.6} luminanceThreshold={0.85} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
