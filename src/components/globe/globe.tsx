'use client';
import { Line } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';

// WebGL globe with rotating wireframe sphere, city markers, and arcs that
// fan out from a Toronto hub. Loaded only when the section enters the
// viewport (see globe-section.tsx). Until the Canvas hydrates, the static
// SVG fallback renders.
//
// Cities are deliberately a small set of recognisable hubs spanning the
// hemispheres so the globe never reads as Toronto-only. Arcs all originate
// from Toronto to communicate "delivered from here, deployed everywhere"
// without saying it in copy.

type City = {
  name: string;
  lat: number;
  lng: number;
  color: string;
};

const HUB: City = { name: 'Toronto', lat: 43.65, lng: -79.38, color: '#5d6fff' };
const SPOKES: ReadonlyArray<City> = [
  { name: 'Paris', lat: 48.86, lng: 2.35, color: '#a35dff' },
  { name: 'Dubai', lat: 25.2, lng: 55.27, color: '#5dc7ff' },
  { name: 'São Paulo', lat: -23.55, lng: -46.63, color: '#a35dff' },
  { name: 'Singapore', lat: 1.35, lng: 103.82, color: '#5dc7ff' },
  { name: 'Mumbai', lat: 19.08, lng: 72.88, color: '#a35dff' },
  { name: 'Tokyo', lat: 35.68, lng: 139.69, color: '#5dc7ff' },
];

const SPHERE_RADIUS = 1;
const MARKER_LIFT = 1.015;
const ARC_BULGE = 1.28;
const ARC_POINTS = 64;

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function arcPoints(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3[] {
  const mid = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(ARC_BULGE);
  const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
  return curve.getPoints(ARC_POINTS);
}

function CityMarker({ city }: { city: City }) {
  const pos = useMemo(() => latLngToVec3(city.lat, city.lng, MARKER_LIFT), [city.lat, city.lng]);
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color={city.color} toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color={city.color} transparent opacity={0.18} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Arc({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const points = useMemo(() => arcPoints(from, to), [from, to]);
  return <Line points={points} color={color} lineWidth={1.2} transparent opacity={0.75} />;
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  const hubPos = useMemo(() => latLngToVec3(HUB.lat, HUB.lng, SPHERE_RADIUS), []);
  const spokePositions = useMemo(
    () => SPOKES.map((c) => latLngToVec3(c.lat, c.lng, SPHERE_RADIUS)),
    [],
  );

  return (
    <group ref={groupRef} rotation={[0.18, 0, 0]}>
      <mesh>
        <sphereGeometry args={[SPHERE_RADIUS, 64, 48]} />
        <meshBasicMaterial
          color="#7c8eff"
          wireframe
          transparent
          opacity={0.18}
          toneMapped={false}
        />
      </mesh>

      <CityMarker city={HUB} />
      {SPOKES.map((c) => (
        <CityMarker key={c.name} city={c} />
      ))}

      {spokePositions.map((to, i) => (
        <Arc key={SPOKES[i].name} from={hubPos} to={to} color={SPOKES[i].color} />
      ))}
    </group>
  );
}

export function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.4], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={0.6} />
        <Scene />
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.6} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
