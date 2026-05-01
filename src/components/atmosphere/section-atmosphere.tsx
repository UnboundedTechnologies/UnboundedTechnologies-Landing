import { cn } from '@/lib/utils';

// Subtle ambient radial gradient for non-hero sections. Drops into any
// `relative overflow-hidden` parent to add a soft brand-color pool so the
// section never resolves to flat black. Server component, pure CSS, zero
// JS cost.
//
// `bleed` is on by default: a secondary, weaker gradient renders at the
// opposite corner so the section has color at BOTH ends. Adjacent sections
// then meet color-to-color and the boundary fades instead of reading as
// a hard line. Set bleed={false} when you want a single directional tint.
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

const OPPOSITE_POSITION: Record<Position, Position> = {
  'top-left': 'bottom-right',
  'top-right': 'bottom-left',
  'bottom-left': 'top-right',
  'bottom-right': 'top-left',
  top: 'bottom',
  bottom: 'top',
  center: 'center',
};

function buildRadial(accent: Accent, posStr: string, alpha: number): string {
  if (accent === 'mixed') {
    return `radial-gradient(ellipse 130% 100% at ${posStr}, rgba(${RGB.blue}, ${alpha}) 0%, rgba(${RGB.purple}, ${alpha * 0.75}) 35%, rgba(${RGB.cyan}, ${alpha * 0.45}) 65%, transparent 85%)`;
  }
  return `radial-gradient(ellipse 130% 100% at ${posStr}, rgba(${RGB[accent]}, ${alpha}) 0%, rgba(${RGB[accent]}, ${alpha * 0.4}) 45%, transparent 80%)`;
}

type Props = {
  accent: Accent;
  position?: Position;
  /** 0..1 multiplier on the base alpha. Default 1. */
  intensity?: number;
  /**
   * When true (default), render a secondary, weaker gradient at the opposite
   * corner so the section blends smoothly into adjacent sections. Set to
   * false for a strictly directional tint with no opposite-corner color.
   * Has no effect when position is 'center'.
   */
  bleed?: boolean;
  className?: string;
};

export function SectionAtmosphere({
  accent,
  position = 'top-right',
  intensity = 1,
  bleed = true,
  className,
}: Props) {
  const baseAlpha = (accent === 'mixed' ? 0.07 : 0.08) * intensity;
  const pos = POSITION_MAP[position];
  const primary = buildRadial(accent, pos, baseAlpha);

  let bg = primary;
  if (bleed && position !== 'center') {
    const oppPos = POSITION_MAP[OPPOSITE_POSITION[position]];
    const secondary = buildRadial(accent, oppPos, baseAlpha * 0.55);
    bg = `${primary}, ${secondary}`;
  }

  return (
    <div
      aria-hidden
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ background: bg }}
    />
  );
}
