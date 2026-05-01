'use client';

import { COLOR_HEX, type Edge, type Node } from './graph-data';

// Mobile-only equivalent of the SVG edge overlay. On desktop, edges and
// their pill labels are SVG elements positioned absolutely between
// cards (see GraphEdges). On mobile, the cards stack into a single
// column and the SVG overlay is hidden, taking the pill stats with it.
//
// This component renders, between consecutive cards in the rendered
// order, a small connector strip showing the edge's primary + secondary
// labels. Only edges whose source/destination are *adjacent* in the
// nodes array get a strip - cross-row jumps (like the AWS gateway ->
// Renault forex vertical edge on desktop) are dropped on mobile because
// they can't read coherently in a vertical reading order.

type Props = {
  nodes: ReadonlyArray<Node>;
  edges: ReadonlyArray<Edge>;
  /** Index of the source card the strip sits *below*. */
  sourceIndex: number;
};

export function MobileEdgeStrip({ nodes, edges, sourceIndex }: Props) {
  const source = nodes[sourceIndex];
  const next = nodes[sourceIndex + 1];
  if (!source || !next) return null;

  const edge = edges.find((e) => e.from === source.id && e.to === next.id);
  if (!edge) return null;

  const accent = COLOR_HEX[edge.color];

  return (
    <div className="md:hidden flex flex-col items-center gap-1.5 py-1" aria-hidden>
      {/* Connector line from card above to the pill */}
      <span
        className="block w-px h-3"
        style={{ background: `linear-gradient(to bottom, transparent, ${accent}80)` }}
      />
      {/* Pill with primary + secondary text */}
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
      {/* Connector line from pill down to next card */}
      <span
        className="block w-px h-3"
        style={{ background: `linear-gradient(to bottom, ${accent}80, transparent)` }}
      />
    </div>
  );
}
