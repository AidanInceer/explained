import type { Arrow, Node, Pen } from '../../figures/whiteboard'

/* One invented airline. Positions are in drawing units on a 1200 x 700 board. Every part is one or more lessons on the map. */
export const W = 1200
export const HGT = 700

export const NODES: Node[] = [
  // sources
  { id: 'ev', x: 16, y: 56, w: 150, label: 'Web + app', sub: 'searches, clicks', step: 0 },
  { id: 'book', x: 16, y: 146, w: 150, h: 58, label: 'Booking service', sub: 'Postgres, OLTP', kind: 'db', step: 0 },
  { id: 'pay', x: 16, y: 236, w: 150, label: 'Payment provider', sub: 'API + webhooks', step: 0 },
  { id: 'ops', x: 16, y: 320, w: 150, label: 'Flight operations', sub: 'schedule files', step: 0 },
  { id: 'crm', x: 16, y: 404, w: 150, label: 'CRM', sub: 'SaaS API', step: 0 },
  // ingestion
  { id: 'kafka', x: 212, y: 56, w: 130, label: 'Kafka', sub: 'event stream', kind: 'log', c: 'g', step: 0 },
  { id: 'cdc', x: 212, y: 148, w: 130, label: 'Debezium', sub: 'CDC from the log', c: 'g', step: 0 },
  { id: 'load', x: 212, y: 300, w: 130, h: 58, label: 'Connectors', sub: 'batch, hourly', c: 'g', step: 0 },
  // streaming path
  { id: 'flink', x: 404, y: 56, w: 120, label: 'Flink', sub: 'windows, state', c: 'r', step: 0 },
  { id: 'rt', x: 664, y: 54, w: 120, h: 58, label: 'Live store', sub: 'seats, prices', kind: 'db', c: 'r', step: 0 },
  // lakehouse
  { id: 'lh', x: 388, y: 150, w: 412, h: 200, label: 'Lakehouse: Iceberg tables in object storage', kind: 'zone', c: 'b', step: 0 },
  { id: 'bronze', x: 404, y: 196, w: 108, h: 90, label: 'Bronze', sub: 'raw changes', kind: 'db', c: 'b', step: 0 },
  { id: 'silver', x: 540, y: 196, w: 108, h: 90, label: 'Silver', sub: 'clean, current', kind: 'db', c: 'b', step: 0 },
  { id: 'gold', x: 676, y: 196, w: 108, h: 90, label: 'Gold', sub: 'facts + dims', kind: 'db', c: 'p', step: 0 },
  // marts
  { id: 'mfin', x: 846, y: 160, w: 130, h: 46, label: 'Finance mart', c: 'p', step: 0 },
  { id: 'mrev', x: 846, y: 222, w: 130, h: 46, label: 'Revenue mart', c: 'p', step: 0 },
  { id: 'mmkt', x: 846, y: 284, w: 130, h: 46, label: 'Marketing mart', c: 'p', step: 0 },
  // users
  { id: 'uml', x: 1030, y: 276, w: 156, h: 42, label: 'Pricing model', kind: 'who', step: 0 },
  { id: 'ucrm', x: 1030, y: 326, w: 156, h: 42, label: 'Email + CRM', kind: 'who', c: 'o', step: 0 },
  // undercurrents
  { id: 'dag', x: 388, y: 380, w: 412, h: 92, label: 'Airflow DAG: what runs, and in which order', kind: 'zone', c: 'o', step: 0 },
  { id: 'dq', x: 846, y: 380, w: 130, h: 92, label: 'Data tests', kind: 'zone', c: 'r', step: 0 },
  { id: 'gov', x: 1004, y: 380, w: 182, h: 92, label: 'Governance', kind: 'zone', c: 'k', step: 0 },
  { id: 'ci', x: 212, y: 498, w: 974, h: 84, label: 'CI/CD: every change is tested before it reaches production', kind: 'zone', c: 'k', step: 0 },
  // people
  { id: 't1', x: 16, y: 626, w: 170, h: 50, label: 'Product teams', sub: 'own the sources', kind: 'who', step: 0 },
  { id: 't2', x: 208, y: 626, w: 226, h: 50, label: 'Data engineers', sub: 'ingestion, lakehouse, DAGs', kind: 'who', c: 'g', step: 0 },
  { id: 't3', x: 456, y: 626, w: 226, h: 50, label: 'Analytics engineers', sub: 'models, marts, tests', kind: 'who', c: 'p', step: 0 },
  { id: 't4', x: 704, y: 626, w: 210, h: 50, label: 'Platform + security', sub: 'CI/CD, access', kind: 'who', c: 'o', step: 0 },
  { id: 't5', x: 936, y: 626, w: 250, h: 50, label: 'Analysts, finance, pricing', sub: 'use the data', kind: 'who', c: 'b', step: 0 },
]

/** Screens the users look at. Drawn by hand below, so they are not in NODES. */
export const SCREENS: { id: string; x: number; y: number; title: string; kind: 'live' | 'bars' | 'line' }[] = [
  { id: 'uops', x: 1030, y: 40, title: 'Control room, live', kind: 'live' },
  { id: 'ufin', x: 1030, y: 120, title: 'Finance: revenue by day', kind: 'bars' },
  { id: 'urev', x: 1030, y: 198, title: 'Pricing: seats sold', kind: 'line' },
]
export const SCREEN_W = 156
export const SCREEN_H = 70
const ALL: Node[] = [...NODES, ...SCREENS.map((s) => ({ id: s.id, x: s.x, y: s.y, w: SCREEN_W, h: SCREEN_H, label: '', step: 0 }))]
export const BY = Object.fromEntries(ALL.map((n) => [n.id, n]))

export type Flow = Arrow & { dot?: number }
export const ARROWS: Flow[] = [
  { from: 'ev', to: 'kafka', step: 0, c: 'g', dot: 1.6 },
  { from: 'book', to: 'cdc', step: 0, c: 'g', dot: 1.8 },
  { from: 'cdc', to: 'kafka', step: 0, c: 'g', dot: 1.4 },
  { from: 'pay', to: 'load', step: 0, c: 'g', dot: 2.4 },
  { from: 'ops', to: 'load', step: 0, c: 'g', dot: 2.8 },
  { from: 'crm', to: 'load', step: 0, c: 'g', dot: 3.2 },
  { from: 'kafka', to: 'flink', step: 0, c: 'r', dot: 1.2 },
  { from: 'flink', to: 'rt', step: 0, c: 'r', dot: 1.5 },
  { from: 'rt', to: 'uops', step: 0, c: 'r', dot: 1.9 },
  { from: 'kafka', to: 'bronze', step: 0, c: 'b', dot: 2.2 },
  { from: 'load', to: 'bronze', step: 0, c: 'b', dot: 2.6 },
  { from: 'bronze', to: 'silver', step: 0, c: 'b', dot: 2.1 },
  { from: 'silver', to: 'gold', step: 0, c: 'b', dot: 2.1 },
  { from: 'gold', to: 'mfin', step: 0, c: 'p', dot: 2 },
  { from: 'gold', to: 'mrev', step: 0, c: 'p', dot: 2.2 },
  { from: 'gold', to: 'mmkt', step: 0, c: 'p', dot: 2.4 },
  { from: 'mfin', to: 'ufin', step: 0, c: 'p', dot: 2.1 },
  { from: 'mrev', to: 'urev', step: 0, c: 'p', dot: 1.9 },
  { from: 'mrev', to: 'uml', step: 0, c: 'p', dot: 2.5 },
  { from: 'mmkt', to: 'ucrm', step: 0, c: 'o', dot: 3.4 },
  { from: 'dag', to: 'silver', step: 0, c: 'o', dash: true },
  { from: 'dq', to: 'gold', step: 0, c: 'r', dash: true },
]


export const NOTES: { x: number; y: number; text: string; c: Pen }[] = [
  { x: 16, y: 36, text: 'sources: where data starts', c: 'k' },
  { x: 404, y: 36, text: 'streaming path: seconds', c: 'r' },
  { x: 212, y: 384, text: 'batch path: hourly', c: 'g' },
  { x: 500, y: 312, text: 'Spark', c: 'b' },
  { x: 642, y: 312, text: 'dbt', c: 'b' },
  { x: 540, y: 336, text: 'tests must pass between layers', c: 'r' },
  { x: 846, y: 146, text: 'data marts', c: 'p' },
  { x: 1030, y: 26, text: 'who uses it', c: 'k' },
  { x: 846, y: 348, text: 'reverse ETL', c: 'o' },
  { x: 16, y: 612, text: 'the people', c: 'k' },
]

export const DAG = ['ingest', 'bronze', 'silver', 'test', 'gold', 'publish']
export const CI = ['pull request', 'lint + unit tests', 'build in staging', 'end-to-end + data diff', 'review', 'deploy']
export const CHECKS: [string, boolean][] = [['keys unique', true], ['paid = settled', true], ['seats <= capacity', true], ['fresh < 90 min', false]]

export const STAGES: { x: number; y: number; w: number; h: number; name: string; what: string; color: string; to: string }[] = [
  { x: 6, y: 16, w: 172, h: 456, name: 'Generation', what: 'Other teams create the data', color: '#132029', to: 'source-systems' },
  { x: 198, y: 16, w: 160, h: 350, name: 'Ingestion', what: 'Get it out of the source', color: '#0B8A78', to: 'ingestion-patterns' },
  { x: 378, y: 16, w: 432, h: 350, name: 'Storage and transformation', what: 'Keep it raw, then clean and model it', color: '#2456D6', to: 'warehouse-lake-lakehouse' },
  { x: 830, y: 16, w: 364, h: 350, name: 'Serving', what: 'Give each user the form they need', color: '#7A3FD1', to: 'serving-reverse-etl' },
  { x: 198, y: 374, w: 996, h: 218, name: 'Undercurrents', what: 'Orchestration, tests, CI/CD and governance run under every stage', color: '#B97700', to: 'orchestration' },
]

