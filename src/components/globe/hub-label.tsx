'use client';
import { Html } from '@react-three/drei';
import type * as THREE from 'three';

// Anchored to the world position passed in. drei's <Html> reprojects
// every frame so the card tracks the pin as the globe rotates. center
// flag puts the card's transform-origin at its center so the anchor lines
// up with the pin tip.
//
// occlude is intentionally not enabled: per spec, the label must show
// "at all times", including when the pin has rotated to the back face of
// the globe. Pointer events are disabled so the card can't intercept
// hover/click on the canvas behind it.

type Props = {
  position: THREE.Vector3;
  primary: string;
  secondary: string;
};

export function HubLabel({ position, primary, secondary }: Props) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }} zIndexRange={[10, 0]}>
      <div
        className="px-3 py-1.5 rounded-md bg-bg-elevated/55 backdrop-blur-md border border-border whitespace-nowrap select-none"
        style={{ transform: 'translateY(-22px)' }}
      >
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted leading-none">
          {secondary}
        </div>
        <div className="font-semibold text-xs text-text leading-tight mt-0.5">{primary}</div>
      </div>
    </Html>
  );
}
