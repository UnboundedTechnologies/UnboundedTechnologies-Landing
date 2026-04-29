'use client';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';

// Single loader call so all four textures share one suspense boundary and
// one cache key. Returning the textures pre-configured (sRGB on color,
// linear on normal/spec, anisotropy bumped) keeps the consumers dumb.

export function useEarthTextures() {
  const [color, normal, specular, clouds] = useLoader(THREE.TextureLoader, [
    '/textures/earth/color.jpg',
    '/textures/earth/normal.jpg',
    '/textures/earth/specular.jpg',
    '/textures/earth/clouds.png',
  ]);

  color.colorSpace = THREE.SRGBColorSpace;
  clouds.colorSpace = THREE.SRGBColorSpace;
  normal.colorSpace = THREE.NoColorSpace;
  specular.colorSpace = THREE.NoColorSpace;

  for (const t of [color, normal, specular, clouds]) {
    t.anisotropy = 8;
  }

  return { color, normal, specular, clouds };
}
