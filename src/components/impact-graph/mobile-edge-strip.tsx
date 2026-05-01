'use client';

import { COLOR_HEX, type Edge, type Node } from './graph-data';

// Mobile-only equivalent of the SVG edge overlay. On desktop, edges and
// their pill labels are SVG elements positioned absolutely between
// cards (see GraphEdges). On mobile, the cards stack into a single
// column and the SVG overlay is hidden, taking the pill stats with it.
//
// This component renders, between consecutive cards in the rendered
// order, a small connector strip showing the edge's primary + secondary
// labels, and crucially reuses the exact same desktop animations:
//   - graph-energy-line: dashed stroke-dashoffset packets flowing along
//     the connector lines (same @keyframes graph-energy in globals.css).
//   - graph-pill + --pill-glow: pill body pulses its glow color with
//     the same @keyframes graph-pill-pulse desktop pills use.
//
// Only edges whose source/destination are *adjacent* in the nodes array
// get a strip - cross-row jumps (like the AWS gateway -> Renault forex
// vertical edge on desktop) are dropped on mobile because they can't
// read coherently in a linear vertical reading order.

type Props = {
  nodes: ReadonlyArray<Node>;
  edges: ReadonlyArray<Edge>;
  /** Index of the source card the strip sits *below*. */
  sourceIndex: number;
};

// Lines are tall enough to read as a meaningful connector and span the
// space between cards (the parent grid uses gap-y-0 on mobile so the
// strip + card sit flush; the strip's own padding provides breathing).
const LINE_HEIGHT = 32;

export function MobileEdgeStrip({ nodes, edges, sourceIndex }: Props) {
  const source = nodes[sourceIndex];
  const next = nodes[sourceIndex + 1];
  if (!source || !next) return null;

  const edge = edges.find((e) => e.from === source.id && e.to === next.id);
  if (!edge) return null;

  const accent = COLOR_HEX[edge.color];

  return (
    <div className="md:hidden flex flex-col items-center gap-2 py-3" aria-hidden>
      {/* Connector line above the pill - SVG so the energy-packet dash
          animation plays exactly like desktop edges. */}
      <svg width="2" height={LINE_HEIGHT} className="overflow-visible block" aria-hidden>
        <title>edge in</title>
        <line
          x1={1}
          y1={0}
          x2={1}
          y2={LINE_HEIGHT}
          stroke={accent}
          strokeWidth={1.5}
          strokeOpacity={0.7}
          className="graph-energy-line"
        />
      </svg>

      {/* Pill body. Wrapper carries graph-pill class + --pill-glow so the
          pulse animation in globals.css picks it up; inner div is the
          actual visual surface (mirrors the desktop graph-pill structure). */}
      <div className="graph-pill" style={{ ['--pill-glow' as string]: `${accent}cc` }}>
        <div
          className="inline-flex items-center gap-2 rounded-full border bg-bg-elevated/70 backdrop-blur-md px-3 py-1.5"
          style={{ borderColor: `${accent}40` }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.14em] font-semibold"
            style={{ color: accent }}
          >
            {edge.primary}
          </span>
          {edge.secondary && (
            <>
              <span aria-hidden className="text-text-faint">
                ·
              </span>
              <span className="font-mono text-[10px] text-text-muted">{edge.secondary}</span>
            </>
          )}
        </div>
      </div>

      {/* Connector line below the pill */}
      <svg width="2" height={LINE_HEIGHT} className="overflow-visible block" aria-hidden>
        <title>edge out</title>
        <line
          x1={1}
          y1={0}
          x2={1}
          y2={LINE_HEIGHT}
          stroke={accent}
          strokeWidth={1.5}
          strokeOpacity={0.7}
          className="graph-energy-line"
        />
      </svg>
    </div>
  );
}
