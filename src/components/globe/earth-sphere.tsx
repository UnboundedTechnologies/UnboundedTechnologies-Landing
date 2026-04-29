'use client';
import { useEarthTextures } from './earth-textures';

const SPHERE_RADIUS = 1;

// MeshStandardMaterial gives us PBR with normal-mapped relief and a
// roughness map driven by the specular: oceans (bright on specular) get
// low roughness so they catch the directional light, land (dark on
// specular) stays matte.

export function EarthSphere() {
  const { color, normal, specular } = useEarthTextures();
  return (
    <mesh>
      <sphereGeometry args={[SPHERE_RADIUS, 96, 64]} />
      <meshStandardMaterial
        map={color}
        normalMap={normal}
        normalScale={[0.85, 0.85]}
        roughnessMap={specular}
        roughness={0.92}
        metalness={0.0}
      />
    </mesh>
  );
}
