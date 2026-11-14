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
        <rect x="16" y="46" width="78" height="48" rx="8" className="bs-box" />
        <text x="55" y="75" textAnchor="middle">
          Source
        </text>
        <rect x={STAGE - 54} y="38" width="124" height="64" rx="8" className="bs-box dash" />
        <text x={STAGE + 8} y="30" textAnchor="middle" className="bs-s">
          Landing area: {staged} waiting, next run in {nextRun.toFixed(1)} s
        </text>
        <rect x={DST - 34} y="46" width="96" height="48" rx="8" className="bs-box solid k" />
        <text x={DST + 14} y="67" textAnchor="middle" className="bs-w">
          Target
        </text>
        <text x={DST + 14} y="84" textAnchor="middle" className="bs-w bs-n">
          {batchDone} rows
        </text>
        {batchDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="5.5" className="bs-dot k" />
        ))}
        <text x={DST + 62} y="116" textAnchor="end" className="bs-s">
          {age(batchNewest)}
        </text>

        {/* streaming lane */}
        <text x="14" y="152" className="bs-h">
          Streaming
        </text>
        <line x1={SRC} x2={DST} y1="196" y2="196" className="bs-track" />
        <rect x="16" y="172" width="78" height="48" rx="8" className="bs-box" />
        <text x="55" y="201" textAnchor="middle">
          Source
        </text>
        <rect x={STAGE - 54} y="172" width="124" height="48" rx="8" className="bs-box tint" />
        <text x={STAGE + 8} y="201" textAnchor="middle">
          Processor
        </text>
        <rect x={DST - 34} y="172" width="96" height="48" rx="8" className="bs-box solid" />
        <text x={DST + 14} y="193" textAnchor="middle" className="bs-w">
          Target
        </text>
        <text x={DST + 14} y="210" textAnchor="middle" className="bs-w bs-n">
          {streamDone} rows
        </text>
        {streamDots.map((d, i) => (
          <circle key={i} cx={d.x} cy="196" r="5.5" className="bs-dot" />
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

const MSGS = [1, 2, 3, 4, 5, 6]

export function QueueLog() {
  const [taken, setTaken] = useState<number[]>([]) // worker index for each delivered message
  const [offs, setOffs] = useState<Record<string, number>>({ Billing: 0, Analytics: 0 })
  const names = Object.keys(offs)
  const read = (k: string) => setOffs({ ...offs, [k]: Math.min(MSGS.length, offs[k] + 1) })
  return (
    <div className="ql">
      <div>
        <h4>Queue</h4>
        <div className="ql-row">
          {MSGS.map((m, i) => (
            <span key={m} className={`ql-msg ${i < taken.length ? 'gone' : ''}`}>
              {m}
            </span>
          ))}
        </div>
        <div className="ql-readers">
          {['Worker A', 'Worker B'].map((w, wi) => (
            <p key={w}>
              <b>{w}</b> got: {taken.map((x, i) => (x === wi ? MSGS[i] : null)).filter(Boolean).join(', ') || 'nothing yet'}
            </p>
          ))}
        </div>
        <div className="ql-btns">
          <button className="act" disabled={taken.length >= MSGS.length} onClick={() => setTaken([...taken, taken.length % 2])}>
            Deliver the next message
          </button>
          <button className="act ghost" onClick={() => setTaken([])}>
            Reset
          </button>
        </div>
        <p className="ql-note">Each message goes to one worker and is then deleted. More workers means the work is shared.</p>
      </div>
      <div>
        <h4>Log</h4>
        <div className="ql-row">
          {MSGS.map((m, i) => (
            <span key={m} className="ql-msg kept">
              {m}
              {names.map((k, ki) => offs[k] === i && <i key={k} className={`ql-ptr p${ki}`} title={`${k} reads this next`} />)}
            </span>
          ))}
        </div>
        <div className="ql-readers">
          {names.map((k, ki) => (
            <p key={k}>
              <i className={`ql-ptr p${ki} inline`} /> <b>{k}</b> has read {offs[k]} of {MSGS.length}
            </p>
          ))}
        </div>
        <div className="ql-btns">
          {names.map((k) => (
            <button key={k} className="act" disabled={offs[k] >= MSGS.length} onClick={() => read(k)}>
              {k} reads one
            </button>
          ))}
          {names.length < 3 ? (
            <button className="act ghost" onClick={() => setOffs({ ...offs, 'New reader': 0 })}>
              Add a new reader
            </button>
          ) : (
            <button className="act ghost" onClick={() => setOffs({ Billing: 0, Analytics: 0 })}>
              Reset
            </button>
          )}
        </div>
        <p className="ql-note">Nothing is deleted. Each reader keeps its own position, and a new reader starts from the first message.</p>
      </div>
    </div>
  )
}
