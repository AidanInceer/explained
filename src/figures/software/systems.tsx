import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { C, Seg, Slider, StepNav, fx, rng } from '../kit'

/* ---------- race condition ---------- */

type Op = { t: 1 | 2; op: string; c: number; r1?: number; r2?: number; wait?: boolean }
const RACE: Record<string, { ops: Op[]; end: string }> = {
  serial: {
    ops: [
      { t: 1, op: 'read counter → 0', c: 0, r1: 0 },
      { t: 1, op: 'add 1 → 1', c: 0, r1: 1 },
      { t: 1, op: 'write 1', c: 1, r1: 1 },
      { t: 2, op: 'read counter → 1', c: 1, r2: 1 },
      { t: 2, op: 'add 1 → 2', c: 1, r2: 2 },
      { t: 2, op: 'write 2', c: 2, r2: 2 },
    ],
    end: 'One thread finished before the other started. The counter is 2, as expected. This is the lucky case.',
  },
  race: {
    ops: [
      { t: 1, op: 'read counter → 0', c: 0, r1: 0 },
      { t: 2, op: 'read counter → 0', c: 0, r2: 0 },
      { t: 1, op: 'add 1 → 1', c: 0, r1: 1 },
      { t: 2, op: 'add 1 → 1', c: 0, r2: 1 },
      { t: 1, op: 'write 1', c: 1 },
      { t: 2, op: 'write 1', c: 1 },
    ],
    end: 'Both threads read 0 before either wrote. Both wrote 1. One increment is lost, and nothing reports an error. It happens only when the timing is unlucky, so tests rarely catch it.',
  },
  lock: {
    ops: [
      { t: 1, op: 'take the lock', c: 0 },
      { t: 1, op: 'read counter → 0', c: 0, r1: 0 },
      { t: 2, op: 'take the lock: busy, wait', c: 0, wait: true },
      { t: 1, op: 'add 1 → 1', c: 0, r1: 1 },
      { t: 1, op: 'write 1', c: 1 },
      { t: 1, op: 'release the lock', c: 1 },
      { t: 2, op: 'take the lock', c: 1 },
      { t: 2, op: 'read counter → 1', c: 1, r2: 1 },
      { t: 2, op: 'add 1 → 2', c: 1, r2: 2 },
      { t: 2, op: 'write 2', c: 2 },
      { t: 2, op: 'release the lock', c: 2 },
    ],
    end: 'The lock lets only one thread at a time run read, add, write. Thread 2 waited, then saw the new value. The counter is 2. The cost: thread 2 did nothing while it waited.',
  },
}

/** Two threads add 1 to the same counter. The order of their steps decides the answer. */
export function SwRace() {
  const [k, setK] = useState<keyof typeof RACE>('race')
  const [i, setI] = useState(0)
  const s = RACE[k]
  const col = (t: 1 | 2) => (
    <div>
      <h5 style={{ color: t === 1 ? C.blue : C.amber }}>Thread {t}</h5>
      <ul className="kx-list">
        {s.ops.map((o, j) =>
          o.t === t ? (
            <li key={j} className={j === i ? 'now' : undefined} style={{ opacity: j > i ? 0.35 : 1, color: o.wait ? C.red : undefined }}>
              {o.op}
            </li>
          ) : (
            <li key={j} style={{ background: 'transparent' }}>
              &nbsp;
            </li>
          ),
        )}
      </ul>
    </div>
  )
  const o = s.ops[i]
  return (
    <div className="kx">
      <Seg value={k} options={[['serial', 'One after the other'], ['race', 'Interleaved'], ['lock', 'With a lock']] as const} onChange={(v) => { setK(v); setI(0) }} />
      <StepNav i={i} n={s.ops.length} set={setI} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 150px', gap: 14, alignItems: 'start' }}>
        {col(1)}
        {col(2)}
        <div className="box" style={{ textAlign: 'center' }}>
          <small style={{ color: 'var(--ink-2)' }}>Shared counter</small>
          <div className="kx-num" style={{ fontSize: 40, fontWeight: 700 }}>
            {o.c}
          </div>
          <small style={{ color: 'var(--ink-3)' }}>should end at 2</small>
        </div>
      </div>
      <p className="stat" role="status">
        {i === s.ops.length - 1 ? s.end : 'Adding 1 is three steps: read the value, add 1 in the thread\'s own copy, write it back. Another thread can run between any two steps.'}
      </p>
    </div>
  )
}

/* ---------- event loop ---------- */

const CODE = ["console.log('A')", "setTimeout(() => console.log('B'), 0)", "Promise.resolve().then(() => console.log('C'))", "console.log('D')"]
type Ev = { line: number; stack: string[]; micro: string[]; task: string[]; out: string; say: string }
const EV: Ev[] = [
  { line: -1, stack: ['script'], micro: [], task: [], out: '', say: 'The browser starts to run the script. It is one task, on the call stack.' },
  { line: 0, stack: ['script', 'console.log'], micro: [], task: [], out: 'A', say: "Line 1 runs at once and prints A." },
  { line: 1, stack: ['script', 'setTimeout'], micro: [], task: ['log B'], out: 'A', say: 'setTimeout hands the function to the browser. After 0 ms the browser puts it in the task queue. It does not run now.' },
  { line: 2, stack: ['script', 'then'], micro: ['log C'], task: ['log B'], out: 'A', say: 'The promise is already resolved, so its callback goes to the microtask queue. It does not run now either.' },
  { line: 3, stack: ['script', 'console.log'], micro: ['log C'], task: ['log B'], out: 'A D', say: 'Line 4 prints D. The script keeps the stack busy until its last line.' },
  { line: -1, stack: [], micro: ['log C'], task: ['log B'], out: 'A D', say: 'The script ends and the stack is empty. Now the event loop runs every waiting microtask, before anything else.' },
  { line: -1, stack: ['log C'], micro: [], task: ['log B'], out: 'A D C', say: 'The microtask prints C.' },
  { line: -1, stack: [], micro: [], task: ['log B'], out: 'A D C', say: 'No microtasks are left. The browser may now draw the screen. Then the event loop takes the next task from the task queue.' },
  { line: -1, stack: ['log B'], micro: [], task: [], out: 'A D C B', say: 'The timer callback prints B, last, although its delay was 0. A delay is a minimum wait, not a promise of when.' },
]

export function SwEventLoop() {
  const [i, setI] = useState(0)
  const e = EV[i]
  const box = (title: string, items: string[], color: string, note: string) => (
    <div className="box" style={{ minHeight: 96 }}>
      <h4>{title}</h4>
      <small style={{ color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>{note}</small>
      <div style={{ display: 'flex', flexDirection: title === 'Call stack' ? 'column-reverse' : 'row', gap: 4, flexWrap: 'wrap' }}>
        {items.length === 0 && <small style={{ color: 'var(--ink-3)' }}>empty</small>}
        {items.map((it, k) => (
          <span key={k} className="kx-mono" style={{ background: color, color: '#fff', padding: '3px 8px', borderRadius: 3 }}>
            {it}
          </span>
        ))}
      </div>
    </div>
  )
  return (
    <div className="kx">
      <StepNav i={i} n={EV.length} set={setI} />
      <div className="kx-two">
        <pre className="kx-mono" style={{ margin: 0, padding: 10, background: 'var(--surface-2)', borderRadius: 4, overflowX: 'auto', fontSize: 12.5, lineHeight: 1.8 }}>
          {CODE.map((l, k) => (
            <div key={k} style={{ background: k === e.line ? '#fbecc8' : undefined, paddingLeft: 4 }}>
              <span style={{ color: 'var(--ink-3)' }}>{k + 1} </span>
              {l}
            </div>
          ))}
        </pre>
        <div className="box">
          <h4>Console</h4>
          <div className="kx-mono" style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, minHeight: 30 }}>
            {e.out}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 12 }}>
        {box('Call stack', e.stack, 'var(--ink)', 'what runs now')}
        {box('Microtask queue', e.micro, C.teal, 'promise callbacks: run first')}
        {box('Task queue', e.task, C.amber, 'timers, clicks, network: one at a time')}
      </div>
      <p className="stat" role="status">
        {e.say}
      </p>
    </div>
  )
}

/* ---------- opening a page ---------- */

/** Round trips add up. A waterfall of DNS, TCP, TLS and the request, for a chosen distance to the server. */
export function SwPageLoad() {
  const [rtt, setRtt] = useState(80)
  const [server, setServer] = useState(120)
  const [dns, setDns] = useState(false)
  const [tls, setTls] = useState<'13' | '12'>('13')
  const [reuse, setReuse] = useState(false)
  const phases: [string, number, string][] = []
  if (!reuse) {
    if (!dns) phases.push(['DNS lookup', rtt, C.purple])
    phases.push(['TCP handshake', rtt, C.blue])
    phases.push([`TLS ${tls === '13' ? '1.3' : '1.2'} handshake`, rtt * (tls === '13' ? 1 : 2), C.teal])
  }
  phases.push(['Request travels', rtt / 2, C.amber])
  phases.push(['Server works', server, C.red])
  phases.push(['First byte returns', rtt / 2, C.amber])
  const total = phases.reduce((a, [, d]) => a + d, 0)
  let at = 0
  const scaleMax = Math.max(total, 600)
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Round trip to the server" value={rtt} min={5} max={300} step={5} onChange={setRtt} show={(v) => `${v} ms`} />
        <Slider label="Server time" value={server} min={5} max={500} step={5} onChange={setServer} show={(v) => `${v} ms`} />
        <Seg label="TLS version" value={tls} options={[['13', '1.3'], ['12', '1.2']] as const} onChange={setTls} />
      </div>
      <div className="kx-row">
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" checked={dns} onChange={() => setDns(!dns)} />
          Address already in the DNS cache
        </label>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" checked={reuse} onChange={() => setReuse(!reuse)} />
          Reuse an open connection
        </label>
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        {phases.map(([name, d, col]) => {
          const left = (at / scaleMax) * 100
          at += d
          return (
            <div key={name} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 64px', gap: 8, alignItems: 'center', fontSize: 13.5 }}>
              <span>{name}</span>
              <span style={{ position: 'relative', height: 18, background: 'var(--surface-2)', borderRadius: 3 }}>
                <i style={{ position: 'absolute', left: `${left}%`, width: `${Math.max(0.6, (d / scaleMax) * 100)}%`, top: 0, bottom: 0, background: col, borderRadius: 3, transition: 'all 0.25s' }} />
              </span>
              <span className="kx-mono" style={{ textAlign: 'right' }}>
                {fx(d, 0)} ms
              </span>
            </div>
          )
        })}
      </div>
      <div className="kx-kpis">
        <div className="hl">
          <small>Time to first byte</small>
          <b>{fx(total, 0)} ms</b>
        </div>
        <div>
          <small>Spent travelling, not working</small>
          <b>{fx(((total - server) / total) * 100, 0)}%</b>
        </div>
      </div>
      <p className="stat">
        A round trip of 80 ms is about London to New York and back. A new secure connection costs several round trips before the first request is
        even sent. That is why a server close to the user, cached DNS, TLS 1.3 and reused connections make pages faster, even when the server itself
        is quick.
      </p>
    </div>
  )
}

/* ---------- cache with a time to live ---------- */

const WRITES = [9, 24, 41]

/** Reads once a second for a minute; the data changes three times. The TTL decides hits, misses and stale reads. */
export function SwCache() {
  const [ttl, setTtl] = useState(10)
  const [inv, setInv] = useState(false)
  const res: ('miss' | 'hit' | 'stale')[] = []
  let at = -1
  let ver = -1
  for (let t = 0; t < 60; t++) {
    const cur = WRITES.filter((w) => w <= t).length
    if (inv && WRITES.includes(t)) at = -1
    if (ttl > 0 && at >= 0 && t - at < ttl) res.push(ver === cur ? 'hit' : 'stale')
    else {
      res.push('miss')
      at = t
      ver = cur
    }
  }
  const miss = res.filter((r) => r === 'miss').length
  const stale = res.filter((r) => r === 'stale').length
  const col = { miss: C.grey, hit: C.teal, stale: C.red }
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Time to live (TTL)" value={ttl} min={0} max={30} onChange={setTtl} show={(v) => (v === 0 ? 'no cache' : `${v} s`)} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" checked={inv} onChange={() => setInv(!inv)} />
          Delete the cached copy when the data changes
        </label>
      </div>
      <svg viewBox="0 0 610 92" role="img" aria-label={`60 reads, one a second. ${miss} go to the database, ${60 - miss - stale} are fresh cache hits, ${stale} are stale.`}>
        {WRITES.map((w) => (
          <g key={w}>
            <line x1={10 + w * 10} x2={10 + w * 10} y1={6} y2={70} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="3 3" />
            <text x={12 + w * 10} y={14} className="b" style={{ fontSize: 11 }}>
              data changes
            </text>
          </g>
        ))}
        {res.map((r, t) => (
          <rect key={t} x={10 + t * 10 + 1} y={24} width={8} height={40} rx={1.5} fill={col[r]} />
        ))}
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <text key={t} x={10 + t * 10} y={84} fontSize={11}>
            {t} s
          </text>
        ))}
      </svg>
      <div className="kx-kpis">
        <div>
          <small style={{ color: 'var(--ink-3)' }}>■ Database reads</small>
          <b>{miss}</b>
        </div>
        <div>
          <small style={{ color: C.teal }}>■ Fresh from cache</small>
          <b>{60 - miss - stale}</b>
        </div>
        <div className="hl">
          <small style={{ color: C.red }}>■ Stale from cache</small>
          <b>{stale}</b>
        </div>
      </div>
      <p className="stat">
        A longer TTL saves more database reads, but after each change the cache keeps serving the old value until the copy expires: the red bars.
        {inv ? ' Deleting the copy on each change removes the stale reads, but now every place that writes the data must also clear the cache.' : ' Turn on deletion to see the other way.'}
      </p>
    </div>
  )
}

/* ---------- retries and backoff ---------- */

type Strat = 'fixed' | 'exp' | 'jitter'

function simulate(strat: Strat, outage: number) {
  const r = rng(17)
  const CAP = 50
  const N = 300
  let next: { t: number; n: number }[] = Array.from({ length: N }, () => ({ t: r() * 0.2, n: 0 }))
  const ok: number[] = []
  const bad: number[] = []
  let sent = 0
  let lastDone = 0
  for (let s = 0; s < 90 && next.length; s++) {
    const now = next.filter((a) => a.t < s + 1)
    next = next.filter((a) => a.t >= s + 1)
    for (let k = now.length - 1; k > 0; k--) {
      const j = Math.floor(r() * (k + 1))
      ;[now[k], now[j]] = [now[j], now[k]]
    }
    let o = 0
    let b = 0
    for (const a of now) {
      sent++
      if (s >= outage && o < CAP) {
        o++
        lastDone = s + 1
      } else {
        b++
        const wait = strat === 'fixed' ? 1 : Math.min(32, 2 ** a.n)
        next.push({ t: a.t + (strat === 'jitter' ? r() * wait + 0.05 : wait), n: a.n + 1 })
      }
    }
    ok.push(o)
    bad.push(b)
  }
  return { ok, bad, sent, lastDone, left: next.length, CAP }
}

/** 300 clients, a server that is down for a while, and three ways to retry. */
export function SwBackoff() {
  const [strat, setStrat] = useState<Strat>('fixed')
  const [outage, setOutage] = useState(8)
  const sim = useMemo(() => simulate(strat, outage), [strat, outage])
  const S = 60
  const top = 320
  const W = 600 / S
  const y = (v: number) => 160 - (Math.min(v, top) / top) * 150
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Seg label="When a request fails, try again after" value={strat} options={[['fixed', '1 second'], ['exp', '1, 2, 4, 8… s'], ['jitter', 'random up to 1, 2, 4, 8… s']] as const} onChange={setStrat} />
        <Slider label="Server down for" value={outage} min={2} max={20} onChange={setOutage} show={(v) => `${v} s`} />
      </div>
      <svg viewBox="0 0 610 186" role="img" aria-label={`Requests each second. ${sim.sent} requests in total; all clients done after ${sim.lastDone} seconds.`}>
        <rect x={5} y={8} width={outage * W} height={152} fill={C.red} fillOpacity={0.07} />
        <text x={9} y={22} style={{ fill: C.red, fontSize: 11 }} className="b">
          server down
        </text>
        {sim.ok.slice(0, S).map((o, s) => (
          <g key={s}>
            <rect x={5 + s * W + 0.5} width={W - 1} y={y(o + sim.bad[s])} height={160 - y(sim.bad[s])} fill={C.red} fillOpacity={0.75} />
            <rect x={5 + s * W + 0.5} width={W - 1} y={y(o)} height={160 - y(o)} fill={C.teal} />
          </g>
        ))}
        <line x1={5} x2={605} y1={y(sim.CAP)} y2={y(sim.CAP)} stroke="var(--ink)" strokeDasharray="5 4" />
        <text x={603} y={y(sim.CAP) - 5} textAnchor="end" className="b" style={{ fontSize: 11 }}>
          capacity: 50 a second
        </text>
        <line className="ax" x1={5} x2={605} y1={160} y2={160} />
        {[0, 10, 20, 30, 40, 50].map((t) => (
          <text key={t} x={5 + t * W} y={176} fontSize={11}>
            {t} s
          </text>
        ))}
      </svg>
      <div className="kx-kpis">
        <div className="hl">
          <small>All 300 served after</small>
          <b>{sim.left ? 'not yet' : `${sim.lastDone} s`}</b>
        </div>
        <div>
          <small>Requests sent</small>
          <b>{sim.sent.toLocaleString('en-GB')}</b>
        </div>
        <div>
          <small>Wasted (failed) requests</small>
          <b>{(sim.sent - 300).toLocaleString('en-GB')}</b>
        </div>
      </div>
      <p className="stat">
        Green: requests served. Red: requests that failed.{' '}
        {strat === 'fixed'
          ? 'Every client retries every second, so the server gets the full crowd again and again, during the outage and after it.'
          : strat === 'exp'
            ? 'Waiting longer each time cuts the load, but the clients failed together, so they also retry together: the requests arrive in waves.'
            : 'With a random wait, the retries spread out. The load stays near what the server can take, so it recovers fastest with the fewest wasted requests.'}
      </p>
    </div>
  )
}

/* ---------- load and latency ---------- */

/** Latency rises slowly, then very fast, as servers get busy. */
export function SwLoad() {
  const [rate, setRate] = useState(120)
  const [servers, setServers] = useState(8)
  const S = 50 // ms of work per request
  const per = 1000 / S // requests a second that one server can do
  const rho = rate / (servers * per)
  const lat = rho < 1 ? S / (1 - rho) : Infinity
  const pts = []
  for (let u = 0; u <= 0.97; u += 0.01) pts.push(`${30 + u * 560},${170 - Math.min(1000, S / (1 - u)) / 1000 * 160}`)
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Requests a second" value={rate} min={10} max={400} step={10} onChange={setRate} />
        <Slider label="Servers" value={servers} min={1} max={20} onChange={setServers} />
      </div>
      <svg viewBox="0 0 600 196" role="img" aria-label={`Each server is ${fx(Math.min(rho, 1) * 100, 0)}% busy. Average response time ${Number.isFinite(lat) ? `${fx(lat, 0)} ms` : 'grows without limit'}.`}>
        <line className="ax" x1={30} x2={590} y1={170} y2={170} />
        <line className="ax" x1={30} x2={30} y1={6} y2={170} />
        <polyline points={pts.join(' ')} className="curve" />
        {Number.isFinite(lat) && lat < 1000 && <circle cx={30 + rho * 560} cy={170 - (lat / 1000) * 160} r={7} fill={rho > 0.8 ? C.red : C.blue} />}
        {[0, 25, 50, 75, 100].map((p) => (
          <text key={p} x={30 + p * 5.6} y={186} textAnchor="middle" fontSize={11}>
            {p}%
          </text>
        ))}
        <text x={36} y={16} fontSize={11}>
          response time (up to 1 s)
        </text>
        <text x={588} y={160} textAnchor="end" fontSize={11}>
          how busy each server is →
        </text>
      </svg>
      <div className="kx-kpis">
        <div>
          <small>Each server busy</small>
          <b>{rho >= 1 ? 'over 100%' : `${fx(rho * 100, 0)}%`}</b>
        </div>
        <div className="hl">
          <small>Average response time</small>
          <b>{Number.isFinite(lat) ? `${fx(lat, 0)} ms` : 'grows forever'}</b>
        </div>
        <div>
          <small>Servers to stay under 70% busy</small>
          <b>{Math.ceil(rate / (per * 0.7))}</b>
        </div>
      </div>
      <p className="stat">
        Each request needs 50 ms of work, so one server can do 20 a second. Requests arrive at random, so even a server that is not full sometimes
        has a queue. At 50% busy the response time doubles; at 90% it is ten times the work time. Over 100%, the queue grows without end. Plan for
        the busy hour with room to spare, not for the average.
      </p>
    </div>
  )
}

/* ---------- branches, merge and rebase ---------- */

type Dot = { id: string; x: number; y: number; ghost?: boolean }
const GIT_STEPS = [
  { cmd: 'git commit (twice, on main)', say: 'main has two commits, A and B. Each commit points to the one before it.' },
  { cmd: 'git switch -c feature', say: 'A branch is only a name that points to a commit. "feature" starts at B. Nothing is copied.' },
  { cmd: 'git commit (on feature)', say: 'A new commit C on feature. main does not move.' },
  { cmd: 'git commit (on feature)', say: 'Another commit, D. feature now points to D.' },
  { cmd: 'someone merges E into main', say: 'Meanwhile a teammate adds E to main. The two lines of work have split.' },
  { cmd: '', say: '' },
]

export function SwGit() {
  const [i, setI] = useState(0)
  const [how, setHow] = useState<'merge' | 'rebase'>('merge')
  const M = 70
  const F = 150
  const dots: Dot[] = [{ id: 'A', x: 50, y: M }, { id: 'B', x: 130, y: M }]
  const links: [string, string][] = [['A', 'B']]
  let mainAt = 'B'
  let featAt = i >= 1 ? 'B' : ''
  if (i >= 2) {
    dots.push({ id: 'C', x: 210, y: F })
    links.push(['B', 'C'])
    featAt = 'C'
  }
  if (i >= 3) {
    dots.push({ id: 'D', x: 290, y: F })
    links.push(['C', 'D'])
    featAt = 'D'
  }
  if (i >= 4) {
    dots.push({ id: 'E', x: 250, y: M })
    links.push(['B', 'E'])
    mainAt = 'E'
  }
  const last = i === GIT_STEPS.length - 1
  if (last && how === 'merge') {
    dots.push({ id: 'M', x: 380, y: M })
    links.push(['E', 'M'], ['D', 'M'])
    mainAt = 'M'
    featAt = 'D'
  }
  if (last && how === 'rebase') {
    for (const d of dots) if (d.id === 'C' || d.id === 'D') d.ghost = true
    dots.push({ id: "C'", x: 340, y: M }, { id: "D'", x: 420, y: M })
    links.push(['E', "C'"], ["C'", "D'"])
    mainAt = "D'"
    featAt = "D'"
  }
  const pos = (id: string) => dots.find((d) => d.id === id)!
  const label = (id: string, name: string, color: string, below: boolean): ReactNode => {
    if (!id) return null
    const p = pos(id)
    return (
      <g>
        <rect x={p.x - 30} y={below ? p.y + 22 : p.y - 46} width={60} height={20} rx={3} fill={color} />
        <text x={p.x} y={below ? p.y + 36 : p.y - 32} textAnchor="middle" className="w" style={{ fontSize: 11.5 }}>
          {name}
        </text>
      </g>
    )
  }
  const step = GIT_STEPS[i]
  return (
    <div className="kx">
      <StepNav i={i} n={GIT_STEPS.length} set={setI} />
      {last && <Seg value={how} options={[['merge', 'git merge'], ['rebase', 'git rebase, then merge']] as const} onChange={setHow} />}
      <p className="kx-mono" style={{ margin: '0 0 6px' }}>
        $ {last ? (how === 'merge' ? 'git switch main && git merge feature' : 'git rebase main && git switch main && git merge feature') : step.cmd}
      </p>
      <div className="kx-scroll">
        <svg viewBox="0 0 480 210" role="img" aria-label={`Commit graph. main points to ${mainAt}${featAt ? `, feature points to ${featAt}` : ''}.`}>
          {links.map(([a, b]) => {
            const p = pos(a)
            const q = pos(b)
            const ghost = p.ghost || q.ghost
            return <line key={a + b} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={ghost ? '#d5dbe2' : 'var(--ink-3)'} strokeWidth={2.5} strokeDasharray={ghost ? '4 4' : undefined} />
          })}
          {dots.map((d) => (
            <g key={d.id} opacity={d.ghost ? 0.35 : 1}>
              <circle cx={d.x} cy={d.y} r={16} fill={d.id === 'M' ? C.purple : d.y === F || d.id.endsWith("'") ? C.amber : C.blue} stroke="#fff" strokeWidth={2} />
              <text x={d.x} y={d.y + 4} textAnchor="middle" className="w">
                {d.id}
              </text>
            </g>
          ))}
          {label(mainAt, 'main', 'var(--ink)', false)}
          {featAt && featAt !== mainAt && label(featAt, 'feature', C.amber, true)}
          {featAt && featAt === mainAt && label(featAt, 'feature', C.amber, true)}
        </svg>
      </div>
      <p className="stat" role="status">
        {last
          ? how === 'merge'
            ? 'A merge commit M joins the two lines. It has two parents, E and D. History shows exactly what happened, including the split.'
            : "Rebase replays C and D on top of E as new commits C' and D', with new ids. History is one straight line, but it is rewritten: never rebase commits that others already use."
          : step.say}
      </p>
    </div>
  )
}

/* ---------- a hash function ---------- */

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
const bitsDiff = (a: string, b: string) => {
  let n = 0
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16)
    while (x) {
      n += x & 1
      x >>= 1
    }
  }
  return n
}

/** Type and watch the SHA-256 fingerprint change completely. */
export function SwHashFn() {
  const [text, setText] = useState('hello world')
  const [hs, setHs] = useState<string[]>([])
  const ok = typeof crypto !== 'undefined' && !!crypto.subtle
  useEffect(() => {
    if (!ok) return
    let live = true
    sha256(text).then((d) => {
      if (live) setHs((old) => (old[old.length - 1] === d ? old : [...old.slice(-1), d]))
    })
    return () => {
      live = false
    }
  }, [text, ok])
  const h = hs[hs.length - 1] ?? ''
  const prev = hs.length > 1 ? { h: hs[0] } : null
  const diff = prev && h ? bitsDiff(prev.h, h) : null
  if (!ok) return <p className="stat">This figure needs the browser's Web Crypto feature, which is available only on secure (https) pages.</p>
  return (
    <div className="kx">
      <label className="sl">
        <span>Text to hash</span>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} style={{ font: 'inherit', padding: '6px 9px', border: '1px solid var(--rule)', borderRadius: 4 }} />
      </label>
      <div className="kx-row" style={{ marginTop: 8 }}>
        <button className="act ghost" onClick={() => setText(text.length ? text.slice(0, -1) + String.fromCharCode(text.charCodeAt(text.length - 1) ^ 1) : 'a')}>
          Change one bit of the last letter
        </button>
      </div>
      <h5>SHA-256 ({text.length} characters in, always 256 bits out)</h5>
      <p className="kx-mono" style={{ wordBreak: 'break-all', margin: '0 0 6px', fontSize: 14 }}>
        {h.split('').map((c, i) => (
          <span key={i} style={{ background: prev && prev.h[i] !== c ? '#fbecc8' : undefined }}>
            {c}
          </span>
        ))}
      </p>
      {prev && (
        <p className="kx-mono" style={{ wordBreak: 'break-all', margin: 0, fontSize: 12, color: 'var(--ink-3)' }}>
          before: {prev.h}
        </p>
      )}
      <div className="kx-kpis">
        <div className="hl">
          <small>Bits changed since the last hash</small>
          <b>{diff === null ? '–' : `${diff} of 256`}</b>
        </div>
      </div>
      <p className="stat">
        Change one letter and about half of the 256 bits change (orange: the hex digits that differ). You cannot work back from the hash to the text,
        and you cannot steer the output. The same text always gives the same hash, so it works as a fingerprint.
      </p>
    </div>
  )
}
