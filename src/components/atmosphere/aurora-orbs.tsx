import { cn } from '@/lib/utils';

export function AuroraOrbs({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden>
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(93,111,255,0.55) 0%, transparent 70%)',
          animation: 'orb-drift-a 14s var(--ease-out) infinite alternate',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(163,93,255,0.5) 0%, transparent 65%)',
          animation: 'orb-drift-b 18s var(--ease-out) infinite alternate',
        }}
      />
      <style>{`
        @keyframes orb-drift-a { from { transform: translate(0,0) scale(1); } to { transform: translate(80px, 60px) scale(1.1); } }
        @keyframes orb-drift-b { from { transform: translate(0,0) scale(1); } to { transform: translate(-100px, -40px) scale(0.95); } }
        @media (prefers-reduced-motion: reduce) { div[style*="orb-drift"] { animation: none !important; } }
      `}</style>
    </div>
  );
}
