'use client';
import { Line } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CloudsSphere } from './clouds-sphere';
import { EarthSphere } from './earth-sphere';
import { HubLabel } from './hub-label';

type City = { name: string; lat: number; lng: number; color: string };

const HUB: City = { name: 'Toronto', lat: 43.65, lng: -79.38, color: '#ef4444' };
const SPOKES: ReadonlyArray<City> = [
  { name: 'Paris', lat: 48.86, lng: 2.35, color: '#a35dff' },
  { name: 'Dubai', lat: 25.2, lng: 55.27, color: '#5dc7ff' },
  { name: 'São Paulo', lat: -23.55, lng: -46.63, color: '#a35dff' },
  { name: 'Singapore', lat: 1.35, lng: 103.82, color: '#5dc7ff' },
  { name: 'Mumbai', lat: 19.08, lng: 72.88, color: '#a35dff' },
  { name: 'Tokyo', lat: 35.68, lng: 139.69, color: '#5dc7ff' },
];

const SPHERE_RADIUS = 1;
const CONTINENTS_LIFT = 1.005;
const ROUTES_LIFT = 1.012;
const MARKER_LIFT = 1.018;
const HUB_PIN_HEIGHT = 0.16;
const HUB_LABEL_LIFT = SPHERE_RADIUS + HUB_PIN_HEIGHT + 0.04;
const ARC_POINTS = 96;

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function greatCirclePoints(a: THREE.Vector3, b: THREE.Vector3, n: number): THREE.Vector3[] {
  const angle = a.angleTo(b);
  const sinAngle = Math.sin(angle);
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const f1 = Math.sin((1 - t) * angle) / sinAngle;
    const f2 = Math.sin(t * angle) / sinAngle;
    points.push(a.clone().multiplyScalar(f1).add(b.clone().multiplyScalar(f2)));
  }
  return points;
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
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={city.color} transparent opacity={0.22} toneMapped={false} />
      </mesh>
    </group>
  );
}

function HubPin({ city }: { city: City }) {
  const surface = useMemo(
    () => latLngToVec3(city.lat, city.lng, SPHERE_RADIUS),
    [city.lat, city.lng],
  );
  const tip = useMemo(
    () => latLngToVec3(city.lat, city.lng, SPHERE_RADIUS + HUB_PIN_HEIGHT),
    [city.lat, city.lng],
  );
  return (
    <group>
      <Line points={[surface, tip]} color={city.color} lineWidth={2.4} />
      <mesh position={tip}>
        <sphereGeometry args={[0.045, 20, 20]} />
        <meshBasicMaterial color={city.color} toneMapped={false} />
      </mesh>
      <mesh position={tip}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshBasicMaterial color={city.color} transparent opacity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Route({ from, to, color }: { from: THREE.Vector3; to: THREE.Vector3; color: string }) {
  const points = useMemo(() => {
    const lifted = greatCirclePoints(from, to, ARC_POINTS);
    for (const p of lifted) p.normalize().multiplyScalar(ROUTES_LIFT);
    return lifted;
  }, [from, to]);
  return <Line points={points} color={color} lineWidth={1.6} transparent opacity={0.9} />;
}

// biome-ignore lint/suspicious/noExplicitAny: topojson schema typing not worth a generic dance
type Polygon = any[][][];

function Continents() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [{ feature }, res] = await Promise.all([
          import('topojson-client'),
          fetch('/data/world-land-110m.json'),
        ]);
        if (!res.ok) throw new Error(`world-land fetch ${res.status}`);
        const topology = await res.json();
        if (cancelled) return;

        // biome-ignore lint/suspicious/noExplicitAny: topojson typing
        const land = feature(topology, topology.objects.land) as any;
        const polygons: Polygon[] = [];
        if (land.geometry?.type === 'MultiPolygon') polygons.push(...land.geometry.coordinates);
        else if (land.geometry?.type === 'Polygon') polygons.push(land.geometry.coordinates);

        const positions: number[] = [];
        for (const polygon of polygons) {
          for (const ring of polygon) {
            for (let i = 0; i < ring.length - 1; i++) {
              const v1 = latLngToVec3(ring[i][1], ring[i][0], CONTINENTS_LIFT);
              const v2 = latLngToVec3(ring[i + 1][1], ring[i + 1][0], CONTINENTS_LIFT);
              positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
            }
          }
        }
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        if (cancelled) return;
        setGeometry(geom);
      } catch (err) {
        console.warn('[Globe] continents load failed:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!geometry) return null;
  return (
    <lineSegments>
      <primitive object={geometry} attach="geometry" />
      <lineBasicMaterial color="#ffffff" transparent opacity={0.18} toneMapped={false} />
    </lineSegments>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const t = useTranslations('globe');

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  const hubRoutePos = useMemo(() => latLngToVec3(HUB.lat, HUB.lng, ROUTES_LIFT), []);
  const hubLabelPos = useMemo(() => latLngToVec3(HUB.lat, HUB.lng, HUB_LABEL_LIFT), []);
  const spokeRoutePositions = useMemo(
    () => SPOKES.map((c) => latLngToVec3(c.lat, c.lng, ROUTES_LIFT)),
    [],
  );

  return (
    <group ref={groupRef} rotation={[0.18, 0, 0]}>
      <EarthSphere />
      <CloudsSphere />
      <Continents />
      <HubPin city={HUB} />
      {SPOKES.map((c) => (
        <CityMarker key={c.name} city={c} />
      ))}
      {spokeRoutePositions.map((to, i) => (
        <Route key={SPOKES[i].name} from={hubRoutePos} to={to} color={SPOKES[i].color} />
      ))}
      <HubLabel position={hubLabelPos} primary={t('hubName')} secondary={t('hubRegion')} />
    </group>
  );
}

export function Globe() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 2, 4]} intensity={1.25} color="#ffffff" />
        <directionalLight position={[-2, -1, -3]} intensity={0.18} color="#7c8eff" />
        <Scene />
        <EffectComposer>
          <Bloom intensity={0.6} luminanceThreshold={0.62} luminanceSmoothing={0.6} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
