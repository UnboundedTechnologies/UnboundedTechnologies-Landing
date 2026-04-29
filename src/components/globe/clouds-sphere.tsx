'use client';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import { useEarthTextures } from './earth-textures';

const CLOUDS_RADIUS = 1.005;

// Clouds rotate slightly faster than the planet for a parallax effect.
// transparent + depthWrite=false so the clouds blend cleanly over the
// surface without z-fighting the base sphere.

export function CloudsSphere() {
  const ref = useRef<THREE.Mesh>(null);
  const { clouds } = useEarthTextures();

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.012;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[CLOUDS_RADIUS, 96, 64]} />
      <meshStandardMaterial map={clouds} transparent opacity={0.55} depthWrite={false} />
    </mesh>
  );
}
