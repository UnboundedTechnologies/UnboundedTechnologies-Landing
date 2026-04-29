'use client';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { COLOR_HEX, EDGES, type Edge } from './graph-data';
import type { CardRect } from './use-card-positions';

type Props = {
  rects: Record<string, CardRect>;
  width: number;
  height: number;
};

type RoutedEdge = {
  edge: Edge;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  orientation: 'horizontal' | 'vertical' | 'diagonal';
};

function routeEdge(edge: Edge, rects: Record<string, CardRect>): RoutedEdge | null {
  const a = rects[edge.from];
  const b = rects[edge.to];
  if (!a || !b) return null;
  const aCx = a.x + a.width / 2;
  const aCy = a.y + a.height / 2;
  const bCx = b.x + b.width / 2;
  const bCy = b.y + b.height / 2;

  const sameRow = Math.abs(aCy - bCy) < a.height * 0.5;
  const sameCol = Math.abs(aCx - bCx) < a.width * 0.5;

  let x1: number;
  let y1: number;
  let x2: number;
  let y2: number;
  let orientation: RoutedEdge['orientation'];

  if (sameRow) {
    if (aCx < bCx) {
      x1 = a.x + a.width;
      y1 = aCy;
      x2 = b.x;
      y2 = bCy;
    } else {
      x1 = a.x;
      y1 = aCy;
      x2 = b.x + b.width;
      y2 = bCy;
    }
    orientation = 'horizontal';
  } else if (sameCol) {
    if (aCy < bCy) {
      x1 = aCx;
      y1 = a.y + a.height;
      x2 = bCx;
      y2 = b.y;
    } else {
      x1 = aCx;
      y1 = a.y;
      x2 = bCx;
      y2 = b.y + b.height;
    }
    orientation = 'vertical';
  } else {
    x1 = aCx;
    y1 = aCy;
    x2 = bCx;
    y2 = bCy;
    orientation = 'diagonal';
  }

  return {
    edge,
    x1,
    y1,
    x2,
    y2,
    midX: (x1 + x2) / 2,
    midY: (y1 + y2) / 2,
    orientation,
  };
}

export function GraphEdges({ rects, width, height }: Props) {
  const routed = useMemo(
    () => EDGES.map((e) => routeEdge(e, rects)).filter((r): r is RoutedEdge => r !== null),
    [rects],
  );

  if (routed.length === 0 || width === 0 || height === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      role="presentation"
      focusable="false"
    >
      {routed.map(({ edge, x1, y1, x2, y2, midX, midY, orientation }, i) => {
        const stroke = COLOR_HEX[edge.color];
        const labelOffset = orientation === 'horizontal' ? -10 : 14;
        const textAnchor = orientation === 'vertical' ? 'start' : 'middle';
        const labelX = orientation === 'vertical' ? midX + 12 : midX;
        const labelY = midY + labelOffset;
        return (
          <g key={`${edge.from}-${edge.to}`}>
            <motion.line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={1.25}
              strokeOpacity={0.35}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.0, delay: 0.4 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-80px' }}
            />
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={stroke}
              strokeWidth={1.5}
              strokeOpacity={0.95}
              strokeLinecap="round"
              className="graph-energy-line"
            />
            <motion.text
              x={labelX}
              y={labelY}
              fill={stroke}
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              textAnchor={textAnchor}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.95 }}
              transition={{ duration: 0.4, delay: 1.0 + i * 0.18 }}
              viewport={{ once: true, margin: '-80px' }}
            >
              {edge.impact}
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
}
