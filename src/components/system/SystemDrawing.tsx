import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { H, type Node } from '../../figures/whiteboard'
import { ARROWS, BY, CHECKS, CI, DAG, HGT, NODES, NOTES, SCREENS, SCREEN_H, SCREEN_W, STAGES, W, type Flow } from './data'
import { LESSONS } from '../../data/curriculum'
import './system.css'

/* The home page drawing: one invented airline's data platform, with data moving on every line.
   Tabs focus on one journey, or show the five stages. */

const TITLE = Object.fromEntries(LESSONS.map((l) => [l.id, l.title]))
const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- frame and motion, in the style of Cloudflare's diagrams ---------- */

// One switch for all motion on the page. The frames show it as a small pause button in the top-left corner.
const Motion = createContext<{ paused: boolean; toggle: () => void }>({ paused: false, toggle: () => {} })

function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return setSeen(true)
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, seen]
}

/** A hairline frame with square corner marks. Parts inside share borders, like cells in a grid. */
function Frame({ className = '', refEl, top, children }: { className?: string; refEl?: RefObject<HTMLDivElement | null>; top?: ReactNode; children: ReactNode }) {
  const { paused, toggle } = useContext(Motion)
  return (
    <div className={`mk mk-frame ${className}`} ref={refEl}>
      <i className="mk-c tl" aria-hidden="true" />
      <i className="mk-c tr" aria-hidden="true" />
      <i className="mk-c bl" aria-hidden="true" />
      <i className="mk-c br" aria-hidden="true" />
      <div className="mk-top">
        <div className="mk-top-main">{top}</div>
      {!still && (
        <button className="mk-pause" onClick={toggle} aria-pressed={paused} aria-label={paused ? 'Play motion' : 'Pause motion'} title={paused ? 'Play motion' : 'Pause motion'}>
          <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
            {paused ? <path d="M3 1.5v9l7-4.5z" fill="currentColor" /> : <path d="M3 1.5v9M9 1.5v9" stroke="currentColor" strokeWidth="2.2" />}
          </svg>
        </button>
      )}
      </div>
      {children}
    </div>
  )
}

/* ---------- the drawing: tiles, routed lines and a live data-flow engine ----------
   Cloudflare-style system diagram: one ink colour on a dot grid, hairline frames with square corner marks,
   tiles with small icons, and orange for whatever is happening now. Data moves as square packets with
   short trails. A part that receives a packet flashes, and its counter goes up. */

type BoardProps = {
  lit?: Set<string> | null // parts at full strength; others are faint. null = all at full strength
  litArrows?: Set<number> | null // lines at full strength; default: both ends lit
  flows?: 'all' | Set<number> | 'none'
  picked?: string | null
  onPick?: (id: string) => void
  onHover?: (id: string | null) => void
  viewBox?: string
  label: string
  children?: ReactNode
  under?: ReactNode
  notesOn?: boolean
  parcel?: { i: number; key: string; onArrive: () => void } | null
}

type Glyph = 'app' | 'db' | 'api' | 'file' | 'log' | 'cdc' | 'plug' | 'cpu' | 'table' | 'person' | 'model' | 'mail'
const GLYPH: Record<string, Glyph> = {
  ev: 'app', book: 'db', pay: 'api', ops: 'file', crm: 'api', kafka: 'log', cdc: 'cdc', load: 'plug', flink: 'cpu', rt: 'db',
  bronze: 'table', silver: 'table', gold: 'table', mfin: 'table', mrev: 'table', mmkt: 'table', uml: 'model', ucrm: 'mail',
  t1: 'person', t2: 'person', t3: 'person', t4: 'person', t5: 'person',
}
export const GLYPH_D: Record<Glyph, string> = {
  app: 'M4 5.5h12v9H4z M4 8.5h12',
  db: 'M5 6a5 2 0 1 0 10 0a5 2 0 1 0-10 0 M5 6v8a5 2 0 0 0 10 0V6 M5 10a5 2 0 0 0 10 0',
  api: 'M7.5 5.5 4 10l3.5 4.5 M12.5 5.5 16 10l-3.5 4.5',
  file: 'M6 3.5h5.5l3 3V16.5H6z M11.5 3.5v3h3',
  log: 'M4 6.5h8 M4 10h12 M4 13.5h6 M14 5l2 1.5-2 1.5',
  cdc: 'M5.5 8.5a4.8 4.8 0 0 1 8.6-1.6 M14.5 11.5a4.8 4.8 0 0 1-8.6 1.6 M14.4 4.4v2.8h-2.8 M5.6 15.6v-2.8h2.8',
  plug: 'M8 3.5v3.5 M12 3.5v3.5 M6 7h8v2.5a4 4 0 0 1-8 0z M10 13.5v3',
  cpu: 'M6.5 6.5h7v7h-7z M8.5 3.5v3 M11.5 3.5v3 M8.5 13.5v3 M11.5 13.5v3 M3.5 8.5h3 M3.5 11.5h3 M13.5 8.5h3 M13.5 11.5h3',
  table: 'M4 5h12v10H4z M4 8.5h12 M9 8.5V15',
  person: 'M7.2 7a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0-5.6 0 M4.5 16.5a5.5 4.5 0 0 1 11 0',
  model: 'M4 15l4-6 3 3 5-7 M14 5h2v2',
  mail: 'M4 6h12v9H4z M4 6l6 5 6-5',
}
// Tiers have a real meaning, so they keep a colour mark: raw, clean, modelled.
const TIER: Record<string, string> = { bronze: '#a8703f', silver: '#8e989d', gold: '#c39a12' }
// Running totals that go up each time a packet arrives.
const COUNT: Record<string, { start: number; unit: string; per: [number, number] }> = {
  kafka: { start: 48210, unit: 'events', per: [40, 160] },
  bronze: { start: 1204880, unit: 'rows', per: [200, 900] },
  silver: { start: 1180412, unit: 'rows', per: [180, 860] },
  gold: { start: 392140, unit: 'rows', per: [60, 300] },
  ucrm: { start: 18240, unit: 'synced', per: [4, 18] },
}
const fmt = (n: number) => Math.round(n).toLocaleString('en-GB')

function Icon({ g, x, y, size = 20 }: { g: Glyph; x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size / 20})`} className="fd-icon">
      <rect width="20" height="20" rx="3.5" className="fd-ibox" />
      <path d={GLYPH_D[g]} className="fd-glyph" />
    </g>
  )
}

/** Square marks on the four corners of a frame. */
function Corners({ x, y, w, h, s = 7, className = 'fd-corner' }: { x: number; y: number; w: number; h: number; s?: number; className?: string }) {
  return (
    <>
      {[
        [x, y],
        [x + w, y],
        [x, y + h],
        [x + w, y + h],
      ].map(([cx, cy], i) => (
        <rect key={i} x={cx - s / 2} y={cy - s / 2} width={s} height={s} rx="1.2" className={className} />
      ))}
    </>
  )
}

/** Lines run across and down with rounded bends, like a circuit, instead of straight across the page. */
function route(a: Flow) {
  const f = BY[a.from] as Node
  const t = BY[a.to] as Node
  const fh = H(f)
  const th = H(t)
  const sideways = t.x >= f.x + f.w - 2 || t.x + t.w <= f.x + 2
  let pts: [number, number][]
  if (sideways) {
    const right = t.x >= f.x + f.w - 2
    const x1 = right ? f.x + f.w : f.x
    const x2 = right ? t.x : t.x + t.w
    const y1 = f.y + fh / 2
    const y2 = t.y + th / 2
    const mx = Math.round((x1 + x2) / 2)
    pts = Math.abs(y1 - y2) < 1 ? [[x1, y1], [x2, y2]] : [[x1, y1], [mx, y1], [mx, y2], [x2, y2]]
  } else {
    const down = t.y > f.y
    // Shared x range: go straight up or down through it.
    const lo = Math.max(f.x, t.x)
    const hi = Math.min(f.x + f.w, t.x + t.w)
    const y1 = down ? f.y + fh : f.y
    const y2 = down ? t.y : t.y + th
    if (hi - lo > 16) {
      const x = Math.round((lo + hi) / 2)
      pts = [[x, y1], [x, y2]]
    } else {
      const x1 = f.x + f.w / 2
      const x2 = t.x + t.w / 2
      const my = Math.round((y1 + y2) / 2)
      pts = [[x1, y1], [x1, my], [x2, my], [x2, y2]]
    }
  }
  // Round each bend.
  let d = `M${pts[0][0]} ${pts[0][1]}`
  for (let k = 1; k < pts.length; k++) {
    const [x, y] = pts[k]
    if (k < pts.length - 1) {
      const [px, py] = pts[k - 1]
      const [nx, ny] = pts[k + 1]
      const r = Math.min(10, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2)
      const ax = x - Math.sign(x - px) * r
      const ay = y - Math.sign(y - py) * r
      const bx = x + Math.sign(nx - x) * r
      const by = y + Math.sign(ny - y) * r
      d += ` L${ax} ${ay} Q${x} ${y} ${bx} ${by}`
    } else d += ` L${x} ${y}`
  }
  return { d, end: pts[pts.length - 1] }
}
const ROUTES_D = ARROWS.map(route)

function Extras({ id }: { id: string }) {
  if (id === 'dag')
    return (
      <>
        {DAG.map((d, i) => (
          <g key={d} className={`fd-chip ${d === 'test' ? 'gate' : ''}`}>
            <rect x={402 + i * 66} y={420} width="56" height="30" rx="3" />
            {i < DAG.length - 1 && <path d={`M${458 + i * 66} 435 h10`} className="fd-chip-link" />}
            <text x={430 + i * 66} y={439.5} textAnchor="middle">
              {d}
            </text>
          </g>
        ))}
      </>
    )
  if (id === 'ci')
    return (
      <>
        {/* The engine walks a change through these steps: each one runs, then shows a tick. */}
        {CI.map((d, i) => (
          <g key={d} className="fd-chip fd-ci" data-ci={i}>
            <rect x={228 + i * 160} y={532} width="142" height="34" rx="3" />
            {i < CI.length - 1 && <path d={`M${370 + i * 160} 549 h18`} className="fd-chip-link" />}
            <text x={299 + i * 160} y={554} textAnchor="middle">
              {d}
            </text>
            <circle cx={362 + i * 160} cy={539.5} r="3" className="fd-ci-run" />
            <path d={`M${358 + i * 160} 539.5 l2.5 2.5 l4.5 -5`} className="fd-ci-ok" />
          </g>
        ))}
      </>
    )
  if (id === 'dq')
    return (
      <>
        {CHECKS.map(([name, ok], i) => (
          <text key={name} x={858} y={422 + i * 15} className={`fd-check ${ok ? 'ok' : 'bad'}`}>
            {ok ? '✓' : '✗'} {name}
          </text>
        ))}
      </>
    )
  if (id === 'gov')
    return (
      <>
        {['catalogue + lineage', 'who can see what', 'PII masked'].map((g, i) => (
          <text key={g} x={1016} y={422 + i * 16} className="fd-small">
            {g}
          </text>
        ))}
      </>
    )
  return null
}

function Screen({ id, x, y, title }: { id: string; x: number; y: number; title: string }) {
  return (
    <>
      <rect x={x} y={y} width={SCREEN_W} height={SCREEN_H} rx="4" className="fd-tile" />
      <path d={`M${x} ${y + 24}h${SCREEN_W}`} className="fd-rule" />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={x + 10 + k * 7} cy={y + 12} r="2" className="fd-dot" />
      ))}
      <text x={x + 31} y={y + 16} className="fd-small fd-screen-title">
        {title}
      </text>
      {id === 'uops' &&
        Array.from({ length: 14 }, (_, k) => (
          <rect key={k} x={x + 10 + (k % 7) * 20} y={y + 31 + Math.floor(k / 7) * 17} width="15" height="12" rx="1.5" className={`fd-seat ${[1, 4, 8, 9, 12].includes(k) ? 'free' : ''} ${[3, 10].includes(k) ? 'blink' : ''}`} style={{ animationDelay: `${k * 0.4}s` }} />
        ))}
      {id === 'ufin' && [16, 22, 19, 28, 25, 33].map((v, k) => <rect key={k} x={x + 14 + k * 22} y={y + 64 - v} width="13" height={v} rx="1" className={`fd-bar ${k === 5 ? 'now' : ''}`} />)}
      {id === 'urev' && <path d={`M${x + 12} ${y + 60} l24 -4 l24 -7 l24 -3 l24 -12 l26 -14`} className="fd-trend" />}
    </>
  )
}

function Part({ n, on, hi, picked, pick, hover }: { n: Node; on: boolean; hi: boolean; picked: boolean; pick?: (id: string) => void; hover?: (id: string | null) => void }) {
  const zone = n.kind === 'zone'
  const s = SCREENS.find((x) => x.id === n.id)
  const name = s ? s.title : n.label
  const h = s ? SCREEN_H : H(n)
  const w = s ? SCREEN_W : n.w
  const tall = !zone && !s && h >= 80
  const pill = n.kind === 'who'
  const narrow = !pill && w <= 130
  const g = GLYPH[n.id]
  const act = pick
    ? {
        role: 'button',
        tabIndex: 0,
        'aria-label': name,
        'aria-pressed': picked,
        onClick: () => pick(n.id),
        onKeyDown: (e: React.KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(n.id)),
        onMouseEnter: () => hover?.(n.id),
        onMouseLeave: () => hover?.(null),
        onFocus: () => hover?.(n.id),
        onBlur: () => hover?.(null),
      }
    : {}
  const c = COUNT[n.id]
  return (
    <g data-id={n.id} className={`mk-part fd-part ${on ? '' : 'off'} ${hi ? 'hi' : ''} ${picked ? 'picked' : ''} ${pick ? 'can' : ''} ${zone ? 'zone' : ''}`} {...act}>
      {zone ? (
        <>
          <rect x={n.x} y={n.y} width={w} height={h} rx="2" className="fd-zone" />
          <Corners x={n.x} y={n.y} w={w} h={h} />
          <text x={n.x + 12} y={n.y + 20} className="fd-zone-label">
            {n.label}
          </text>
        </>
      ) : s ? (
        <Screen id={s.id} x={n.x} y={n.y} title={s.title} />
      ) : (
        <>
          <rect x={n.x} y={n.y} width={w} height={h} rx={pill ? h / 2 : 4} className="fd-tile" />
          {TIER[n.id] && <path d={`M${n.x + 4} ${n.y + 1.5}h${w - 8}`} stroke={TIER[n.id]} strokeWidth="3" strokeLinecap="round" />}
          {tall ? (
            <>
              {g && <Icon g={g} x={n.x + 10} y={n.y + 12} />}
              <text x={n.x + 10} y={n.y + 52} className="fd-label">
                {n.label}
              </text>
              {n.sub && (
                <text x={n.x + 10} y={n.y + 67} className="fd-sub">
                  {n.sub}
                </text>
              )}
              {c && (
                <text x={n.x + 10} y={n.y + 82} className="fd-count" data-count={n.id}>
                  {fmt(c.start)} {c.unit}
                </text>
              )}
            </>
          ) : (
            <>
              {g && <Icon g={g} x={n.x + (pill ? 12 : narrow ? 8 : 9)} y={n.y + h / 2 - (narrow ? 8 : 10)} size={narrow ? 16 : 20} />}
              <text x={n.x + (g ? (pill ? 40 : narrow ? 30 : 37) : 12)} y={n.sub || (pill && c) ? n.y + h / 2 - 2 : n.y + h / 2 + 4.5} className="fd-label">
                {n.label}
              </text>
              {n.sub && (
                <text x={n.x + (g ? (pill ? 40 : narrow ? 30 : 37) : 12)} y={n.y + h / 2 + 13} className="fd-sub">
                  {n.sub}
                </text>
              )}
              {c && pill && (
                <text x={n.x + 40} y={n.y + h / 2 + 12} className="fd-count" data-count={n.id}>
                  {fmt(c.start)} {c.unit}
                </text>
              )}
              {c && !pill && (
                <text x={n.x + w - 8} y={n.y + 15} textAnchor="end" className="fd-count" data-count={n.id}>
                  {fmt(c.start)}
                </text>
              )}
            </>
          )}
        </>
      )}
      <Extras id={n.id} />
      {!zone && <rect x={n.x} y={n.y} width={w} height={h} rx={pill ? h / 2 : 4} className="fd-ping" data-ping={n.id} />}
      {picked && <Corners x={n.x - 5} y={n.y - 5} w={w + 10} h={h + 10} s={8} className="fd-handle" />}
    </g>
  )
}

const PARTS: Node[] = [...NODES.filter((n) => n.kind === 'zone'), ...NODES.filter((n) => n.kind !== 'zone'), ...SCREENS.map((s) => BY[s.id] as Node)]

/* The engine. One animation loop moves every packet, so trails, arrivals and counters stay in step.
   It writes to the SVG directly, not through React state, so it stays smooth. */
function useFlowEngine(
  svg: RefObject<SVGSVGElement | null>,
  layer: RefObject<SVGGElement | null>,
  active: number[],
  hiSet: Set<number> | null,
  parcel: BoardProps['parcel'],
  paused: boolean,
) {
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const parcelRef = useRef(parcel)
  parcelRef.current = parcel
  const activeKey = active.join(',')
  const hiKey = hiSet ? [...hiSet].join(',') : ''
  const parcelKey = parcel ? parcel.key : ''

  useEffect(() => {
    const root = svg.current
    const g = layer.current
    if (!root || !g) return
    g.replaceChildren()
    const NS = 'http://www.w3.org/2000/svg'
    const routes = [...root.querySelectorAll<SVGPathElement>('path[data-route]')]
    const byIndex = new Map(routes.map((p) => [Number(p.dataset.route), p]))
    const make = (cls: string, size: number) => {
      const r = document.createElementNS(NS, 'rect')
      r.setAttribute('width', String(size))
      r.setAttribute('height', String(size))
      r.setAttribute('x', String(-size / 2))
      r.setAttribute('y', String(-size / 2))
      r.setAttribute('rx', String(size / 5))
      r.setAttribute('class', cls)
      g.appendChild(r)
      return r
    }
    const TRAIL = [0.035, 0.07, 0.105]
    type Pk = { path: SVGPathElement; len: number; to: string; stream: boolean; period: number; travel: number; offset: number; last: number; head: SVGRectElement; tail: SVGRectElement[] }
    const packets: Pk[] = []
    for (const i of active) {
      const a = ARROWS[i]
      const path = byIndex.get(i)
      if (!path || !a.dot) continue
      const len = path.getTotalLength()
      const stream = a.dot < 2
      const hi = !hiSet || hiSet.has(i)
      const cls = hi && hiSet ? 'fd-pk hi' : 'fd-pk'
      const n = stream ? 3 : 3
      const travel = len / (stream ? 150 : 190)
      const period = stream ? Math.max(travel, 1.2) : a.dot * 1.5
      for (let k = 0; k < n; k++) {
        const offset = stream ? (period / n) * k + i * 0.37 : k * 0.16 + i * 0.53
        packets.push({ path, len, to: a.to, stream, period, travel, offset, last: -1, head: make(cls, 6), tail: TRAIL.map(() => make(cls + ' trail', 6)) })
      }
    }
    // Option A: one large packet that makes a single trip, then waits at the end.
    let big: { path: SVGPathElement; len: number; to: string; head: SVGRectElement; tail: SVGRectElement[]; t0: number; done: boolean } | null = null
    const p = parcelRef.current
    if (p) {
      const path = byIndex.get(p.i)
      if (path) big = { path, len: path.getTotalLength(), to: ARROWS[p.i].to, head: make('fd-parcel', 13), tail: TRAIL.map(() => make('fd-parcel trail', 13)), t0: -1, done: false }
    }
    const counts: Record<string, number> = Object.fromEntries(Object.entries(COUNT).map(([k, v]) => [k, v.start]))
    const countEls = new Map([...root.querySelectorAll<SVGTextElement>('[data-count]')].map((e) => [e.dataset.count!, e]))
    const pingEls = new Map([...root.querySelectorAll<SVGRectElement>('[data-ping]')].map((e) => [e.dataset.ping!, e]))
    const lastPing: Record<string, number> = {}
    const arrive = (id: string, clock: number, strong = false) => {
      const el = pingEls.get(id)
      if (el && (strong || !lastPing[id] || clock - lastPing[id] > 0.7)) {
        lastPing[id] = clock
        el.classList.remove('on', 'strong')
        void el.getBBox()
        el.classList.add('on')
        if (strong) el.classList.add('strong')
        const part = el.closest('.fd-part')
        part?.classList.remove('got')
        void el.getBBox()
        part?.classList.add('got')
      }
      const c = COUNT[id]
      const t = countEls.get(id)
      if (c && t) {
        counts[id] += c.per[0] + Math.random() * (c.per[1] - c.per[0])
        t.textContent = t.getAttribute('text-anchor') === 'end' ? fmt(counts[id]) : `${fmt(counts[id])} ${c.unit}`
      }
    }
    const place = (el: SVGRectElement, path: SVGPathElement, len: number, f: number) => {
      if (f < 0 || f > 1) {
        el.style.opacity = '0'
        return
      }
      const pt = path.getPointAtLength(f * len)
      el.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`)
      el.style.opacity = ''
    }
    // CI/CD: a change walks through the steps, one at a time. Each step runs, then shows a tick.
    const ciEls = [...root.querySelectorAll<SVGGElement>('[data-ci]')]
    let ciShown = -2
    const ci = (clock: number) => {
      const per = 1.1
      const cycle = ciEls.length * per + 2.4
      const k = Math.floor((clock % cycle) / per) // 0..n-1 running; n and more: all done, then start again
      if (k === ciShown) return
      ciShown = k
      ciEls.forEach((e, i) => {
        e.classList.toggle('run', i === k)
        e.classList.toggle('done', i < k)
      })
    }
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

    if (still) {
      // No motion: show each packet once, half way along its line.
      for (const pk of packets) {
        place(pk.head, pk.path, pk.len, pk.offset === packets.find((q) => q.path === pk.path)!.offset ? 0.5 : -1)
        pk.tail.forEach((t) => (t.style.opacity = '0'))
      }
      if (big) {
        place(big.head, big.path, big.len, 1)
        big.tail.forEach((t) => (t.style.opacity = '0'))
        parcelRef.current?.onArrive()
      }
      ciEls.forEach((e) => e.classList.add('done'))
      return () => g.replaceChildren()
    }

    let clock = 0
    let prev = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      if (!pausedRef.current) clock += dt
      ci(clock)
      for (const pk of packets) {
        const local = (clock + pk.offset) % pk.period
        const cycle = Math.floor((clock + pk.offset) / pk.period)
        const raw = local / pk.travel
        const f = pk.stream ? raw : ease(Math.min(raw, 1.0001))
        place(pk.head, pk.path, pk.len, raw <= 1 ? f : -1)
        pk.tail.forEach((t, j) => place(t, pk.path, pk.len, raw <= 1 + TRAIL[j] * 3 ? Math.min(1, raw - TRAIL[j] * 3) : -1))
        if (raw >= 1 && pk.last !== cycle) {
          pk.last = cycle
          arrive(pk.to, clock)
        }
      }
      if (big) {
        if (big.t0 < 0) big.t0 = clock
        const raw = Math.min(1, (clock - big.t0) / 1.0)
        place(big.head, big.path, big.len, ease(raw))
        big.tail.forEach((t, j) => place(t, big!.path, big!.len, raw >= 1 ? -1 : Math.max(0, ease(raw) - TRAIL[j] * 1.2)))
        if (raw >= 1 && !big.done) {
          big.done = true
          arrive(big.to, clock, true)
          parcelRef.current?.onArrive()
        }
      }
      raf = requestAnimationFrame(frame)
    }
    // Draw frames only while the drawing is on screen. Off screen, the clock stops and nothing is drawn.
    const run = (on: boolean) => {
      cancelAnimationFrame(raf)
      raf = 0
      if (!on) return
      prev = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const io = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([e]) => run(e.isIntersecting))
    run(true)
    io?.observe(root)
    return () => {
      io?.disconnect()
      cancelAnimationFrame(raf)
      g.replaceChildren()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, hiKey, parcelKey])
}

function Board({ lit = null, litArrows, flows = 'all', picked = null, onPick, onHover, viewBox, label, children, under, notesOn, parcel }: BoardProps) {
  const { paused } = useContext(Motion)
  const svg = useRef<SVGSVGElement>(null)
  const layer = useRef<SVGGElement>(null)
  const focus = !!(lit || litArrows)
  const arrowOn = (a: Flow, i: number) => (litArrows ? litArrows.has(i) : !lit || (lit.has(a.from) && lit.has(a.to)))
  const active = flows === 'none' ? [] : ARROWS.map((_, i) => i).filter((i) => (flows === 'all' ? true : flows.has(i)))
  const hiSet = focus ? new Set(ARROWS.map((a, i) => i).filter((i) => arrowOn(ARROWS[i], i))) : null
  useFlowEngine(svg, layer, active, hiSet, parcel, paused)
  return (
    <svg viewBox={viewBox ?? `0 0 ${W} ${HGT}`} role="group" aria-label={label} className="mk-svg fd" ref={svg}>
      <defs>
        <pattern id="fd-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" className="fd-grid-dot" />
        </pattern>
        <marker id="fd-head" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1.5 1.5 8.5 5 1.5 8.5" className="fd-head" />
        </marker>
        <marker id="fd-head-hi" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1.5 1.5 8.5 5 1.5 8.5" className="fd-head hi" />
        </marker>
      </defs>
      <rect x="-2000" y="-2000" width="5200" height="4700" fill="url(#fd-grid)" />
      {under}
      {PARTS.filter((n) => n.kind === 'zone').map((n) => (
        <Part key={n.id} n={n} on={!lit || lit.has(n.id)} hi={!!lit && lit.has(n.id)} picked={picked === n.id} pick={onPick} hover={onHover} />
      ))}
      <g>
        {ARROWS.map((a, i) => {
          const on = arrowOn(a, i)
          const hi = focus && on
          return (
            <path
              key={i}
              data-route={i}
              className={`fd-line ${on ? '' : 'off'} ${hi ? 'hi' : ''} ${a.dash ? 'control' : ''}`}
              d={ROUTES_D[i].d}
              markerEnd={`url(#${hi ? 'fd-head-hi' : 'fd-head'})`}
            />
          )
        })}
      </g>
      {PARTS.filter((n) => n.kind !== 'zone').map((n) => (
        <Part key={n.id} n={n} on={!lit || lit.has(n.id)} hi={!!lit && lit.has(n.id)} picked={picked === n.id} pick={onPick} hover={onHover} />
      ))}
      <g ref={layer} className="fd-packets" aria-hidden="true" />
      <g className={`mk-notes ${lit && !notesOn ? 'off' : ''}`}>
        {NOTES.map((n) => (
          <text key={n.text} x={n.x} y={n.y} className="fd-note">
            {n.text}
          </text>
        ))}
      </g>
      {children}
    </svg>
  )
}

const arrowIndex = (from: string, to: string) => ARROWS.findIndex((a) => a.from === from && a.to === to)

/* ---------- Option A: follow one piece of data ---------- */

type Hop = { from: string; to: string; text: string }
type Route = { id: string; name: string; pace: string; hops: Hop[]; lessons: string[] }

const ROUTES: Route[] = [
  {
    id: 'search',
    name: 'A seat search',
    pace: 'arrives in seconds',

    hops: [
      { from: 'ev', to: 'kafka', text: 'A customer searches for a flight. The app sends the search to Kafka as an event.' },
      { from: 'kafka', to: 'flink', text: 'Flink reads the stream. It counts searches for each flight over the last 5 minutes.' },
      { from: 'flink', to: 'rt', text: 'Flink writes each new count to a fast live store.' },
      { from: 'rt', to: 'uops', text: 'The control room sees demand change within seconds, and can move prices.' },
    ],
    lessons: ['streaming-basics', 'message-brokers', 'windows-and-time', 'stream-engines'],
  },
  {
    id: 'booking',
    name: 'A booking',
    pace: 'becomes revenue each hour',

    hops: [
      { from: 'book', to: 'cdc', text: 'A booking is saved in the Postgres database. Debezium reads the database change log, so the app does not slow down.' },
      { from: 'cdc', to: 'kafka', text: 'Each change goes onto Kafka, in order.' },
      { from: 'kafka', to: 'bronze', text: 'The raw changes land in bronze. Nothing is changed, so you can always replay them.' },
      { from: 'bronze', to: 'silver', text: 'Spark removes duplicates and keeps the current state of each booking. A test must pass first.' },
      { from: 'silver', to: 'gold', text: 'dbt builds the facts and dimensions: one row for each seat sold.' },
      { from: 'gold', to: 'mrev', text: 'The revenue mart adds up seats and money for each day and route.' },
      { from: 'mrev', to: 'urev', text: 'The pricing team sees seats sold, at most one hour old.' },
    ],
    lessons: ['cdc', 'warehouse-lake-lakehouse', 'architecture-patterns', 'transformation-dbt', 'dimensional-modeling'],
  },
  {
    id: 'bad',
    name: 'A bad payment file',
    pace: 'is stopped before gold',

    hops: [
      { from: 'pay', to: 'load', text: 'The payment provider sends a file. By mistake, it has some payments twice.' },
      { from: 'load', to: 'bronze', text: 'The file lands in bronze as it is. Bronze keeps what arrived, good or bad.' },
      { from: 'dq', to: 'gold', text: 'The "keys unique" test fails, so the run stops. Gold is not updated.' },
      { from: 'gold', to: 'mfin', text: 'Finance still sees yesterday’s correct numbers. The on-call engineer gets an alert.' },
    ],
    lessons: ['data-quality', 'idempotency', 'observability-lineage', 'incidents-reliability'],
  },
]

function Journeys() {
  const { paused } = useContext(Motion)
  const [rid, setRid] = useState('all') // 'all' = the whole system, every line moving; 'stages' = the five stages
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(true)
  const [arrived, setArrived] = useState(false)
  const [frame, seen] = useInView<HTMLDivElement>()
  const route = ROUTES.find((r) => r.id === rid) ?? null
  const hops = route?.hops ?? []
  const hop = hops[step]
  const lit = useMemo(() => (route ? new Set(route.hops.flatMap((h) => [h.from, h.to]).concat(route.id === 'search' ? [] : ['lh'])) : null), [route])
  const arrows = useMemo(() => (route ? new Set(route.hops.map((h) => arrowIndex(h.from, h.to)).filter((i) => i >= 0)) : null), [route])
  const now = hop ? arrowIndex(hop.from, hop.to) : -1
  const last = hops.length - 1
  const playing = auto && !paused && !still && seen

  // Each hop: the packet travels for about a second ("Running"). The engine reports when it arrives, and the row turns "Done".
  useEffect(() => setArrived(false), [rid, step])

  // Like a live status feed: when the frame is on screen, the journey plays by itself and starts again at the end.
  useEffect(() => {
    if (!route || !playing || !arrived) return
    const t = setTimeout(() => setStep((s) => (s === last ? 0 : s + 1)), step === last ? 3200 : 1500)
    return () => clearTimeout(t)
  }, [route, playing, arrived, step, last])

  const pick = (id: string) => {
    setRid(id)
    setStep(0)
    setAuto(true)
  }
  const goto = (i: number) => {
    setAuto(false)
    setStep(Math.max(0, Math.min(last, i)))
  }
  const status = (i: number) => (i < step ? 'done' : i > step ? 'queued' : arrived ? 'done' : 'running')
  const label = { done: 'Done', running: 'Running', queued: 'Queued' }
  return (
    <Frame
      className={`mk-follow ${rid === 'stages' ? 'is-stages' : ''}`}
      refEl={frame}
      top={
        <div className="mk-routes" role="tablist" aria-label="Show the whole system, or follow one journey">
          <button role="tab" aria-selected={rid === 'all'} onClick={() => pick('all')}>
            <b>Whole system</b>
          </button>
          <button role="tab" aria-selected={rid === 'stages'} onClick={() => pick('stages')}>
            <b>Five stages</b>
          </button>
          {ROUTES.map((r) => (
            <button key={r.id} role="tab" aria-selected={r.id === rid} onClick={() => pick(r.id)}>
              <b>{r.name}</b> {r.pace}
            </button>
          ))}
        </div>
      }
    >
      <div className="wb-board mk-board">
        <Board
          lit={lit}
          litArrows={arrows}
          flows={arrows ?? 'all'}
          label={route ? `${route.name} ${route.pace}` : 'The whole airline data platform, with data moving on every line'}
          parcel={now >= 0 ? { i: now, key: `${rid}-${step}`, onArrive: () => setArrived(true) } : null}
        >
          {rid === 'stages' && (
            <g className="fd-stages" aria-hidden="true">
              {STAGES.map((st, i) => (
                <g key={st.name}>
                  <rect x={st.x} y={st.y} width={st.w} height={st.h} rx="2" className="fd-stage-line" />
                  <Corners x={st.x} y={st.y} w={st.w} h={st.h} s={9} className="fd-handle" />
                  <rect x={st.x + 6} y={st.y + 6} width={st.name.length * 7.6 + 30} height="24" rx="3" className="fd-stage-tab" />
                  <text x={st.x + 15} y={st.y + 22.5} className="fd-stage-tabtext">
                    {i + 1}. {st.name}
                  </text>
                </g>
              ))}
            </g>
          )}
        </Board>
      </div>
      {/* One bar under the drawing: a key for the whole system, or the current step of a journey. */}
      {rid === 'stages' ? (
        <div className="mk-foot mk-foot-stages">
          <span>Data is created, taken in, stored and changed, then served. Four kinds of work run under all of it. Start a stage:</span>
          <ol>
            {STAGES.map((st) => (
              <li key={st.name}>
                <Link to={`/lesson/${st.to}`}>{st.name}</Link>
              </li>
            ))}
          </ol>
        </div>
      ) : !route ? (
        <div className="mk-foot">
          <span className="mk-key">
            <i className="lg-stream" aria-hidden="true" /> Stream: data in seconds
          </span>
          <span className="mk-key">
            <i className="lg-batch" aria-hidden="true" /> Batch: data each hour
          </span>
          <span className="mk-key">
            <i className="lg-control" aria-hidden="true" /> Control: starts or stops work
          </span>
          <span className="mk-key">
            <i className="lg-ping" aria-hidden="true" /> A part flashes when data arrives
          </span>
        </div>
      ) : (
        <div className="mk-foot mk-foot-step" aria-live="polite">
          <span className={`mk-chip ${status(step)}`}>{label[status(step)]}</span>
          <p>
            <b>
              Step {step + 1} of {hops.length}: {nameOf(hop.from)} <span aria-hidden="true">›</span> {nameOf(hop.to)}.
            </b>{' '}
            {hop.text}
          </p>
          <div className="mk-foot-nav">
            <button className="btn" onClick={() => goto(step - 1)} disabled={step === 0}>
              Back
            </button>
            <button className="btn" onClick={() => setAuto(!auto)} aria-pressed={auto}>
              {auto ? 'Stop playing' : 'Play'}
            </button>
            <button className="btn primary" onClick={() => goto(step + 1)} disabled={step === last}>
              Next step
            </button>
          </div>
          {step === last && arrived && (
            <p className="mk-foot-learn">
              Lessons for this journey:{' '}
              {route.lessons.map((id, k) => (
                <span key={id}>
                  {k > 0 && ', '}
                  <Link to={`/lesson/${id}`}>{TITLE[id] ?? id}</Link>
                </span>
              ))}
            </p>
          )}
        </div>
      )}
    </Frame>
  )
}

const nameOf = (id: string) => (SCREENS.find((s) => s.id === id)?.title ?? BY[id]?.label ?? id) as string

/** The whole system, animated, with tabs to follow one journey or see the five stages. */
export default function SystemDrawing() {
  const [paused, setPaused] = useState(false)
  const motion = useMemo(() => ({ paused, toggle: () => setPaused((p) => !p) }), [paused])
  return (
    <Motion.Provider value={motion}>
      <div className={`sd ${paused ? 'sd-paused' : ''}`}>
        <Journeys />
      </div>
    </Motion.Provider>
  )
}
