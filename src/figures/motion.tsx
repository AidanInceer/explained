import { useEffect, useRef, useState } from 'react'

const GAP = 0.75 // seconds between events
const SRC = 102
const STAGE = 300
const DST = 566
const lerp = (a: number, b: number, p: number) => a + (b - a) * Math.min(1, Math.max(0, p))

/** Clock that advances while `on` is true. */
function useClock(on: boolean) {
  const [t, setT] = useState(0)
  const last = useRef<number | null>(null)
  useEffect(() => {
    if (!on) {
      last.current = null
      return
    }
    let id = 0
    const tick = (now: number) => {
      if (last.current !== null) {
        const dt = Math.min(0.1, (now - last.current) / 1000)
        setT((v) => v + dt)
      }
      last.current = now
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [on])
  return [t, setT] as const
}

export function BatchStream() {
  const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  const [on, setOn] = useState(!reduce)
  const [every, setEvery] = useState(6)
  const [t, setT] = useClock(on)

  const n = Math.floor(t / GAP) + 1
  const first = Math.max(0, n - 60)
  const batchDots: { x: number; y: number }[] = []
  const streamDots: { x: number }[] = []
  let batchDone = 0
  let batchNewest = -1
  let streamDone = 0
  let streamNewest = -1
  let staged = 0

  for (let i = 0; i < n; i++) {
    const c = i * GAP
    // streaming lane: 1.5 s from source to target
    const sp = (t - c) / 1.5
    if (sp >= 1) {
      streamDone++
      streamNewest = c
    } else if (i >= first) streamDots.push({ x: lerp(SRC, DST, sp) })

    // batch lane: 1 s to the landing area, wait for the run, 0.7 s to the target
    const landed = c + 1
    const run = Math.ceil(landed / every) * every
    if (t >= run + 0.7) {
      batchDone++
      batchNewest = c
    } else if (i >= first) {
      if (t < landed) batchDots.push({ x: lerp(SRC, STAGE - 40, t - c), y: 70 })
      else {
        // slot in the landing area: order of arrival inside this batch
        const firstInBatch = Math.max(0, Math.floor((run - every - 1) / GAP + 1e-9) + 1)
        const slot = i - firstInBatch
        const sx = STAGE - 40 + (slot % 6) * 16
        const sy = 54 + Math.floor(slot / 6) * 16
        if (t < run) {
          staged++
          batchDots.push({ x: sx, y: sy })
        } else {
          const p = (t - run) / 0.7
          batchDots.push({ x: lerp(sx, DST, p), y: lerp(sy, 70, p) })
        }
      }
    }
  }
  const nextRun = Math.ceil((t + 1e-6) / every) * every - t
  const age = (c: number) => (c < 0 ? 'no rows yet' : `newest row is ${(t - c).toFixed(1)} s old`)

  return (
    <div className="bs">
      <div className="bs-ctl">
        <div>
          <span className="ctl-label">The batch job runs every</span>
          <div className="seg">
            {[3, 6, 12].map((k) => (
              <button key={k} aria-pressed={every === k} onClick={() => setEvery(k)}>
                {k} seconds
              </button>
            ))}
          </div>
        </div>
        <div className="bs-btns">
          <button className="act ghost" onClick={() => setOn(!on)}>
            {on ? 'Pause' : 'Play'}
          </button>
          <button className="act ghost" onClick={() => setT(0)}>
            Start again
          </button>
        </div>
      </div>
      <svg viewBox="0 0 640 250" role="img" aria-label="Animation. The same events go through a batch pipeline, where they wait for a scheduled run, and a streaming pipeline, where each one is processed at once.">
        {/* batch lane */}
        <text x="14" y="22" className="bs-h">
          Batch
        </text>
        <line x1={SRC} x2={DST} y1="70" y2="70" className="bs-track" />
        <rect x="16" y="46" width="78" height="48" rx="4" className="bs-box" />
        <text x="55" y="75" textAnchor="middle">
          Source
        </text>
        <rect x={STAGE - 54} y="38" width="124" height="64" rx="4" className="bs-box dash" />
        <text x={STAGE + 8} y="30" textAnchor="middle" className="bs-s">
          Landing area: {staged} waiting, next run in {nextRun.toFixed(1)} s
        </text>
        <rect x={DST - 34} y="46" width="96" height="48" rx="4" className="bs-box solid k" />
        <text x={DST + 14} y="67" textAnchor="middle" className="bs-w">
          Target
        </text>
        <text x={DST + 14} y="84" textAnchor="middle" className="bs-w bs-n">
          {batchDone} rows
        </text>
        {batchDots.map((d, i) => (
          <rect key={i} x={d.x - 5} y={d.y - 5} width="10" height="10" rx="2" className="bs-dot k" />
        ))}
        <text x={DST + 62} y="116" textAnchor="end" className="bs-s">
          {age(batchNewest)}
        </text>

        {/* streaming lane */}
        <text x="14" y="152" className="bs-h">
          Streaming
        </text>
        <line x1={SRC} x2={DST} y1="196" y2="196" className="bs-track" />
        <rect x="16" y="172" width="78" height="48" rx="4" className="bs-box" />
        <text x="55" y="201" textAnchor="middle">
          Source
        </text>
        <rect x={STAGE - 54} y="172" width="124" height="48" rx="4" className="bs-box tint" />
        <text x={STAGE + 8} y="201" textAnchor="middle">
          Processor
        </text>
        <rect x={DST - 34} y="172" width="96" height="48" rx="4" className="bs-box solid" />
        <text x={DST + 14} y="193" textAnchor="middle" className="bs-w">
          Target
        </text>
        <text x={DST + 14} y="210" textAnchor="middle" className="bs-w bs-n">
          {streamDone} rows
        </text>
        {streamDots.map((d, i) => (
          <rect key={i} x={d.x - 5} y="191" width="10" height="10" rx="2" className="bs-dot" />
        ))}
        <text x={DST + 62} y="242" textAnchor="end" className="bs-s">
          {age(streamNewest)}
        </text>
      </svg>
      <p className="stat">
        The two targets get the same rows. The difference is the age of the data when you read it: between 1 and{' '}
        {every + 1} seconds in the batch lane, and 1.5 seconds at all times in the streaming lane. The batch job starts{' '}
        {Math.round(60 / every)} times a minute. The stream processor never stops.
      </p>
    </div>
  )
}

type Cell = 'wait' | 'out' | 'gone'
interface Snap {
  cells: Cell[]
  /** consumers: name, what it has processed, and for a log its offset */
  who: { name: string; got: string; off?: number; flag?: string }[]
  say: string
}

const QUEUE: Snap[] = [
  { cells: ['wait', 'wait', 'wait', 'wait'], who: [{ name: 'Worker A', got: '' }, { name: 'Worker B', got: '' }], say: 'Four messages wait in the queue. Two workers are connected to it.' },
  { cells: ['out', 'wait', 'wait', 'wait'], who: [{ name: 'Worker A', got: '', flag: 'has message 1' }, { name: 'Worker B', got: '' }], say: 'The broker gives message 1 to Worker A. The message is hidden from Worker B, but it is not deleted yet.' },
  { cells: ['gone', 'wait', 'wait', 'wait'], who: [{ name: 'Worker A', got: '1' }, { name: 'Worker B', got: '' }], say: 'Worker A confirms that the work is done. The broker deletes message 1. Nobody can read it again.' },
  { cells: ['gone', 'out', 'out', 'wait'], who: [{ name: 'Worker A', got: '1', flag: 'has message 3' }, { name: 'Worker B', got: '', flag: 'has message 2' }], say: 'The workers share the load. B gets message 2 and A gets message 3, at the same time. This is why you add workers to a queue.' },
  { cells: ['gone', 'gone', 'gone', 'wait'], who: [{ name: 'Worker A', got: '1, 3' }, { name: 'Worker B', got: '2' }], say: 'The two workers confirm. Three of the four messages are now deleted.' },
  { cells: ['gone', 'gone', 'gone', 'out'], who: [{ name: 'Worker A', got: '1, 3' }, { name: 'Worker B', got: '2' }, { name: 'Analytics (new)', got: '', flag: 'has message 4' }], say: 'A new consumer, Analytics, connects. To the queue it is one more worker. It gets message 4 only. Messages 1 to 3 no longer exist, and A and B will never see message 4.' },
]

const LOG: Snap[] = [
  { cells: ['wait', 'wait', 'wait', 'wait'], who: [{ name: 'Billing', got: '', off: 0 }, { name: 'Analytics', got: '', off: 0 }], say: 'Four messages are in the log, at offsets 0 to 3. Each consumer has its own position, shown by its marker.' },
  { cells: ['wait', 'wait', 'wait', 'wait'], who: [{ name: 'Billing', got: '0, 1', off: 2 }, { name: 'Analytics', got: '', off: 0 }], say: 'Billing reads messages 0 and 1 and saves its position: 2. The messages stay in the log.' },
  { cells: ['wait', 'wait', 'wait', 'wait'], who: [{ name: 'Billing', got: '0, 1', off: 2 }, { name: 'Analytics', got: '0', off: 1 }], say: 'Analytics reads message 0, the same message that Billing read. The two consumers do not affect each other.' },
  { cells: ['wait', 'wait', 'wait', 'wait', 'wait'], who: [{ name: 'Billing', got: '0, 1', off: 2 }, { name: 'Analytics', got: '0', off: 1 }], say: 'The producer appends message 4 at the end. Messages that exist are never changed.' },
  { cells: ['wait', 'wait', 'wait', 'wait', 'wait'], who: [{ name: 'Billing', got: '0, 1', off: 2 }, { name: 'Analytics', got: '0', off: 1 }, { name: 'Search (new)', got: '0, 1, 2, 3, 4', off: 5 }], say: 'A new consumer, Search, connects a week later. It starts at offset 0 and reads the whole history. With a queue this is not possible.' },
  { cells: ['wait', 'wait', 'wait', 'wait', 'wait'], who: [{ name: 'Billing', got: '0, 1', off: 2, flag: 'restarted' }, { name: 'Analytics', got: '0', off: 1 }, { name: 'Search (new)', got: '0, 1, 2, 3, 4', off: 5 }], say: 'Billing stops and starts again. It continues from its saved position, 2. Nothing is lost and nothing is skipped.' },
  { cells: ['gone', 'gone', 'wait', 'wait', 'wait'], who: [{ name: 'Billing', got: '0, 1', off: 2 }, { name: 'Analytics', got: '0', off: 2, flag: 'missed message 1' }, { name: 'Search (new)', got: '0, 1, 2, 3, 4', off: 5 }], say: 'After the retention period the oldest messages are removed, read or not. Analytics was too slow: it never read message 1. This is why you monitor consumer lag.' },
]

const WHO_COLORS = ['#b97700', '#2456d6', '#0b8a78']

export function QueueLog() {
  const [kind, setKind] = useState<'queue' | 'log'>('queue')
  const [i, setI] = useState(0)
  const steps = kind === 'queue' ? QUEUE : LOG
  const s = steps[i]
  const isLog = kind === 'log'
  const pick = (k: 'queue' | 'log') => {
    setKind(k)
    setI(0)
  }
  return (
    <div className="ql">
      <div className="ql-top">
        <div className="seg">
          <button aria-pressed={!isLog} onClick={() => pick('queue')}>
            Queue
          </button>
          <button aria-pressed={isLog} onClick={() => pick('log')}>
            Log
          </button>
        </div>
        <div className="ql-nav">
          <button className="act ghost" disabled={i === 0} onClick={() => setI(i - 1)}>
            Back
          </button>
          <button className="act" disabled={i === steps.length - 1} onClick={() => setI(i + 1)}>
            Next step
          </button>
          <span>
            {i + 1} of {steps.length}
          </span>
        </div>
      </div>

      <div className="ql-stage">
        <div className="ql-end">
          <b>Producer</b>
          <small>sends messages</small>
        </div>
        <span className="ql-arrow" aria-hidden="true">
          →
        </span>
        <div className="ql-mid">
          <b>{isLog ? 'Log: every message is kept, in order' : 'Queue: a message leaves when the work is done'}</b>
          <div className="ql-cells">
            {s.cells.map((c, n) => (
              <span key={n} className={`ql-cell ${c} ${isLog ? 'log' : ''}`}>
                {isLog ? n : n + 1}
                {c === 'gone' && <i>{isLog ? 'expired' : 'deleted'}</i>}
                {c === 'out' && <i>in work</i>}
              </span>
            ))}
          </div>
          {isLog && (
            <div className="ql-marks">
              {s.who.map((w, k) => (
                <span key={w.name} className="ql-mark" style={{ transform: `translateX(${(w.off ?? 0) * 48}px)`, color: WHO_COLORS[k] }}>
                  ▲ {w.name.replace(' (new)', '')}
                </span>
              ))}
            </div>
          )}
        </div>
        <span className="ql-arrow" aria-hidden="true">
          →
        </span>
        <div className="ql-who">
          {s.who.map((w, k) => (
            <div key={w.name} className="ql-con" style={{ borderColor: isLog ? WHO_COLORS[k] : undefined }}>
              <b>{w.name}</b>
              <small>
                {w.got ? `processed: ${w.got}` : 'processed: nothing yet'}
                {isLog && `. Next offset: ${w.off}`}
              </small>
              {w.flag && <em>{w.flag}</em>}
            </div>
          ))}
        </div>
      </div>

      <p className="stat" role="status">
        <b>Step {i + 1}.</b> {s.say}
      </p>
    </div>
  )
}
