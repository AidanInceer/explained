import { useEffect, useRef, useState } from 'react'
import Corners from '../components/Corners'

export type Pen = 'k' | 'b' | 'r' | 'g' | 'p' | 'o'
export const PEN: Record<Pen, string> = { k: '#1d2a33', b: '#2456d6', r: '#c5372c', g: '#0b8a78', p: '#7a3fd1', o: '#a86a00' }

export interface Node {
  id: string
  x: number
  y: number
  w: number
  h?: number
  label: string
  sub?: string
  kind?: 'box' | 'db' | 'log' | 'who' | 'zone'
  c?: Pen
  step: number
}
export interface Arrow {
  from: string
  to: string
  label?: string
  step: number
  dash?: boolean
  c?: Pen
}
interface Note {
  x: number
  y: number
  text: string[]
  step: number
  c?: Pen
}
export interface Board {
  w: number
  h: number
  steps: { title: string; note: string }[]
  nodes: Node[]
  arrows: Arrow[]
  notes?: Note[]
}

export const H = (n: Node) => n.h ?? 54

/** Point where the line from the centre of `n` toward (tx, ty) leaves its rectangle. */
export function edge(n: Node, tx: number, ty: number) {
  const cx = n.x + n.w / 2
  const cy = n.y + H(n) / 2
  const dx = tx - cx
  const dy = ty - cy
  const k = Math.min(dx === 0 ? Infinity : (n.w / 2 + 5) / Math.abs(dx), dy === 0 ? Infinity : (H(n) / 2 + 5) / Math.abs(dy))
  return { x: cx + dx * k, y: cy + dy * k }
}

export function Shape({ n }: { n: Node }) {
  const h = H(n)
  const col = PEN[n.c ?? 'k']
  const common = { fill: n.kind === 'zone' ? 'none' : '#fff', stroke: col, strokeWidth: 2 }
  if (n.kind === 'db')
    return (
      <path
        {...common}
        d={`M${n.x} ${n.y + 8} a${n.w / 2} 8 0 0 0 ${n.w} 0 a${n.w / 2} 8 0 0 0 ${-n.w} 0 v${h - 16} a${n.w / 2} 8 0 0 0 ${n.w} 0 v${-(h - 16)}`}
      />
    )
  if (n.kind === 'who') return <rect {...common} x={n.x} y={n.y} width={n.w} height={h} rx={h / 2} />
  if (n.kind === 'zone') return <rect {...common} x={n.x} y={n.y} width={n.w} height={h} rx={10} strokeDasharray="7 5" strokeWidth={2} />
  return (
    <>
      <rect {...common} x={n.x} y={n.y} width={n.w} height={h} rx={8} />
      {n.kind === 'log' &&
        [1, 2, 3, 4, 5].map((k) => (
          <line key={k} x1={n.x + (n.w * k) / 6} x2={n.x + (n.w * k) / 6} y1={n.y + h - 11} y2={n.y + h} stroke={col} strokeWidth={2} />
        ))}
    </>
  )
}

export function Whiteboard({ board }: { board: Board }) {
  const last = board.steps.length - 1
  const [step, setStep] = useState(0)
  const [big, setBig] = useState(false)
  // "The whole board" shows every part at full strength. In a step, the earlier parts are faint, so that the new part is clear.
  const [whole, setWhole] = useState(false)
  const go = (n: number) => {
    setWhole(false)
    setStep(Math.max(0, Math.min(last, n)))
  }

  useEffect(() => {
    if (!big) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setBig(false)
      if (e.key === 'ArrowRight') go(step + 1)
      if (e.key === 'ArrowLeft') go(step - 1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  })
  // On a narrow screen the drawing is wider than its frame. Bring the part drawn in this step into view.
  const frame = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = frame.current
    if (!el || el.scrollWidth <= el.clientWidth + 2) return
    const fresh = board.nodes.filter((n) => n.step === step)
    if (whole || fresh.length === 0) {
      el.scrollLeft = 0
      return
    }
    const svgW = el.scrollWidth - 24
    const mid = (Math.min(...fresh.map((n) => n.x)) + Math.max(...fresh.map((n) => n.x + n.w))) / 2
    el.scrollLeft = 12 + (mid / board.w) * svgW - el.clientWidth / 2
  }, [step, whole, big, board])
  const byId = Object.fromEntries(board.nodes.map((n) => [n.id, n]))
  const age = (s: number) => (whole ? '' : s === step ? 'wb-new' : 'wb-old')
  const ends = (a: Arrow) => {
    const f = byId[a.from]
    const t = byId[a.to]
    return [edge(f, t.x + t.w / 2, t.y + H(t) / 2), edge(t, f.x + f.w / 2, f.y + H(f) / 2)]
  }

  return (
    <div className={`wb ${big ? 'wb-full' : ''}`}>
      <div className="wb-ctl">
        <button className="act ghost" disabled={step === 0} onClick={() => go(step - 1)}>
          Back
        </button>
        <button className="act" disabled={step === last && !whole} onClick={() => go(whole ? 0 : step + 1)}>
          {whole ? 'Start again' : step === 0 ? 'Start drawing' : 'Next step'}
        </button>
        <span className="wb-count">{whole ? 'The whole board' : `Step ${step + 1} of ${board.steps.length}`}</span>
        {!whole && (
          <button
            className="link-btn"
            onClick={() => {
              setStep(last)
              setWhole(true)
            }}
          >
            Show the whole board
          </button>
        )}
        <button className="act ghost" onClick={() => setBig(!big)} aria-pressed={big}>
          {big ? 'Close (Esc)' : 'Expand'}
        </button>
      </div>
      <p className="wb-hint">{big ? 'Drag the drawing to move around it.' : 'The drawing is wider than this screen. Drag it sideways, or use Expand for a larger view.'}</p>
      <div className="wb-main">
        <div className="wb-frame">
          <Corners />
        <div className="wb-board" ref={frame} tabIndex={0} role="group" aria-label="Drawing. Scroll sideways if it is cut off." style={{ ['--wb-w' as string]: board.w }}>
          <svg viewBox={`0 0 ${board.w} ${board.h}`} role="img" aria-label={`Design drawing, step ${step + 1}: ${board.steps[step].title}`}>
            <defs>
              {(Object.keys(PEN) as Pen[]).map((p) => (
                <marker key={p} id={`wb-head-${p}`} viewBox="0 0 12 12" refX="10" refY="6" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
                  <path d="M2 2 L10 6 L2 10" fill="none" stroke={PEN[p]} strokeWidth="2" strokeLinecap="round" />
                </marker>
              ))}
            </defs>

            {board.nodes
              .filter((n) => n.step <= step)
              .map((n) => (
                <g key={n.id} data-n={n.id} className={`wb-shape ${n.kind === 'zone' ? 'wb-zone' : ''} ${age(n.step)}`} style={{ ['--pen' as string]: PEN[n.c ?? 'k'] }}>
                  <Shape n={n} />
                </g>
              ))}
            {board.arrows
              .filter((a) => a.step <= step)
              .map((a, i) => {
                const [p1, p2] = ends(a)
                return (
                  <path
                    key={i}
                    data-a={i}
                    className={`wb-arrow ${age(a.step)}`}
                    d={`M${p1.x} ${p1.y} L${p2.x} ${p2.y}`}
                    stroke={PEN[a.c ?? 'k']}
                    strokeDasharray={a.dash ? '7 6' : undefined}
                    markerEnd={`url(#wb-head-${a.c ?? 'k'})`}
                  />
                )
              })}

            {board.nodes
              .filter((n) => n.step <= step)
              .map((n) => {
                const zone = n.kind === 'zone'
                const cx = zone ? n.x + 12 : n.x + n.w / 2
                const cy = zone ? n.y + 20 : n.y + H(n) / 2 + (n.kind === 'db' ? 5 : 0)
                return (
                  <g key={n.id} data-n={n.id} className={`wb-text ${age(n.step)}`} fill={PEN[n.c ?? 'k']} textAnchor={zone ? 'start' : 'middle'}>
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
            {board.arrows.map((a, i) => {
              if (a.step > step || !a.label) return null
              const [p1, p2] = ends(a)
              return (
                <text key={i} data-a={i} x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6} textAnchor="middle" className={`wb-alabel ${age(a.step)}`} fill={PEN[a.c ?? 'k']}>
                  {a.label}
                </text>
              )
            })}
            {board.notes
              ?.filter((n) => n.step <= step)
              .map((n, i) => (
                <text key={i} x={n.x} y={n.y} className={`wb-note ${age(n.step)}`} fill={PEN[n.c ?? 'r']}>
                  {n.text.map((line, k) => (
                    <tspan key={k} x={n.x} dy={k === 0 ? 0 : 17}>
                      {line}
                    </tspan>
                  ))}
                </text>
              ))}
          </svg>
        </div>
        </div>
        <div className="wb-side">
          <ol className="wb-steps">
            {board.steps.map((s, i) => (
              <li key={i} className={!whole && i === step ? 'now' : i <= step ? 'seen' : ''}>
                <button onClick={() => go(i)} aria-current={!whole && i === step ? 'step' : undefined} title={s.title}>
                  <i>{i + 1}</i>
                  <span>{s.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="wb-say" role="status">
            {whole ? (
              <>
                <b>The whole design</b>
                <p>Every part, at full strength. Select a step number to see why that part is there.</p>
              </>
            ) : (
              <>
                <b>
                  {step + 1}. {board.steps[step].title}
                </b>
                <p>{board.steps[step].note}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- boards ---------------- */

const METHOD: Board = {
  w: 760,
  h: 424,
  steps: [
    { title: 'Start at the right side: the users', note: 'Write each user and the decision they make. Next to each one write how fresh the data must be and at what level of detail. Everything to the left exists only to supply this column.' },
    { title: 'Draw the tables they will read', note: 'Name the fact and dimension tables and the grain of each fact. If you cannot name the grain, the requirement is not complete. Go back to the user.' },
    { title: 'Now the left side: the sources', note: 'For each source write what it is, who owns it, how much data it has and how it changes. You do not control these systems, so find their limits early.' },
    { title: 'Put numbers on it', note: 'Rows each day times bytes for each row gives the daily volume. Find the peak rate, not the average, and the growth in a year. These numbers remove most options: at one gigabyte a day you do not need a cluster, and at fifty thousand events a second you cannot insert rows one by one.' },
    { title: 'Choose one ingestion method for each source', note: 'A database gets a query or CDC. A SaaS tool gets a connector. Files get a drop folder. The freshness from step 1 decides between batch and stream.' },
    { title: 'Land the data raw, and do not edit it', note: 'A raw copy lets you correct a transformation and build everything again without a new extract. Partition it by load date.' },
    { title: 'Transform in layers', note: 'Staging cleans one source table at a time. Models join them and apply the business rules. Each step is a small query that can be tested.' },
    { title: 'Last: how it runs, and how it fails', note: 'Add the orchestrator, the tests and the alerts. Then ask the failure questions for each arrow: what if it runs twice, runs late, or gets a bad file? A design is not finished before these have answers.' },
    { title: 'Say what you gave up, and what comes next', note: 'Each choice has a price: fresher data against cost, a managed service against control, strict tests against availability. Write the important ones down with the reason. Then name the signal that will make you change the design, such as a nightly run that no longer finishes before the morning.' },
  ],
  nodes: [
    { id: 'u1', x: 640, y: 40, w: 112, label: 'Analyst', sub: 'daily, by 08:00', kind: 'who', step: 0 },
    { id: 'u2', x: 640, y: 135, w: 112, label: 'Business tool', sub: 'hourly sync', kind: 'who', step: 0 },
    { id: 'u3', x: 640, y: 230, w: 112, label: 'ML model', sub: 'features, daily', kind: 'who', step: 0 },
    { id: 'marts', x: 520, y: 125, w: 92, h: 74, label: 'Marts', sub: 'facts + dims', c: 'p', step: 1 },
    { id: 's1', x: 10, y: 40, w: 118, label: 'App database', sub: 'changes all day', kind: 'db', step: 2 },
    { id: 's2', x: 10, y: 135, w: 118, label: 'SaaS tools', sub: 'API, rate limits', step: 2 },
    { id: 's3', x: 10, y: 230, w: 118, label: 'Files, events', sub: 'partner or app', step: 2 },
    { id: 'ing', x: 160, y: 125, w: 92, h: 74, label: 'Ingest', sub: 'per source', c: 'g', step: 4 },
    { id: 'raw', x: 282, y: 125, w: 88, h: 74, label: 'Raw', sub: 'as it arrived', kind: 'db', c: 'b', step: 5 },
    { id: 'tr', x: 400, y: 125, w: 92, h: 74, label: 'Transform', sub: 'SQL, in layers', c: 'g', step: 6 },
    { id: 'orch', x: 160, y: 318, w: 452, h: 50, label: 'Orchestrator: schedule, retry, test, alert', c: 'o', step: 7 },
  ],
  arrows: [
    { from: 'marts', to: 'u1', step: 1 },
    { from: 'marts', to: 'u2', step: 1 },
    { from: 'marts', to: 'u3', step: 1 },
    { from: 's1', to: 'ing', step: 4 },
    { from: 's2', to: 'ing', step: 4 },
    { from: 's3', to: 'ing', step: 4 },
    { from: 'ing', to: 'raw', step: 5 },
    { from: 'raw', to: 'tr', step: 6 },
    { from: 'tr', to: 'marts', step: 6 },
    { from: 'orch', to: 'ing', step: 7, dash: true, c: 'o' },
    { from: 'orch', to: 'tr', step: 7, dash: true, c: 'o' },
  ],
  notes: [
    { x: 150, y: 44, text: ['rows / day × bytes = volume', 'peak events / second?', 'growth in a year?'], step: 3, c: 'b' },
    { x: 10, y: 372, text: ['fresher ↔ cheaper', 'managed ↔ control', 'next version when…?'], step: 8, c: 'p' },
    { x: 500, y: 24, text: ['what decision? how fresh? what grain?'], step: 0 },
    { x: 10, y: 312, text: ['who owns it? how big?', 'how does it change?'], step: 2 },
    { x: 274, y: 226, text: ['never edited'], step: 5, c: 'b' },
    { x: 626, y: 330, text: ['runs twice?', 'runs late?', 'bad file?'], step: 7 },
  ],
}

const FLIGHT: Board = {
  w: 760,
  h: 470,
  steps: [
    { title: 'Four users with four different clocks', note: 'Revenue management changes prices from how full each flight is, and needs that each hour. Finance needs revenue once a day and it must agree with the payment provider. Customer service needs the full history of one booking. Marketing needs to know which searches become bookings.' },
    { title: 'The gold tables', note: 'fact_booking has one row for each booking, updated as it moves from created to paid, ticketed, flown or cancelled. fact_flight_leg has one row for each flight and day, with seats sold and capacity. Fares and routes are Type 2 dimensions, because prices change and old bookings must keep the old fare.' },
    { title: 'The sources', note: 'The booking service is a busy OLTP database. A booking row is updated many times and cancelled bookings may be deleted. Payments come from an external provider. The flight schedule comes from the operations system as a file. Searches are events from the website and app.' },
    { title: 'Change data capture for bookings', note: 'A query each hour does not see a booking that was created and cancelled inside that hour, and it loads a database that sells tickets. Debezium reads the transaction log and writes each change to Kafka. Search events and payment webhooks go to Kafka also. Files and the nightly payment report use a simple batch loader.' },
    { title: 'Bronze: keep every change', note: 'All of it lands in append-only Iceberg tables in object storage. Bronze has one row for each change to a booking, not one row for each booking. This history is what makes it possible to answer “what did this booking look like on Tuesday?”' },
    { title: 'Silver, then gold', note: 'A Spark job each 15 minutes merges the changes into the current state of each booking and removes duplicates. dbt then builds the gold facts and dimensions. Personal data such as passport numbers is masked in silver, and gold does not contain it.' },
    { title: 'A contract with the booking team', note: 'The booking team can rename a column on any day, and the change arrives in Kafka at once. A schema registry accepts only changes that old readers can still read, and CI in the booking service checks each change against it. A change that would break the pipeline fails in their build, not in your night run.' },
    { title: 'Orchestration and the checks that matter', note: 'Airflow schedules the batch steps and backfills. Two tests can stop the pipeline: seats sold must not be more than capacity, and tickets paid must equal payments settled for the day. A freshness alert protects the hourly promise to revenue management.' },
    { title: 'Late changes, and how to repair history', note: 'A schedule change or a refund can arrive days after the booking. A nightly job builds the last three days of silver again, so late changes find their place. When the logic of a model changes, Airflow runs a backfill from bronze for the dates concerned. This is possible only because bronze keeps every change.' },
    { title: 'What this design must not do', note: 'The question “is seat 14C free now?” stays in the booking service. The analytics platform is minutes late by design, and a platform that is minutes late must not sell seats. To draw this line is part of the design.' },
  ],
  nodes: [
    { id: 'rm', x: 628, y: 30, w: 126, label: 'Revenue mgmt', sub: 'load factor, hourly', kind: 'who', step: 0 },
    { id: 'fin', x: 628, y: 115, w: 126, label: 'Finance', sub: 'daily, reconciled', kind: 'who', step: 0 },
    { id: 'cs', x: 628, y: 200, w: 126, label: 'Customer service', sub: 'booking history', kind: 'who', step: 0 },
    { id: 'mkt', x: 628, y: 285, w: 126, label: 'Marketing', sub: 'search to booking', kind: 'who', step: 0 },
    { id: 'gold', x: 512, y: 140, w: 92, h: 92, label: 'Gold', sub: 'facts + dims', c: 'p', step: 1 },
    { id: 'book', x: 8, y: 30, w: 122, label: 'Booking service', sub: 'Postgres, OLTP', kind: 'db', step: 2 },
    { id: 'pay', x: 8, y: 220, w: 122, label: 'Payments', sub: 'webhooks + report', step: 2 },
    { id: 'srch', x: 8, y: 125, w: 122, label: 'Search events', sub: 'web and app', step: 2 },
    { id: 'sched', x: 8, y: 315, w: 122, label: 'Flight schedule', sub: 'file, each 15 min', step: 2 },
    { id: 'cdc', x: 156, y: 30, w: 100, label: 'Debezium', sub: 'reads the log', c: 'g', step: 3 },
    { id: 'kafka', x: 156, y: 150, w: 100, h: 62, label: 'Kafka', sub: 'topics', kind: 'log', c: 'g', step: 3 },
    { id: 'load', x: 156, y: 315, w: 100, label: 'Batch loader', sub: 'files, reports', c: 'g', step: 3 },
    { id: 'bronze', x: 282, y: 140, w: 92, h: 92, label: 'Bronze', sub: 'every change', kind: 'db', c: 'b', step: 4 },
    { id: 'silver', x: 398, y: 140, w: 92, h: 92, label: 'Silver', sub: 'current state', kind: 'db', c: 'b', step: 5 },
    { id: 'reg', x: 276, y: 30, w: 118, label: 'Schema registry', sub: 'the contract', c: 'r', step: 6 },
    { id: 'air', x: 156, y: 400, w: 448, h: 48, label: 'Airflow: schedule, backfill, tests, alerts', c: 'o', step: 7 },
  ],
  arrows: [
    { from: 'gold', to: 'rm', step: 1 },
    { from: 'gold', to: 'fin', step: 1 },
    { from: 'gold', to: 'cs', step: 1 },
    { from: 'gold', to: 'mkt', step: 1 },
    { from: 'book', to: 'cdc', step: 3, c: 'g' },
    { from: 'cdc', to: 'kafka', step: 3, c: 'g' },
    { from: 'pay', to: 'kafka', step: 3, c: 'g' },
    { from: 'srch', to: 'kafka', step: 3, c: 'g' },
    { from: 'pay', to: 'load', step: 3, dash: true, c: 'g' },
    { from: 'sched', to: 'load', step: 3, c: 'g' },
    { from: 'kafka', to: 'bronze', step: 4 },
    { from: 'load', to: 'bronze', step: 4 },
    { from: 'bronze', to: 'silver', step: 5 },
    { from: 'silver', to: 'gold', step: 5 },
    { from: 'reg', to: 'kafka', step: 6, dash: true, c: 'r' },
    { from: 'air', to: 'silver', step: 7, dash: true, c: 'o' },
  ],
  notes: [
    { x: 282, y: 262, text: ['Iceberg tables', 'in object storage'], step: 4, c: 'b' },
    { x: 454, y: 262, text: ['PII masked here'], step: 5 },
    { x: 362, y: 128, text: ['Spark'], step: 5, c: 'k' },
    { x: 486, y: 128, text: ['dbt'], step: 5, c: 'k' },
    { x: 470, y: 300, text: ['seats sold <= capacity', 'paid = settled'], step: 7 },
    { x: 404, y: 40, text: ['“is seat 14C free?” stays', 'in the booking service'], step: 9 },
    { x: 8, y: 404, text: ['late changes:', 'reprocess 3 days'], step: 8, c: 'o' },
  ],
}

const FRAUD: Board = {
  w: 760,
  h: 500,
  steps: [
    { title: 'The requirement is a time limit', note: 'The checkout waits for the answer. The payment API has about 300 milliseconds in total, and the fraud check can use 100 of them. A batch job cannot be part of this path, so the design starts from the limit.' },
    { title: 'Put numbers on it', note: 'About 2 million payments a day is 23 a second on average. The peak is 150 a second. Design for the peak. A query that counts the last ten minutes of a card, run for each payment, cannot answer inside 100 milliseconds at that rate. So the features must be ready before the payment arrives.' },
    { title: 'Publish each payment as an event', note: 'The payment API writes each attempt to a Kafka topic, with the card as the key. All events for one card are then in one partition and in order.' },
    { title: 'A stream job keeps features for each card', note: 'A Flink job keeps state for each card: the number of payments and the amount in the last 10 minutes, and the number of different countries in the last hour. These are window aggregations on event time.' },
    { title: 'Serve the features from a fast store', note: 'Flink writes the current features to a key-value store. The scoring service reads them by card in about a millisecond. It does not query Kafka or Flink in the request path.' },
    { title: 'The batch path trains the model', note: 'The same topic is written to the lake. A daily job builds the training set and trains a new model, which the scoring service loads. The stream path uses the model. The batch path makes it.' },
    { title: 'The labels arrive weeks later', note: 'You learn that a payment was fraud when the cardholder disputes it, days or weeks later. The training job must join each chargeback to the features as they were at the time of the payment, not as they are today.' },
    { title: 'A new model runs in shadow mode first', note: 'A new model scores real payments for some days, and its answers are recorded and not used. You compare them with the model in service: how many more payments would it decline, and were those fraud? Only then does it decide. A model that declines good customers costs money from the first minute.' },
    { title: 'Decide what happens when a part fails', note: 'If the feature store does not answer in time, the service uses a simple rule: approve small payments and decline large ones. Exactly-once is not needed for the features, because a count that is wrong by one does not change the decision. It is needed for the money, and the money is not in this pipeline.' },
    { title: 'Watch four numbers', note: 'Consumer lag of the Flink job: are the features current? The slowest one percent of scoring times: is the limit kept? The approval rate: a sudden fall means a defect, not more fraud. And the share of payments that used the simple rule: it shows how often the fast store did not answer.' },
  ],
  nodes: [
    { id: 'api', x: 10, y: 60, w: 130, h: 62, label: 'Payment API', sub: 'checkout waits', step: 0 },
    { id: 'score', x: 320, y: 60, w: 140, h: 62, label: 'Scoring service', sub: 'model + rules', c: 'p', step: 0 },
    { id: 'kafka', x: 10, y: 210, w: 130, h: 62, label: 'Kafka: payments', sub: 'key = card', kind: 'log', c: 'g', step: 2 },
    { id: 'flink', x: 180, y: 210, w: 120, h: 62, label: 'Flink job', sub: 'state per card', c: 'g', step: 3 },
    { id: 'feat', x: 340, y: 210, w: 110, h: 62, label: 'Feature store', sub: 'key-value', kind: 'db', c: 'b', step: 4 },
    { id: 'lake', x: 10, y: 350, w: 130, h: 62, label: 'Lake', sub: 'all payments', kind: 'db', c: 'b', step: 5 },
    { id: 'train', x: 320, y: 350, w: 140, h: 62, label: 'Training job', sub: 'daily, batch', c: 'o', step: 5 },
    { id: 'reg', x: 520, y: 210, w: 120, h: 62, label: 'Model registry', sub: 'versions', c: 'o', step: 5 },
    { id: 'cb', x: 520, y: 350, w: 120, h: 62, label: 'Chargebacks', sub: 'weeks later', kind: 'who', c: 'r', step: 6 },
    { id: 'mon', x: 180, y: 440, w: 300, h: 46, label: 'Monitor: lag, latency, approval rate', c: 'o', step: 9 },
  ],
  arrows: [
    { from: 'api', to: 'score', step: 0, label: 'score this payment' },
    { from: 'api', to: 'kafka', step: 2, c: 'g' },
    { from: 'kafka', to: 'flink', step: 3, c: 'g' },
    { from: 'flink', to: 'feat', step: 4, c: 'g' },
    { from: 'feat', to: 'score', step: 4, c: 'b', label: '1 ms read' },
    { from: 'kafka', to: 'lake', step: 5 },
    { from: 'train', to: 'reg', step: 5, c: 'o' },
    { from: 'reg', to: 'score', step: 5, c: 'o', label: 'new model' },
    { from: 'lake', to: 'train', step: 5, label: 'payments + features' },
    { from: 'cb', to: 'train', step: 6, c: 'r', label: 'labels' },
  ],
  notes: [
    { x: 150, y: 44, text: ['answer in 100 ms'], step: 0 },
    { x: 150, y: 150, text: ['peak: 150 / second'], step: 1, c: 'b' },
    { x: 590, y: 190, text: ['shadow mode first'], step: 7, c: 'o' },
    { x: 180, y: 300, text: ['count, sum: last 10 min'], step: 3, c: 'g' },
    { x: 490, y: 76, text: ['store too slow?', 'small: approve', 'large: decline'], step: 8 },
  ],
}

export const WbMethod = () => <Whiteboard board={METHOD} />
export const WbFlight = () => <Whiteboard board={FLIGHT} />
export const WbFraud = () => <Whiteboard board={FRAUD} />
