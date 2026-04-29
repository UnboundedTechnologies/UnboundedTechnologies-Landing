'use client';
import { Line } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// WebGL globe with continent outlines, surface-level routes from a Toronto
// hub, and city markers. Loaded only when the section enters the viewport
// (see globe-section.tsx).
//
// The continents are streamed as topojson from /public/data, then converted
// into a single LineSegments BufferGeometry on the client. Routes are great-
// circle interpolations along the sphere surface (the "flight tracker"
// silhouette).

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
const CONTINENTS_LIFT = 1.005;
const ROUTES_LIFT = 1.012;
const MARKER_LIFT = 1.018;
const HUB_PIN_HEIGHT = 0.16;
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

// Toronto pin: a vertical line above the surface plus a glowing tip so the
// hub is unambiguously identifiable on the globe even at small sizes.
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
      <Line points={[surface, tip]} color={city.color} lineWidth={2} />
      <mesh position={tip}>
        <sphereGeometry args={[0.038, 20, 20]} />
        <meshBasicMaterial color={city.color} toneMapped={false} />
      </mesh>
      <mesh position={tip}>
        <sphereGeometry args={[0.08, 20, 20]} />
        <meshBasicMaterial color={city.color} transparent opacity={0.25} toneMapped={false} />
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
type RingArray = any[][];

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

        // biome-ignore lint/suspicious/noExplicitAny: same as above
        const land = feature(topology, topology.objects.land) as any;
        const positions: number[] = [];

        const pushSegments = (rings: RingArray) => {
          for (const ring of rings) {
            for (let i = 0; i < ring.length - 1; i++) {
              const [lng1, lat1] = ring[i];
              const [lng2, lat2] = ring[i + 1];
              const v1 = latLngToVec3(lat1, lng1, CONTINENTS_LIFT);
              const v2 = latLngToVec3(lat2, lng2, CONTINENTS_LIFT);
              positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
            }
          }
        };

        if (land.geometry?.type === 'MultiPolygon') {
          for (const polygon of land.geometry.coordinates) pushSegments(polygon);
        } else if (land.geometry?.type === 'Polygon') {
          pushSegments(land.geometry.coordinates);
        } else if (land.type === 'FeatureCollection') {
          for (const f of land.features) {
            if (f.geometry?.type === 'MultiPolygon') {
              for (const p of f.geometry.coordinates) pushSegments(p);
            } else if (f.geometry?.type === 'Polygon') {
              pushSegments(f.geometry.coordinates);
            }
          }
        }

        if (cancelled) return;
        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
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
      <lineBasicMaterial color="#9aacff" transparent opacity={0.95} toneMapped={false} />
    </lineSegments>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06;
  });

  const hubRoutePos = useMemo(() => latLngToVec3(HUB.lat, HUB.lng, ROUTES_LIFT), []);
  const spokeRoutePositions = useMemo(
    () => SPOKES.map((c) => latLngToVec3(c.lat, c.lng, ROUTES_LIFT)),
    [],
  );

  return (
    <group ref={groupRef} rotation={[0.18, 0, 0]}>
      <mesh>
        <sphereGeometry args={[SPHERE_RADIUS, 64, 48]} />
        <meshBasicMaterial color="#0a0915" transparent opacity={0.95} toneMapped={false} />
      </mesh>

      <Continents />

      <HubPin city={HUB} />
      {SPOKES.map((c) => (
        <CityMarker key={c.name} city={c} />
      ))}

      {spokeRoutePositions.map((to, i) => (
        <Route key={SPOKES[i].name} from={hubRoutePos} to={to} color={SPOKES[i].color} />
      ))}
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
        <ambientLight intensity={0.9} />
        <directionalLight position={[2, 3, 4]} intensity={0.6} />
        <Scene />
        <EffectComposer>
          <Bloom intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.6} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
