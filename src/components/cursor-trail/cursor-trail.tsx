'use client';

import { useEffect, useRef } from 'react';

// Aurora cursor trail. A fixed-position canvas overlay that draws a small
// chain of brand-colored dots following the cursor. 12 particles, each
// with its own lag, give a soft trailing effect that reads as part of the
// site atmosphere rather than a gimmick.
//
// Disabled on touch devices (no useful cursor) and when the user has
// reduce-motion on (system preference OR our manual data-motion="reduce"
// override). When disabled, returns null - no canvas, no event listeners,
// no rAF loop.

const PARTICLE_COUNT = 12;
const LERP_FACTORS = Array.from({ length: PARTICLE_COUNT }, (_, i) => 0.18 - i * 0.012);
const COLORS = ['#5d6fff', '#7e6cff', '#9a66ff', '#a35dff', '#8e7fff', '#5dc7ff'];

type Particle = { x: number; y: number; targetX: number; targetY: number };

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Touch-only or reduce-motion users skip the whole feature.
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasFinePointer) return;
    const reducedMotion = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.documentElement.getAttribute('data-motion') === 'reduce';
    if (reducedMotion()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let mouseX = -100;
    let mouseY = -100;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMove);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: -100,
      y: -100,
      targetX: -100,
      targetY: -100,
    }));

    let raf = 0;
    const tick = () => {
      // Targets cascade: particle 0 chases the mouse, each subsequent one
      // chases the previous particle's last position.
      let prevX = mouseX;
      let prevY = mouseY;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.targetX = prevX;
        p.targetY = prevY;
        p.x += (p.targetX - p.x) * LERP_FACTORS[i];
        p.y += (p.targetY - p.y) * LERP_FACTORS[i];
        prevX = p.x;
        prevY = p.y;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const radius = (PARTICLE_COUNT - i) * 1.4;
        const alpha = (1 - i / PARTICLE_COUNT) * 0.55;
        const color = COLORS[i % COLORS.length];
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 4);
        grad.addColorStop(0, hexWithAlpha(color, alpha));
        grad.addColorStop(1, hexWithAlpha(color, 0));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[60]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

function hexWithAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
