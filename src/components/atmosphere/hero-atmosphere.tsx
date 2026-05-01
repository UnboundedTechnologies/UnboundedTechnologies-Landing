import { cn } from '@/lib/utils';

// Calm cosmic atmosphere reserved for the HOMEPAGE hero. AuroraOrbs (the
// brighter twin used on /work, /services, /about, /contact heroes) was too
// loud on the homepage where it has to share the stage with the 3D
// infinity logo and the marquee headline. This component is deliberately
// dimmer: deep black base, low-alpha conic mesh that morphs over 2 minutes,
// two gentle light leaks drifting opposite directions, and a soft vignette
// pulling attention to the center. Reads as "deep space" rather than
// "aurora explosion".
//
// Other heroes keep using AuroraOrbs and its brighter aurora-plus-nebula.
// prefers-reduced-motion disables every animation.

export function HeroAtmosphere({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
    >
      {/* Slow tri-tone mesh, very low opacity, very slow rotation. The blur
          smudges any visible boundaries so the colors read as ambient
          cosmic dust rather than discrete blobs. */}
      <div
        className="absolute -inset-1/3 opacity-25 mix-blend-screen"
        style={{
          background:
            'conic-gradient(from 0deg at 50% 50%, rgba(93,111,255,0.32), rgba(163,93,255,0.32), rgba(93,199,255,0.32), rgba(93,111,255,0.32))',
          filter: 'blur(120px)',
          animation: 'hero-cosmos-spin 120s linear infinite',
        }}
      />

      {/* Cyan light leak from bottom-left, slowly breathing */}
      <div
        className="absolute -bottom-1/2 -left-1/3 w-[80vw] h-[80vw] rounded-full opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(93,199,255,0.10) 0%, transparent 65%)',
          animation: 'hero-leak-cyan 32s ease-in-out infinite alternate',
        }}
      />

      {/* Purple light leak from top-right, opposite drift */}
      <div
        className="absolute -top-1/3 -right-1/3 w-[70vw] h-[70vw] rounded-full opacity-35"
        style={{
          background: 'radial-gradient(circle, rgba(163,93,255,0.12) 0%, transparent 60%)',
          animation: 'hero-leak-purple 40s ease-in-out infinite alternate',
        }}
      />

      {/* Vignette: keeps edges deep, pulls attention toward the headline
          and the 3D logo at the center. Uses the page's bg color so the
          fade reads as natural depth rather than a black mask. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(7, 6, 13, 0.45) 95%)',
        }}
      />

      <style>{`
        @keyframes hero-cosmos-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hero-leak-cyan {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.08); }
        }
        @keyframes hero-leak-purple {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-50px, 35px) scale(0.95); }
        }
        @media (prefers-reduced-motion: reduce) {
          div[style*="hero-cosmos"],
          div[style*="hero-leak"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
