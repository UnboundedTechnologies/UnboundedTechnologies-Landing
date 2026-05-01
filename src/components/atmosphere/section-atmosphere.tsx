import { cn } from '@/lib/utils';

// Subtle ambient radial gradient for non-hero sections. Drops into any
// `relative overflow-hidden` parent to add a soft brand-color pool so the
// section never resolves to flat black. Server component, pure CSS, zero
// JS cost.
//
// Cycle accents across consecutive sections (blue / purple / cyan) to give
// the page visual rhythm without competing with content.

type Accent = 'blue' | 'purple' | 'cyan' | 'mixed';
type Position =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'bottom'
  | 'center';

const RGB: Record<Exclude<Accent, 'mixed'>, string> = {
  blue: '93, 111, 255',
  purple: '163, 93, 255',
  cyan: '93, 199, 255',
};

const POSITION_MAP: Record<Position, string> = {
  'top-left': '0% 0%',
  'top-right': '100% 0%',
  'bottom-left': '0% 100%',
  'bottom-right': '100% 100%',
  top: '50% 0%',
  bottom: '50% 100%',
  center: '50% 50%',
};

type Props = {
  accent: Accent;
  position?: Position;
  /** 0..1 multiplier on the base alpha. Default 1. */
  intensity?: number;
  className?: string;
};

export function SectionAtmosphere({
  accent,
  position = 'top-right',
  intensity = 1,
  className,
}: Props) {
  const pos = POSITION_MAP[position];

  let bg: string;
  if (accent === 'mixed') {
    const a = 0.07 * intensity;
    bg = `radial-gradient(ellipse 120% 90% at ${pos}, rgba(${RGB.blue}, ${a}) 0%, rgba(${RGB.purple}, ${a * 0.75}) 35%, rgba(${RGB.cyan}, ${a * 0.45}) 65%, transparent 85%)`;
  } else {
    const a = 0.08 * intensity;
    bg = `radial-gradient(ellipse 120% 90% at ${pos}, rgba(${RGB[accent]}, ${a}) 0%, rgba(${RGB[accent]}, ${a * 0.4}) 45%, transparent 80%)`;
  }

  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ background: bg }}
    />
  );
}
