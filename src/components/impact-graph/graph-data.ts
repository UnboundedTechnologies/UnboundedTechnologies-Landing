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
  impact: string;
  color: GraphColor;
};

export const NODES: ReadonlyArray<Node> = [
  {
    id: 'user',
    label: '2,500 internal clients',
    sub: 'Renault Group',
    href: '/work/renault-forex',
    color: 'blue',
    category: 'origin',
  },
  {
    id: 'apigw',
    label: 'API Gateway · Lambda',
    sub: 'Forex Referential',
    href: '/work/renault-forex',
    color: 'purple',
    category: 'capability',
  },
  {
    id: 'connect',
    label: 'Amazon Connect',
    sub: 'AWS · Toronto',
    href: '/work/aws-connect-ivr',
    color: 'cyan',
    category: 'outcome',
  },
  {
    id: 'java',
    label: 'Java geocoding',
    sub: 'Renault city repo',
    href: '/work/renault-forex',
    color: 'blue',
    category: 'origin',
  },
  {
    id: 'sns',
    label: 'SNS · DynamoDB',
    sub: 'decoupled events',
    href: '/work/etba-erp',
    color: 'purple',
    category: 'capability',
  },
  {
    id: 'erp',
    label: 'React + Spring Boot',
    sub: 'ETBA Construction',
    href: '/work/etba-erp',
    color: 'purple',
    category: 'outcome',
  },
];

export const EDGES: ReadonlyArray<Edge> = [
  { from: 'user', to: 'apigw', impact: '4B calls/mo', color: 'blue' },
  { from: 'apigw', to: 'connect', impact: 'IVR + Salesforce', color: 'cyan' },
  { from: 'apigw', to: 'sns', impact: 'event-driven', color: 'purple' },
  { from: 'java', to: 'sns', impact: '200K addresses/batch', color: 'blue' },
  { from: 'sns', to: 'erp', impact: '35% faster procurement', color: 'purple' },
];

export const COLOR_HEX: Record<GraphColor, string> = {
  blue: '#5d6fff',
  purple: '#a35dff',
  cyan: '#5dc7ff',
};
