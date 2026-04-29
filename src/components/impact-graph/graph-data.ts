export type GraphColor = 'blue' | 'purple' | 'cyan';

export type Node = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  href: string;
  color: GraphColor;
};

export type Edge = {
  from: string;
  to: string;
  impact: string;
  color: GraphColor;
};

export const NODES: ReadonlyArray<Node> = [
  {
    id: 'user',
    label: '2,500 internal clients',
    sub: 'Renault Group',
    x: 110,
    y: 100,
    href: '/work/renault-forex',
    color: 'blue',
  },
  {
    id: 'apigw',
    label: 'API Gateway · Lambda',
    sub: 'Forex Referential',
    x: 430,
    y: 100,
    href: '/work/renault-forex',
    color: 'purple',
  },
  {
    id: 'connect',
    label: 'Amazon Connect',
    sub: 'AWS · Toronto',
    x: 660,
    y: 100,
    href: '/work/aws-connect-ivr',
    color: 'cyan',
  },
  {
    id: 'java',
    label: 'Java geocoding',
    sub: 'Renault city repo',
    x: 110,
    y: 240,
    href: '/work/renault-forex',
    color: 'blue',
  },
  {
    id: 'sns',
    label: 'SNS · DynamoDB',
    sub: 'decoupled events',
    x: 370,
    y: 240,
    href: '/work/etba-erp',
    color: 'purple',
  },
  {
    id: 'erp',
    label: 'React + Spring Boot',
    sub: 'ETBA Construction',
    x: 660,
    y: 240,
    href: '/work/etba-erp',
    color: 'purple',
  },
];

export const EDGES: ReadonlyArray<Edge> = [
  { from: 'user', to: 'apigw', impact: '→ 4B calls/mo', color: 'blue' },
  { from: 'apigw', to: 'connect', impact: '→ IVR + Salesforce', color: 'cyan' },
  { from: 'apigw', to: 'sns', impact: '→ event-driven', color: 'purple' },
  { from: 'java', to: 'sns', impact: '→ 200K addresses/batch', color: 'blue' },
  { from: 'sns', to: 'erp', impact: '→ 35% faster procurement', color: 'purple' },
];
