// Inline tech-diagram presets for case-study pages (spec §6.2 item 4).
//
// Each preset is a scoped subgraph that reuses the impact-graph node/edge
// primitives so the homepage graph and the case-study diagrams share the same
// visual language. Frontmatter declares the preset name via the optional
// `diagram` field; the case-study layout looks the data up here and renders
// it with `<GraphCanvas variant="inline">`.
//
// Locale-agnostic by design: labels are technical terms shared across en/fr.

import type { Edge, Node } from '@/components/impact-graph/graph-data';

type CaseStudyDiagram = {
  nodes: ReadonlyArray<Node>;
  edges: ReadonlyArray<Edge>;
};

const RENAULT_BOTTOM_ROW: CaseStudyDiagram = {
  nodes: [
    {
      id: 'clients',
      label: '2,500 internal clients',
      sub: 'Renault Group',
      href: '/work/renault-forex',
      color: 'blue',
      category: 'origin',
    },
    {
      id: 'forex',
      label: 'Forex Referential',
      sub: 'Java · Geocoding',
      href: '/work/renault-forex',
      color: 'purple',
      category: 'capability',
    },
    {
      id: 'hybrid',
      label: 'Hybrid GCP + AWS',
      sub: 'DataLake · #1 Ranked',
      href: '/work/renault-forex',
      color: 'cyan',
      category: 'outcome',
    },
  ],
  edges: [
    {
      from: 'clients',
      to: 'forex',
      primary: '4B calls',
      secondary: 'per month',
      color: 'blue',
    },
    {
      from: 'forex',
      to: 'hybrid',
      primary: '0 data-loss',
      secondary: '3 years uptime',
      color: 'purple',
    },
  ],
};

const AWS_TOP_ROW: CaseStudyDiagram = {
  nodes: [
    {
      id: 'lambda',
      label: 'AWS Lambda',
      sub: 'Node · Python · Java',
      href: '/work/aws-connect-ivr',
      color: 'blue',
      category: 'origin',
    },
    {
      id: 'gateway',
      label: 'API Gateway · SNS · SQS',
      sub: 'Integration Layer',
      href: '/work/aws-connect-ivr',
      color: 'purple',
      category: 'capability',
    },
    {
      id: 'connect',
      label: 'Amazon Connect · Pinpoint',
      sub: 'CPaaS · CCaaS',
      href: '/work/aws-connect-ivr',
      color: 'cyan',
      category: 'outcome',
    },
  ],
  edges: [
    {
      from: 'lambda',
      to: 'gateway',
      primary: 'Multi-runtime',
      secondary: 'production-grade',
      color: 'blue',
    },
    {
      from: 'gateway',
      to: 'connect',
      primary: 'Real-time',
      secondary: 'IVR · Pinpoint',
      color: 'purple',
    },
  ],
};

const ETBA_ERP_STACK: CaseStudyDiagram = {
  nodes: [
    {
      id: 'react',
      label: 'React',
      sub: 'Front-end',
      href: '/work/etba-erp',
      color: 'blue',
      category: 'origin',
    },
    {
      id: 'spring',
      label: 'Spring Boot',
      sub: 'Workflow engine',
      href: '/work/etba-erp',
      color: 'purple',
      category: 'capability',
    },
    {
      id: 'postgres',
      label: 'PostgreSQL on AWS',
      sub: 'Audit by design',
      href: '/work/etba-erp',
      color: 'cyan',
      category: 'outcome',
    },
  ],
  edges: [
    {
      from: 'react',
      to: 'spring',
      primary: 'Forms',
      secondary: 'Approvals',
      color: 'blue',
    },
    {
      from: 'spring',
      to: 'postgres',
      primary: 'Single source',
      secondary: 'of truth',
      color: 'purple',
    },
  ],
};

const PRESETS = {
  'renault-bottom-row': RENAULT_BOTTOM_ROW,
  'aws-top-row': AWS_TOP_ROW,
  'etba-erp-stack': ETBA_ERP_STACK,
} as const satisfies Record<string, CaseStudyDiagram>;

type CaseStudyDiagramPreset = keyof typeof PRESETS;

/**
 * Look up a diagram preset by name. Returns null when the name is unknown so
 * callers can render a graceful fallback (skip the section).
 */
export function getCaseStudyDiagram(presetName: string): CaseStudyDiagram | null {
  if (presetName in PRESETS) {
    return PRESETS[presetName as CaseStudyDiagramPreset];
  }
  return null;
}
