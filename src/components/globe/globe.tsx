'use client';
import { Line } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// WebGL globe: textured sphere (continents filled, seas tinted, latitude-
// based shading hints at relief), continent outlines on top, surface-level
// great-circle routes from a Toronto hub, and city markers. Loaded only
// when the section enters the viewport (see globe-section.tsx).
//
// The earth texture is rasterised on the client from a topojson world-atlas
// (no external image asset required); routes are drawn flush against the
// surface for the "flight tracker" silhouette.

type City = {
  name: string;
  lat: number;
  lng: number;
  color: string;
};

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
const ARC_POINTS = 96;
const TEX_WIDTH = 2048;
const TEX_HEIGHT = 1024;

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

// Toronto pin: vertical line above the surface plus a glowing tip so the
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
type Ring = any[][];
// biome-ignore lint/suspicious/noExplicitAny: same
type Polygon = any[][][];

type EarthData = {
  texture: THREE.Texture | null;
  outline: THREE.BufferGeometry | null;
};

function useEarthData(): EarthData {
  const [data, setData] = useState<EarthData>({ texture: null, outline: null });

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
        if (land.geometry?.type === 'MultiPolygon') {
          polygons.push(...land.geometry.coordinates);
        } else if (land.geometry?.type === 'Polygon') {
          polygons.push(land.geometry.coordinates);
        } else if (land.type === 'FeatureCollection') {
          // biome-ignore lint/suspicious/noExplicitAny: topojson typing
          for (const f of land.features as any[]) {
            if (f.geometry?.type === 'MultiPolygon') polygons.push(...f.geometry.coordinates);
            else if (f.geometry?.type === 'Polygon') polygons.push(f.geometry.coordinates);
          }
        }

        // ── Texture ─────────────────────────────────────────────────────
        const canvas = document.createElement('canvas');
        canvas.width = TEX_WIDTH;
        canvas.height = TEX_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('no 2d ctx');

        // Sea: dark navy with a vertical gradient so the equator is deeper
        // and the polar regions tint slightly cooler. Subtle but it stops
        // the oceans reading as a flat block.
        const seaGrad = ctx.createLinearGradient(0, 0, 0, TEX_HEIGHT);
        seaGrad.addColorStop(0, '#0a1228');
        seaGrad.addColorStop(0.45, '#0d1840');
        seaGrad.addColorStop(0.55, '#0d1840');
        seaGrad.addColorStop(1, '#0a1228');
        ctx.fillStyle = seaGrad;
        ctx.fillRect(0, 0, TEX_WIDTH, TEX_HEIGHT);

        // Land: build a single Path2D containing every ring of every
        // polygon, then fill once with evenodd winding so polygon holes
        // (e.g., lakes) cut through correctly.
        const landPath = new Path2D();
        const drawRing = (ring: Ring) => {
          if (ring.length === 0) return;
          const [lng0, lat0] = ring[0];
          landPath.moveTo(((lng0 + 180) / 360) * TEX_WIDTH, ((90 - lat0) / 180) * TEX_HEIGHT);
          for (let i = 1; i < ring.length; i++) {
            const [lng, lat] = ring[i];
            landPath.lineTo(((lng + 180) / 360) * TEX_WIDTH, ((90 - lat) / 180) * TEX_HEIGHT);
          }
          landPath.closePath();
        };
        for (const polygon of polygons) for (const ring of polygon) drawRing(ring);

        // Latitude gradient: warmer green near equator, cooler/lighter
        // tones near the poles. Cheap stand-in for relief without an
        // elevation dataset.
        const landGrad = ctx.createLinearGradient(0, 0, 0, TEX_HEIGHT);
        landGrad.addColorStop(0, '#3a4a48');
        landGrad.addColorStop(0.25, '#3d5240');
        landGrad.addColorStop(0.5, '#2f4a30');
        landGrad.addColorStop(0.7, '#3d5240');
        landGrad.addColorStop(1, '#3a4a48');
        ctx.fillStyle = landGrad;
        ctx.fill(landPath, 'evenodd');

        // Coastline highlight: a thin stroke right along the polygon edge
        // sells the continent silhouette at a glance.
        ctx.strokeStyle = 'rgba(154,172,255,0.55)';
        ctx.lineWidth = 1.2;
        ctx.stroke(landPath);

        // Procedural relief: scatter small darker patches inside the land
        // to suggest mountain ranges and texture without an elevation map.
        // Drawn with `source-atop` blend so the speckle stays clipped to
        // the land area.
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        for (let i = 0; i < 1400; i++) {
          const x = Math.random() * TEX_WIDTH;
          const y = Math.random() * TEX_HEIGHT;
          const r = 1.5 + Math.random() * 3.5;
          const dark = Math.random() < 0.5;
          ctx.fillStyle = dark ? 'rgba(15,30,20,0.35)' : 'rgba(120,160,130,0.18)';
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        texture.needsUpdate = true;

        // ── Outline geometry ────────────────────────────────────────────
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
        const outline = new THREE.BufferGeometry();
        outline.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        if (cancelled) return;
        setData({ texture, outline });
      } catch (err) {
        console.warn('[Globe] earth data load failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const { texture, outline } = useEarthData();

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
        <sphereGeometry args={[SPHERE_RADIUS, 96, 64]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#0a0915" toneMapped={false} />
        )}
      </mesh>

      {outline && (
        <lineSegments>
          <primitive object={outline} attach="geometry" />
          <lineBasicMaterial color="#9aacff" transparent opacity={0.55} toneMapped={false} />
        </lineSegments>
      )}

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
        <ambientLight intensity={0.95} />
        <directionalLight position={[2, 3, 4]} intensity={0.6} />
        <Scene />
        <EffectComposer>
          <Bloom intensity={0.85} luminanceThreshold={0.55} luminanceSmoothing={0.6} mipmapBlur />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
