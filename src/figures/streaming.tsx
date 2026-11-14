import { useState } from 'react'

const C_COLORS = ['#2456d6', '#b97700', '#0b8a78', '#7a3fd1', '#74828a']

export function Consumers() {
  const [n, setN] = useState(2)
  const parts = [0, 1, 2, 3]
  const owner = (p: number) => p % Math.min(n, 4)
  return (
    <div>
      <span className="ctl-label">
        Topic <code>orders</code> has 4 partitions. Consumers in the group
      </span>
      <div className="seg">
        {[1, 2, 3, 4, 5].map((k) => (
          <button key={k} aria-pressed={n === k} onClick={() => setN(k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="cg">
        {parts.map((p) => (
          <div className="cg-row" key={p}>
            <b style={{ fontSize: 14 }}>Partition {p}</b>
            <div className="cg-log">
              {[0, 1, 2, 3, 4, 5, 6].map((o) => (
                <span key={o} style={{ background: C_COLORS[owner(p)], opacity: 0.6 + o * 0.066 }}>
                  {o}
                </span>
              ))}
            </div>
            <span className="cg-who" style={{ color: C_COLORS[owner(p)] }}>
              → Consumer {owner(p) + 1}
            </span>
          </div>
        ))}
      </div>
      {n > 4 && <p className="cg-idle">Consumer 5 has no partition. It waits in case another consumer stops.</p>}
      <p className="stat">
        {n === 1 && 'One consumer reads all four partitions. Order is kept inside each partition, not across them.'}
        {n > 1 && n < 4 && `The group shares the partitions. Each partition has one reader, so its order is kept. More consumers means more throughput.`}
        {n === 4 && 'One consumer for each partition. This is the most parallel work this topic allows.'}
        {n > 4 && 'The partition count is the limit on parallel readers. To go faster you need more partitions, not more consumers.'}
      </p>
    </div>
  )
}

const EVENTS = [3, 7, 12, 18, 24, 26, 41, 44, 45, 58]
type WinKind = 'tumbling' | 'sliding' | 'session'

function windowsFor(kind: WinKind): { from: number; to: number; count: number }[] {
  const count = (a: number, b: number) => EVENTS.filter((e) => e >= a && e < b).length
  if (kind === 'tumbling') return [0, 20, 40].map((a) => ({ from: a, to: a + 20, count: count(a, a + 20) }))
  if (kind === 'sliding') return [0, 10, 20, 30, 40].map((a) => ({ from: a, to: a + 20, count: count(a, a + 20) }))
  const out: { from: number; to: number; count: number }[] = []
  let start = EVENTS[0]
  let last = EVENTS[0]
  let c = 1
  for (const e of EVENTS.slice(1)) {
    if (e - last > 10) {
      out.push({ from: start, to: last + 1, count: c })
      start = e
      c = 0
    }
    last = e
    c++
  }
  out.push({ from: start, to: last + 1, count: c })
  return out
}

const NOTES: Record<WinKind, string> = {
  tumbling: 'Fixed size, no overlap. Each event is in exactly one window. Use for “orders per 20 seconds”, or per hour or day.',
  sliding: 'Fixed size, starts every 10 seconds, so windows overlap and one event is counted in two of them. Use for moving averages.',
  session: 'No fixed size. A window closes after 10 seconds with no events. Use for user activity, where the data decides the boundaries.',
}

export function Windows() {
  const [kind, setKind] = useState<WinKind>('tumbling')
  const wins = windowsFor(kind)
  const X = (t: number) => 30 + t * 9.4
  return (
    <div className="win">
      <div className="seg">
        <button aria-pressed={kind === 'tumbling'} onClick={() => setKind('tumbling')}>
          Tumbling, 20 s
        </button>
        <button aria-pressed={kind === 'sliding'} onClick={() => setKind('sliding')}>
          Sliding, 20 s every 10 s
        </button>
        <button aria-pressed={kind === 'session'} onClick={() => setKind('session')}>
          Session, 10 s gap
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox="0 0 624 150" role="img" aria-label={`Ten events on a 60 second timeline grouped into ${wins.length} ${kind} windows with counts ${wins.map((w) => w.count).join(', ')}`}>
          <line x1={X(0)} x2={X(60)} y1="40" y2="40" stroke="var(--ink-3)" strokeWidth="1.5" />
          {[0, 10, 20, 30, 40, 50, 60].map((t) => (
            <g key={t}>
              <line x1={X(t)} x2={X(t)} y1="36" y2="44" stroke="var(--ink-3)" strokeWidth="1.5" />
              <text x={X(t)} y="58" textAnchor="middle">
                0:{String(t).padStart(2, '0')}
              </text>
            </g>
          ))}
          {EVENTS.map((e) => (
            <circle key={e} cx={X(e)} cy="22" r="6" fill="var(--ink)" />
          ))}
          {wins.map((w, i) => {
            const y = 72 + (kind === 'sliding' ? (i % 2) * 34 : 0)
            const x = X(w.from) + 1.5
            const width = Math.max(X(w.to) - X(w.from) - 3, 24)
            return (
              <g key={i}>
                <rect x={x} y={y} width={width} height="28" rx="6" fill="var(--line)" />
                <text x={x + width / 2} y={y + 19} textAnchor="middle" className="cnt">
                  {w.count}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <p className="stat">{NOTES[kind]}</p>
    </div>
  )
}

type Mode = 'most' | 'least' | 'exactly'
const DELIVERY: Record<Mode, { steps: [string, boolean?][]; sink: [string, string?][]; note: string }> = {
  most: {
    steps: [
      ['Read message 3'],
      ['Save progress: “done up to 3”'],
      ['Crash, before the write to the target', true],
      ['Restart. Progress says 3 is done. Read message 4'],
    ],
    sink: [['1'], ['2'], ['3', 'lost'], ['4'], ['5']],
    note: 'Progress was saved before the work. Message 3 is lost and nothing will send it again. Acceptable for metrics where a gap does no harm.',
  },
  least: {
    steps: [
      ['Read message 3'],
      ['Write message 3 to the target'],
      ['Crash, before progress is saved', true],
      ['Restart. Progress says 2 is done. Read message 3 again and write it again'],
    ],
    sink: [['1'], ['2'], ['3'], ['3', 'dup'], ['4'], ['5']],
    note: 'Progress is saved after the work. Nothing is lost, but message 3 is written twice. This is the default for most systems.',
  },
  exactly: {
    steps: [
      ['Read message 3'],
      ['Upsert message 3 into the target, with the message id as the key'],
      ['Crash, before progress is saved', true],
      ['Restart. Read message 3 again. The upsert finds id 3 and replaces it'],
    ],
    sink: [['1'], ['2'], ['3'], ['4'], ['5']],
    note: 'Delivery is still at-least-once. The write is idempotent, so the second copy has no effect. The alternative is to commit the write and the progress in one transaction.',
  },
}

export function Delivery() {
  const [m, setM] = useState<Mode>('least')
  const d = DELIVERY[m]
  return (
    <div>
      <div className="seg">
        <button aria-pressed={m === 'most'} onClick={() => setM('most')}>
          At-most-once
        </button>
        <button aria-pressed={m === 'least'} onClick={() => setM('least')}>
          At-least-once
        </button>
        <button aria-pressed={m === 'exactly'} onClick={() => setM('exactly')}>
          Exactly-once
        </button>
      </div>
      <div className="fx">
        <div className="grow" style={{ flex: '1.6 1 0' }}>
          <b style={{ fontSize: 14 }}>What the consumer does around message 3</b>
          <ol className="steps" style={{ marginTop: 6 }}>
            {d.steps.map(([s, crash], i) => (
              <li key={i} className={crash ? 'crash' : ''}>
                {s}
              </li>
            ))}
          </ol>
        </div>
        <div className="grow">
          <b style={{ fontSize: 14 }}>Rows in the target at the end</b>
          <div className="chips">
            {d.sink.map(([v, cls], i) => (
              <span key={i} className={`chip ${cls ?? ''}`}>
                {v}
                {cls === 'lost' ? ' missing' : cls === 'dup' ? ' again' : ''}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className={`stat ${m === 'exactly' ? 'good' : 'bad'}`}>{d.note}</p>
    </div>
  )
}
