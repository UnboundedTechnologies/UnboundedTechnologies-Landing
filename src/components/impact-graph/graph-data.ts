export type GraphColor = 'blue' | 'purple' | 'cyan';
export type GraphCategory = 'origin' | 'capability' | 'outcome';

export type Node = {
  id: string;
  label: string;
  sub: string;
  href: string;
  color: GraphColor;
  category: GraphCategory;
};

export type Edge = {
  from: string;
  to: string;
  primary: string;
  secondary?: string;
  color: GraphColor;
};

export const NODES: ReadonlyArray<Node> = [
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
];

export const EDGES: ReadonlyArray<Edge> = [
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
  {
    from: 'gateway',
    to: 'forex',
    primary: 'p95 < 100ms',
    secondary: 'production latency',
    color: 'purple',
  },
  { from: 'clients', to: 'forex', primary: '4B calls', secondary: 'per month', color: 'blue' },
  {
    from: 'forex',
    to: 'hybrid',
    primary: '0 data-loss',
    secondary: '3 years uptime',
    color: 'purple',
  },
];

export const COLOR_HEX: Record<GraphColor, string> = {
  blue: '#5d6fff',
  purple: '#a35dff',
  cyan: '#5dc7ff',
};

export type CardRect = { x: number; y: number; width: number; height: number };

export type RoutedEdge = {
  edge: Edge;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  midX: number;
  midY: number;
  orientation: 'horizontal' | 'vertical' | 'diagonal';
};

export function routeEdge(edge: Edge, rects: Record<string, CardRect>): RoutedEdge | null {
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
    const sharedY = (aCy + bCy) / 2;
    if (aCx < bCx) {
      x1 = a.x + a.width;
      y1 = sharedY;
      x2 = b.x;
      y2 = sharedY;
    } else {
      x1 = a.x;
      y1 = sharedY;
      x2 = b.x + b.width;
      y2 = sharedY;
    }
    orientation = 'horizontal';
  } else if (sameCol) {
    const sharedX = (aCx + bCx) / 2;
    if (aCy < bCy) {
      x1 = sharedX;
      y1 = a.y + a.height;
      x2 = sharedX;
      y2 = b.y;
    } else {
      x1 = sharedX;
      y1 = a.y;
      x2 = sharedX;
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
