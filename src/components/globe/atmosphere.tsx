'use client';
import { useMemo } from 'react';
import * as THREE from 'three';

const ATMOSPHERE_RADIUS = 1.04;

// Fresnel-style rim glow. The fragment shader brightens the silhouette
// where the surface normal is perpendicular to the view (i.e., at the
// horizon ring) and fades to nothing in the middle. Shader is BackSide so
// we render the inside of a slightly-larger sphere; FrontSide would clip
// the sphere geometry against the camera near-plane at certain angles.

const VERT = `
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * vec4(vPosition, 1.0);
}
`;

const FRAG = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform vec3 uColorInner;
uniform vec3 uColorOuter;
uniform float uIntensity;
void main() {
  vec3 viewDir = normalize(-vPosition);
  float fres = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);
  vec3 col = mix(uColorInner, uColorOuter, fres);
  gl_FragColor = vec4(col * uIntensity, fres);
}
`;

export function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms: {
          uColorInner: { value: new THREE.Color('#5d6fff') },
          uColorOuter: { value: new THREE.Color('#a35dff') },
          uIntensity: { value: 1.15 },
        },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );

  return (
    <mesh>
      <sphereGeometry args={[ATMOSPHERE_RADIUS, 64, 48]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
