'use client';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { type CardRect, COLOR_HEX, EDGES, type RoutedEdge, routeEdge } from './graph-data';

type Props = {
  rects: Record<string, CardRect>;
  width: number;
  height: number;
};

export function GraphEdges({ rects, width, height }: Props) {
  const routed = useMemo(
    () => EDGES.map((e) => routeEdge(e, rects)).filter((r): r is RoutedEdge => r !== null),
    [rects],
  );

  if (routed.length === 0 || width === 0 || height === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      <svg
        className="absolute inset-0"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="presentation"
        aria-hidden
        focusable="false"
      >
        {routed.map(({ edge, x1, y1, x2, y2 }, i) => {
          const stroke = COLOR_HEX[edge.color];
          return (
            <g key={`line-${edge.from}-${edge.to}`}>
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
            </g>
          );
        })}
      </svg>

      {routed.map(({ edge, midX, midY, orientation }, i) => {
        const stroke = COLOR_HEX[edge.color];
        const offsetX = orientation === 'vertical' ? 64 : 0;
        const offsetY = orientation === 'horizontal' ? -36 : 0;
        return (
          <motion.div
            key={`pill-${edge.from}-${edge.to}`}
            className="graph-pill absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: midX + offsetX,
              top: midY + offsetY,
              ['--pill-glow' as string]: `${stroke}55`,
            }}
            initial={{ opacity: 0, scale: 0.85, y: 6 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <div
              className="px-3 py-1.5 rounded-xl border bg-bg-elevated/70 backdrop-blur-md font-mono shadow-lg flex flex-col items-center"
              style={{ borderColor: stroke }}
            >
              <span className="font-semibold text-text text-[12px] leading-tight">
                {edge.primary}
              </span>
              {edge.secondary && (
                <span className="text-text-muted font-normal text-[10px] leading-tight mt-0.5">
                  {edge.secondary}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
