import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { H, PEN, Shape, edge, type Arrow, type Node, type Pen } from '../figures/whiteboard'

/* One invented airline, drawn as a whiteboard. Every part is one or more lessons on the map. */
const W = 1200
const HGT = 700

const NODES: Node[] = [
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
const SCREENS: { id: string; x: number; y: number; title: string; kind: 'live' | 'bars' | 'line' }[] = [
  { id: 'uops', x: 1030, y: 40, title: 'Control room, live', kind: 'live' },
  { id: 'ufin', x: 1030, y: 120, title: 'Finance: revenue by day', kind: 'bars' },
  { id: 'urev', x: 1030, y: 198, title: 'Pricing: seats sold', kind: 'line' },
]
const SCREEN_W = 156
const SCREEN_H = 70
const ALL: Node[] = [...NODES, ...SCREENS.map((s) => ({ id: s.id, x: s.x, y: s.y, w: SCREEN_W, h: SCREEN_H, label: '', step: 0 }))]
const BY = Object.fromEntries(ALL.map((n) => [n.id, n]))

type Flow = Arrow & { dot?: number }
const ARROWS: Flow[] = [
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
  { from: 'bronze', to: 'silver', step: 0, c: 'b', dot: 1.6 },
  { from: 'silver', to: 'gold', step: 0, c: 'b', dot: 1.6 },
  { from: 'gold', to: 'mfin', step: 0, c: 'p', dot: 2 },
  { from: 'gold', to: 'mrev', step: 0, c: 'p', dot: 2.2 },
  { from: 'gold', to: 'mmkt', step: 0, c: 'p', dot: 2.4 },
  { from: 'mfin', to: 'ufin', step: 0, c: 'p', dot: 2.1 },
  { from: 'mrev', to: 'urev', step: 0, c: 'p', dot: 1.9 },
  { from: 'mrev', to: 'uml', step: 0, c: 'p', dot: 2.5 },
  { from: 'mmkt', to: 'ucrm', step: 0, c: 'o', dash: true },
  { from: 'dag', to: 'silver', step: 0, c: 'o', dash: true },
  { from: 'dq', to: 'gold', step: 0, c: 'r', dash: true },
  { from: 'ci', to: 'dag', step: 0, dash: true },
]

function line(a: Arrow) {
  const f = BY[a.from]
  const t = BY[a.to]
  const p1 = edge(f, t.x + t.w / 2, t.y + H(t) / 2)
  const p2 = edge(t, f.x + f.w / 2, f.y + H(f) / 2)
  return { p1, p2, d: `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}` }
}

const NOTES: { x: number; y: number; text: string; c: Pen }[] = [
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

const DAG = ['ingest', 'bronze', 'silver', 'test', 'gold', 'publish']
const CI = ['pull request', 'lint + unit tests', 'build in staging', 'end-to-end + data diff', 'review', 'deploy']
const CHECKS: [string, boolean][] = [['keys unique', true], ['paid = settled', true], ['seats <= capacity', true], ['fresh < 90 min', false]]

const STAGES: { x: number; y: number; w: number; h: number; name: string; what: string; color: string; to: string }[] = [
  { x: 6, y: 16, w: 172, h: 456, name: 'Generation', what: 'Other teams create the data', color: '#132029', to: 'source-systems' },
  { x: 198, y: 16, w: 160, h: 350, name: 'Ingestion', what: 'Get it out of the source', color: '#0B8A78', to: 'ingestion-patterns' },
  { x: 378, y: 16, w: 432, h: 350, name: 'Storage and transformation', what: 'Keep it raw, then clean and model it', color: '#2456D6', to: 'warehouse-lake-lakehouse' },
  { x: 830, y: 16, w: 364, h: 350, name: 'Serving', what: 'Give each user the form they need', color: '#7A3FD1', to: 'serving-reverse-etl' },
  { x: 198, y: 374, w: 996, h: 218, name: 'Undercurrents', what: 'Orchestration, tests, CI/CD and governance run under every stage', color: '#B97700', to: 'orchestration' },
]

export default function BigPicture() {
  const [simple, setSimple] = useState(false)
  const [big, setBig] = useState(false)
  const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!big) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setBig(false)
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [big])

  return (
    <div className={`bp ${big ? 'bp-full' : ''}`}>
      <div className="bp-ctl">
        <div className="seg">
          <button aria-pressed={!simple} onClick={() => setSimple(false)}>
            The whole system
          </button>
          <button aria-pressed={simple} onClick={() => setSimple(true)}>
            How we think about it
          </button>
        </div>
        <button className="act ghost" onClick={() => setBig(!big)} aria-pressed={big}>
          {big ? 'Close (Esc)' : 'Expand'}
        </button>
      </div>

      <div className="wb-board bp-board">
        <svg
          viewBox={`0 0 ${W} ${HGT}`}
          role="img"
          aria-label="Whiteboard drawing of an airline data platform. Five sources feed a streaming path and a batch path into a lakehouse with bronze, silver and gold layers, then data marts, dashboards, a pricing model and business tools. Orchestration, data tests, governance and CI/CD run under all of it, and five groups of people own the parts."
        >
          <defs>
            <filter id="bp-wobble" x="-3%" y="-3%" width="106%" height="106%">
              <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="7" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="3" />
            </filter>
            {(Object.keys(PEN) as Pen[]).map((p) => (
              <marker key={p} id={`bp-head-${p}`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                <path d="M2 2 L10 6 L2 10" fill="none" stroke={PEN[p]} strokeWidth="2" strokeLinecap="round" />
              </marker>
            ))}
          </defs>

          <g className={`bp-detail ${simple ? 'faded' : ''}`}>
            <g className="wb-shape">
              {NODES.map((n) => (
                <Shape key={n.id} n={n} />
              ))}
              {SCREENS.map((s) => (
                <rect key={s.id} x={s.x} y={s.y} width={SCREEN_W} height={SCREEN_H} rx="8" fill="#fff" stroke={PEN.k} strokeWidth="2" />
              ))}
              {ARROWS.map((a, i) => (
                <path
                  key={i}
                  className="wb-arrow"
                  d={line(a).d}
                  stroke={PEN[a.c ?? 'k']}
                  strokeDasharray={a.dash ? '7 6' : undefined}
                  markerEnd={`url(#bp-head-${a.c ?? 'k'})`}
                />
              ))}
              {/* the DAG inside the orchestration box */}
              {DAG.map((_, i) => (
                <g key={i}>
                  <rect x={402 + i * 66} y={422} width="54" height="30" rx="6" fill="#fff" stroke={i === 3 ? PEN.r : PEN.o} strokeWidth="2" />
                  {i < DAG.length - 1 && <path d={`M${458 + i * 66} 437 h8`} stroke={PEN.o} strokeWidth="2" markerEnd="url(#bp-head-o)" fill="none" />}
                </g>
              ))}
              {/* the CI/CD steps */}
              {CI.map((_, i) => (
                <g key={i}>
                  <rect x={228 + i * 160} y={534} width="140" height="34" rx="6" fill="#fff" stroke={PEN.k} strokeWidth="2" />
                  {i < CI.length - 1 && <path d={`M${370 + i * 160} 551 h14`} stroke={PEN.k} strokeWidth="2" markerEnd="url(#bp-head-k)" fill="none" />}
                </g>
              ))}
              {/* test gates between the layers */}
              <circle cx="526" cy="241" r="10" fill="#fff" stroke={PEN.r} strokeWidth="2" />
              <circle cx="662" cy="241" r="10" fill="#fff" stroke={PEN.r} strokeWidth="2" />
              {/* screens: seat map, bars, line */}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => (
                <rect key={k} x={1042 + (k % 6) * 22} y={64 + Math.floor(k / 6) * 18} width="16" height="12" rx="2" fill={[1, 4, 8, 9].includes(k) ? '#fff' : PEN.r} stroke={PEN.r} strokeWidth="1.5" />
              ))}
              {[18, 26, 22, 34, 30, 40].map((v, k) => (
                <rect key={k} x={1044 + k * 22} y={182 - v} width="14" height={v} fill={PEN.p} />
              ))}
              <path d="M1042 258 l22 -4 l22 -6 l22 -3 l22 -12 l22 -14" fill="none" stroke={PEN.b} strokeWidth="2.6" strokeLinecap="round" />
            </g>

            {!still && !simple && (
              <g className="bp-dots">
                {ARROWS.filter((a) => a.dot).map((a, i) => (
                  <circle key={i} r="4.5" fill={PEN[a.c ?? 'k']} stroke="#fff" strokeWidth="1.5">
                    <animateMotion dur={`${a.dot}s`} begin={`-${(i * 0.37) % a.dot!}s`} repeatCount="indefinite" path={line(a).d} />
                  </circle>
                ))}
              </g>
            )}

            {NODES.map((n) => {
              const zone = n.kind === 'zone'
              const cx = zone ? n.x + 12 : n.x + n.w / 2
              const cy = zone ? n.y + 20 : n.y + H(n) / 2 + (n.kind === 'db' ? 5 : 0)
              return (
                <g key={n.id} fill={PEN[n.c ?? 'k']} textAnchor={zone ? 'start' : 'middle'}>
                  <text x={cx} y={n.sub && !zone ? cy - 3 : cy + 7} className="wb-label">
                    {n.label}
                  </text>
                  {n.sub && !zone && (
                    <text x={cx} y={cy + 15} className="wb-sub">
                      {n.sub}
                    </text>
                  )}
                </g>
              )
            })}
            {SCREENS.map((s) => (
              <text key={s.id} x={s.x + 10} y={s.y + 18} className="wb-sub" fill={PEN.k}>
                {s.title}
              </text>
            ))}
            {DAG.map((d, i) => (
              <text key={d} x={429 + i * 66} y={442} textAnchor="middle" className="bp-small" fill={i === 3 ? PEN.r : PEN.o}>
                {d}
              </text>
            ))}
            {CI.map((d, i) => (
              <text key={d} x={298 + i * 160} y={556} textAnchor="middle" className="bp-small" fill={PEN.k}>
                {d}
              </text>
            ))}
            {CHECKS.map(([name, ok], i) => (
              <text key={name} x={856} y={420 + i * 15} className="bp-small" fill={ok ? PEN.g : PEN.r}>
                {ok ? '✓' : '✗'} {name}
              </text>
            ))}
            {['catalogue + lineage', 'who can see what', 'PII masked'].map((g, i) => (
              <text key={g} x={1016} y={420 + i * 17} className="bp-small" fill={PEN.k}>
                {g}
              </text>
            ))}
            <text x="526" y="246" textAnchor="middle" className="bp-small" fill={PEN.r}>
              ✓
            </text>
            <text x="662" y="246" textAnchor="middle" className="bp-small" fill={PEN.r}>
              ✓
            </text>
            {NOTES.map((n) => (
              <text key={n.text} x={n.x} y={n.y} className="wb-note" fill={PEN[n.c]}>
                {n.text}
              </text>
            ))}
          </g>

          {simple && (
            <g className="bp-stages">
              {STAGES.map((s) => (
                <g key={s.name}>
                  <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="14" fill={s.color} fillOpacity="0.09" stroke={s.color} strokeWidth="3" />
                  <text x={s.x + s.w / 2} y={s.y + s.h / 2 - 6} textAnchor="middle" className="bp-stage" fill={s.color}>
                    {s.name}
                  </text>
                  <foreignObject x={s.x + 10} y={s.y + s.h / 2 + 4} width={s.w - 20} height="70">
                    <p className="bp-what" style={{ color: s.color }}>
                      {s.what}
                    </p>
                  </foreignObject>
                </g>
              ))}
              <rect x="6" y="604" width="1188" height="86" rx="14" fill="#132029" fillOpacity="0.06" stroke="#132029" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
            </g>
          )}
        </svg>
      </div>

      {simple && (
        <p className="bp-links">
          Start a stage:{' '}
          {STAGES.map((s) => (
            <Link key={s.name} to={`/lesson/${s.to}`} style={{ ['--line' as string]: s.color }}>
              {s.name}
            </Link>
          ))}
        </p>
      )}
    </div>
  )
}
