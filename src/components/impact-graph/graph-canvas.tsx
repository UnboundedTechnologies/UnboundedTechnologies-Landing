'use client';
import { domAnimation, LazyMotion } from 'motion/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { GraphCard } from './graph-card';
import type { Edge, Node } from './graph-data';
import { GraphEdges } from './graph-edges';
import { MobileEdgeStrip } from './mobile-edge-strip';
import { MobileGraphBreak } from './mobile-graph-break';
import { useCardPositions } from './use-card-positions';

type Variant = 'page' | 'inline';

type Props = {
  nodes: ReadonlyArray<Node>;
  edges: ReadonlyArray<Edge>;
  /**
   * 'page'   - homepage Impact Graph spacing (large, generous gaps).
   * 'inline' - tighter spacing for embedding inside a case-study layout.
   * Default: 'page'.
   */
  variant?: Variant;
  /**
   * When set, any node whose `href` resolves to the active slug renders as a
   * non-link card (avoids self-links on the case-study page that owns the
   * diagram).
   */
  activeSlug?: string;
};

// Tailwind grid-cols mapping. Kept as literal class strings so the v4 oxide
// compiler can detect them at build time.
const GRID_COLS_CLASS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

/**
 * Render a graph (cards + animated SVG edges) from a data spec.
 *
 * The homepage path (`variant='page'`) reproduces the exact spacing classes
 * used previously inline in `ImpactGraph` (mt-28/36, gap-y-20/48, gap-x-12/40).
 * The `inline` variant uses tighter spacing suitable for mid-page embedding.
 *
 * Pattern A is preserved: the outer `motion.div` of each `GraphCard` is the
 * measurement target, and the inner Link (when present) fills the parent.
 */
export function GraphCanvas({ nodes, edges, variant = 'page', activeSlug }: Props) {
  const nodeIds = useMemo(() => nodes.map((n) => n.id), [nodes]);
  const { containerRef, register, rects, recompute } = useCardPositions(nodeIds);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setContainerSize({ width: el.offsetWidth, height: el.offsetHeight });
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const obs = new ResizeObserver(update);
      obs.observe(el);
      return () => obs.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [containerRef]);

  useEffect(() => {
    if (containerSize.width > 0) recompute();
  }, [containerSize.width, recompute]);

  // Derive grid columns from node categories. The graph layout convention is
  // one column per unique category (origin / capability / outcome), with rows
  // formed by repeated categories. This matches the homepage 3-col x 2-row
  // arrangement and the case-study 3-col x 1-row arrangement automatically.
  const uniqueCategoryCount = new Set(nodes.map((n) => n.category)).size;
  const colsClass = GRID_COLS_CLASS[uniqueCategoryCount] ?? 'md:grid-cols-3';

  // On mobile the grid gap drops to 0 so card + connector sit flush
  // (the connector strip's own padding provides breathing). This lets
  // the dashed energy line actually touch the card edges rather than
  // float in dead space. Where a graph break is needed (no edge between
  // adjacent cards because they belong to different case studies) the
  // MobileGraphBreak adds explicit my-8 to provide the visual gap.
  // md+ restores the spacious 2D layout the desktop SVG path needs.
  const spacing =
    variant === 'page'
      ? 'mt-20 md:mt-36 gap-y-0 md:gap-y-48 gap-x-0 md:gap-x-40'
      : 'mt-24 md:mt-52 mb-10 md:mb-20 gap-y-0 md:gap-y-24 gap-x-0 md:gap-x-24';

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        ref={containerRef}
        className={cn('relative grid grid-cols-1', colsClass, spacing)}
        data-graph-variant={variant}
      >
        {nodes.map((n, i) => {
          const isSelf = activeSlug !== undefined && n.href.replace(/^\/work\//, '') === activeSlug;
          const isLast = i === nodes.length - 1;
          const next = isLast ? null : nodes[i + 1];
          const hasEdgeToNext =
            next !== null && edges.some((e) => e.from === n.id && e.to === next.id);
          // Every graph group on mobile gets a labeled header so the user
          // sees the case-study name (e.g. "AWS · Customer Reach") above
          // its first card. A group starts at i=0 or whenever the case-
          // study href changes vs the previous card. The header doubles as
          // the visual "break" between groups - no separate inter-card
          // divider needed since every new group already declares itself.
          const isGraphStart = i === 0 || nodes[i - 1].href !== n.href;
          return (
            <Fragment key={n.id}>
              {isGraphStart && <MobileGraphBreak nextHref={n.href} />}
              <GraphCard
                ref={register(n.id)}
                label={n.label}
                sub={n.sub}
                href={isSelf ? undefined : n.href}
                color={n.color}
                category={n.category}
                index={i}
              />
              {/* Animated connector between this card and the next when an
                edge exists (always within a single graph). Hidden md+
                where the SVG overlay owns this layer. */}
              {!isLast && hasEdgeToNext && (
                <MobileEdgeStrip nodes={nodes} edges={edges} sourceIndex={i} />
              )}
            </Fragment>
          );
        })}
        <div className="hidden md:block">
          <GraphEdges
            edges={edges}
            rects={rects}
            width={containerSize.width}
            height={containerSize.height}
            pillDistance={variant === 'page' ? 64 : 120}
          />
        </div>
      </div>
    </LazyMotion>
  );
}
