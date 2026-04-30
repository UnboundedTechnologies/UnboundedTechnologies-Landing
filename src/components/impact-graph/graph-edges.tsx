'use client';
import { motion } from 'motion/react';
import { useMemo } from 'react';
import { type CardRect, COLOR_HEX, type Edge, type RoutedEdge, routeEdge } from './graph-data';

type Props = {
  edges: ReadonlyArray<Edge>;
  rects: Record<string, CardRect>;
  width: number;
  height: number;
  /**
   * Px distance between the connecting line and the floating stat pill. The
   * pill is anchored at this offset perpendicular to the line; the dashed
   * stem fills the gap. Tighter inline diagrams use a larger value so the
   * pill clearly floats above the row instead of looking jammed against the
   * cards.
   */
  pillDistance?: number;
};

export function GraphEdges({ edges, rects, width, height, pillDistance = 64 }: Props) {
  const PILL_DISTANCE = pillDistance;
  const routed = useMemo(
    () => edges.map((e) => routeEdge(e, rects)).filter((r): r is RoutedEdge => r !== null),
    [edges, rects],
  );

  if (routed.length === 0 || width === 0 || height === 0) return null;

  const verticalCenter = height / 2;

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
        {routed.map(({ edge, x1, y1, x2, y2, midX, midY, orientation }, i) => {
          const stroke = COLOR_HEX[edge.color];
          const isVertical = orientation === 'vertical';
          const pillUp = !isVertical && midY < verticalCenter;
          const stemEndX = isVertical ? midX + PILL_DISTANCE : midX;
          const stemEndY = isVertical ? midY : pillUp ? midY - PILL_DISTANCE : midY + PILL_DISTANCE;
          const lineDelay = i * 0.08;
          const dotDelay = 0.55 + i * 0.08;
          const stemDelay = 0.7 + i * 0.08;
          return (
            <g key={`line-${edge.from}-${edge.to}`}>
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={1.5}
                strokeOpacity={0.55}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: lineDelay, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              />
              <motion.line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={stroke}
                strokeWidth={1.5}
                strokeOpacity={0.95}
                strokeLinecap="round"
                className="graph-energy-line"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: lineDelay + 0.5, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              />
              <motion.circle
                cx={x1}
                cy={y1}
                r={4}
                fill={stroke}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: dotDelay, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              />
              <motion.circle
                cx={x2}
                cy={y2}
                r={4}
                fill={stroke}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: dotDelay, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              />
              <motion.line
                x1={midX}
                y1={midY}
                x2={stemEndX}
                y2={stemEndY}
                stroke={stroke}
                strokeWidth={1.25}
                strokeOpacity={0.55}
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: stemDelay, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              />
              <motion.line
                x1={midX}
                y1={midY}
                x2={stemEndX}
                y2={stemEndY}
                stroke={stroke}
                strokeWidth={1.25}
                strokeOpacity={0.95}
                strokeLinecap="round"
                className="graph-energy-line"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: stemDelay + 0.4, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              />
              <motion.circle
                cx={midX}
                cy={midY}
                r={3.5}
                fill={stroke}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: stemDelay, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true, margin: '-80px' }}
              />
            </g>
          );
        })}
      </svg>

      {routed.map(({ edge, midX, midY, orientation }, i) => {
        const stroke = COLOR_HEX[edge.color];
        const isVertical = orientation === 'vertical';
        const pillUp = !isVertical && midY < verticalCenter;
        const anchorLeft = isVertical ? midX + PILL_DISTANCE : midX;
        const anchorTop = isVertical ? midY : pillUp ? midY - PILL_DISTANCE : midY + PILL_DISTANCE;
        const translateClass = isVertical
          ? '-translate-y-1/2'
          : pillUp
            ? '-translate-x-1/2 -translate-y-full'
            : '-translate-x-1/2';
        return (
          <div
            key={`pill-${edge.from}-${edge.to}`}
            className={`absolute pointer-events-none ${translateClass}`}
            style={{ left: anchorLeft, top: anchorTop }}
          >
            <motion.div
              className="graph-pill"
              style={{ ['--pill-glow' as string]: `${stroke}55` }}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.85 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true, margin: '-80px' }}
            >
              <div
                className="px-3.5 py-2 rounded-lg border bg-bg-elevated/90 backdrop-blur-md font-mono shadow-xl flex flex-col items-center whitespace-nowrap"
                style={{ borderColor: `${stroke}b3` }}
              >
                <span className="font-semibold text-text text-[12px] leading-tight tracking-tight">
                  {edge.primary}
                </span>
                {edge.secondary && (
                  <span className="text-text-muted font-normal text-[10px] leading-tight mt-0.5 tracking-tight">
                    {edge.secondary}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
