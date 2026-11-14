import { useEffect, useMemo, useRef, useState } from 'react'
import type { SysPart, SystemPlan } from '../../data/systems/types'
import { still } from '../../lib/motion'
import { Corners, Icon, routeNodes } from './SystemDrawing'
import './system.css'
import './plan-system.css'

/* The drawing at the top of a planned subject. It has the look of the data engineering drawing: one ink colour on
   a dot grid, tiles with small icons, and square packets that move on the lines. A part flashes when a packet
   arrives. Point at a part to see the planned lessons that teach it. */

const fmt = (n: number) => Math.round(n).toLocaleString('en-GB')
const H = (p: SysPart) => p.h ?? 54
/** routeNodes() needs the fields of a whiteboard node. */
const asNode = (p: SysPart) => ({ id: p.id, x: p.x, y: p.y, w: p.w, h: H(p), label: p.label, step: 0 })

/* ---------- drawn by hand: screens ---------- */

const TOKENS = ['Sun', 'light', ' is', ' scattered', ' by', ' the', ' air', '.', ' Blue', ' light', ' scatters', ' most', ',', ' so', ' the', ' sky', ' looks', ' blue', '.']
/** One pass through the network, in seconds. The CSS in plan-system.css uses the same time. */
const PASS = 1.2

/** Wrap text into lines of at most `n` characters, at spaces. */
function wrap(text: string, n: number) {
  const lines: string[] = []
  let line = ''
  for (const w of text.split(' ')) {
    const next = line ? `${line} ${w}` : w
    if (next.length > n && line) {
      lines.push(line)
      line = w
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

function ChatScreen({ p, paused }: { p: SysPart; paused: boolean }) {
  const [n, setN] = useState(still ? TOKENS.length : 0)
  useEffect(() => {
    if (still || paused) return
    // One token for each pass. At the end, wait for three passes and start again.
    const id = window.setInterval(() => setN((k) => (k >= TOKENS.length + 3 ? 0 : k + 1)), PASS * 1000)
    return () => clearInterval(id)
  }, [paused])
  const { x, y, w } = p
  const h = H(p)
  const lines = wrap(TOKENS.slice(0, Math.min(n, TOKENS.length)).join(''), 24)
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="4" className="fd-tile" />
      <path d={`M${x} ${y + 24}h${w}`} className="fd-rule" />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={x + 10 + k * 7} cy={y + 12} r="2" className="fd-dot" />
      ))}
      <text x={x + 31} y={y + 16} className="fd-small fd-screen-title">
        {p.label}
      </text>
      <rect x={x + 44} y={y + 34} width={w - 54} height="20" rx="4" className="ps-ask" />
      <text x={x + w - 16} y={y + 48} textAnchor="end" className="ps-chat">
        Why is the sky blue?
      </text>
      {lines.map((l, i) => (
        <text key={i} x={x + 10} y={y + 74 + i * 15} className="ps-chat">
          {l}
        </text>
      ))}
      {n < TOKENS.length && (
        <rect x={x + 10 + (lines.at(-1)?.length ?? 0) * 5.6 + 2} y={y + 64 + Math.max(0, lines.length - 1) * 15} width="6" height="12" className="ps-caret" />
      )}
    </>
  )
}

function BrowserScreen({ p }: { p: SysPart }) {
  const { x, y, w } = p
  const h = H(p)
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="4" className="fd-tile" />
      <path d={`M${x} ${y + 24}h${w}`} className="fd-rule" />
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={x + 10 + k * 7} cy={y + 12} r="2" className="fd-dot" />
      ))}
      <text x={x + 31} y={y + 16} className="fd-small fd-screen-title">
        {p.label}
      </text>
      <rect x={x + 10} y={y + 32} width="56" height="6" rx="2" className="ps-accent" />
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect x={x + 10 + k * 45} y={y + 46} width="39" height="26" rx="2" className="ps-card" />
          <rect x={x + 14 + k * 45} y={y + 76} width="26" height="4" rx="2" className="ps-bar" />
        </g>
      ))}
      <rect x={x + 100} y={y + 30} width="40" height="10" rx="2" className="ps-btn ps-new" />
    </>
  )
}

function PhoneScreen({ p }: { p: SysPart }) {
  const { x, y } = p
  const h = H(p)
  return (
    <>
      <rect x={x} y={y} width={p.w} height={h} rx="4" className="fd-tile" />
      <rect x={x + 12} y={y + 9} width="54" height={h - 18} rx="9" className="ps-phone" />
      <rect x={x + 31} y={y + 14} width="16" height="3" rx="1.5" className="ps-notch" />
      <rect x={x + 18} y={y + 24} width="28" height="5" rx="2" className="ps-accent" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={x + 18} y={y + 36 + k * 18} width="42" height="13" rx="2" className={k === 0 ? 'ps-card ps-new' : 'ps-card'} />
      ))}
      <text x={x + 76} y={y + h / 2 - 2} className="fd-label">
        {p.label}
      </text>
      {p.sub && (
        <text x={x + 76} y={y + h / 2 + 13} className="fd-sub">
          {p.sub}
        </text>
      )}
    </>
  )
}

function ChipScreen({ p }: { p: SysPart }) {
  const { x, y, w } = p
  const h = H(p)
  const cx = x + w / 2
  const s = 52 // the chip
  const top = y + 14
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="4" className="fd-tile" />
      {[0, 1, 2, 3].map((k) => (
        <path
          key={k}
          d={`M${cx - 18 + k * 12} ${top}v-6 M${cx - 18 + k * 12} ${top + s}v6 M${cx - s / 2} ${top + 8 + k * 12}h-6 M${cx + s / 2} ${top + 8 + k * 12}h6`}
          className="ps-pin"
        />
      ))}
      <rect x={cx - s / 2} y={top} width={s} height={s} rx="4" className="ps-chip" />
      {Array.from({ length: 16 }, (_, k) => (
        <rect
          key={k}
          x={cx - 20 + (k % 4) * 10.5}
          y={top + 6 + Math.floor(k / 4) * 10.5}
          width="8"
          height="8"
          rx="1"
          className="ps-cell"
          style={{ animationDelay: `${((k * 5) % 16) * -0.075}s` }}
        />
      ))}
      <text x={x + 10} y={y + h - 26} className="fd-label">
        {p.label}
      </text>
      {p.sub && (
        <text x={x + 10} y={y + h - 11} className="fd-sub">
          {p.sub}
        </text>
      )}
    </>
  )
}

function NetworkScreen({ p }: { p: SysPart }) {
  const { x, y, w } = p
  const h = H(p)
  const cols = [4, 5, 5, 3]
  const layers = cols.map((n, li) => {
    const lx = x + 18 + li * ((w - 36) / 3)
    return { x: lx, ys: Array.from({ length: n }, (_, j) => y + 14 + ((h - 56) / (n - 1)) * j + (5 - n) * 0) }
  })
  const edges = layers.slice(1).flatMap((L, li) => layers[li].ys.flatMap((py, i) => L.ys.map((ny, j) => ({ k: `${li}-${i}-${j}`, d: `M${layers[li].x} ${py}L${L.x} ${ny}`, li, lit: (i + j + li) % 3 !== 1 }))))
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="4" className="fd-tile" />
      {edges.map((e) => (
        <path key={e.k} d={e.d} className="ps-edge" />
      ))}
      {edges
        .filter((e) => e.lit)
        .map((e) => (
          <path key={`l${e.k}`} d={e.d} className="ps-edge lit" style={{ animationDelay: `${e.li * (PASS / 4)}s` }} />
        ))}
      {layers.map((L, li) =>
        L.ys.map((ny, j) => (
          <g key={`${li}-${j}`}>
            <circle cx={L.x} cy={ny} r="5" className="ps-node" />
            <circle cx={L.x} cy={ny} r="5" className="ps-node-on" style={{ animationDelay: `${li * (PASS / 4)}s`, ['--a' as string]: 0.35 + (((li * 7 + j * 13) % 10) / 10) * 0.65 }} />
          </g>
        )),
      )}
      <text x={x + 10} y={y + h - 26} className="fd-label">
        {p.label}
      </text>
      {p.sub && (
        <text x={x + 10} y={y + h - 11} className="fd-sub">
          {p.sub}
        </text>
      )}
    </>
  )
}

/* ---------- parts ---------- */

function Part({ p, hi, paused, onHover }: { p: SysPart; hi: boolean; paused: boolean; onHover: (id: string | null) => void }) {
  const h = H(p)
  const { x, y, w } = p
  const zone = p.kind === 'zone'
  const pill = p.kind === 'who'
  const tall = !zone && !pill && p.kind !== 'screen' && h >= 80
  const narrow = !pill && w <= 130
  const g = p.glyph ?? (pill ? 'person' : undefined)
  const c = p.count
  const act = {
    tabIndex: 0,
    role: 'button',
    'aria-label': p.label,
    onMouseEnter: () => onHover(p.id),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(p.id),
    onBlur: () => onHover(null),
    onClick: () => onHover(p.id),
  }
  const tx = x + (g ? (pill ? 40 : narrow ? 30 : 37) : 12)
  return (
    <g data-id={p.id} className={`mk-part fd-part can ${hi ? 'hi' : ''} ${zone ? 'zone' : ''}`} {...act}>
      {zone ? (
        <>
          <rect x={x} y={y} width={w} height={h} rx="2" className="fd-zone" />
          <Corners x={x} y={y} w={w} h={h} />
          <text x={x + 12} y={y + 20} className="fd-zone-label">
            {p.label}
          </text>
          {p.chips && <Chips p={p} />}
          {p.checks?.map(([name, ok], i) => (
            <text key={name} x={x + 12} y={y + 40 + i * 15} className={`fd-check ${ok ? 'ok' : 'bad'}`}>
              {ok ? '✓' : '✗'} {name}
            </text>
          ))}
          {p.notes?.map((t, i) => (
            <text key={t} x={x + 12} y={y + 40 + i * 15} className="fd-small">
              {t}
            </text>
          ))}
        </>
      ) : p.screen === 'browser' ? (
        <BrowserScreen p={p} />
      ) : p.screen === 'phone' ? (
        <PhoneScreen p={p} />
      ) : p.screen === 'chip' ? (
        <ChipScreen p={p} />
      ) : p.screen === 'network' ? (
        <NetworkScreen p={p} />
      ) : p.screen === 'chat' ? (
        <ChatScreen p={p} paused={paused} />
      ) : (
        <>
          <rect x={x} y={y} width={w} height={h} rx={pill ? h / 2 : 4} className="fd-tile" />
          {tall ? (
            <>
              {g && <Icon g={g} x={x + 10} y={y + 12} />}
              <text x={x + 10} y={y + 52} className="fd-label">
                {p.label}
              </text>
              {p.sub && (
                <text x={x + 10} y={y + 67} className="fd-sub">
                  {p.sub}
                </text>
              )}
            </>
          ) : (
            <>
              {g && <Icon g={g} x={x + (pill ? 12 : narrow ? 8 : 9)} y={y + h / 2 - (narrow ? 8 : 10)} size={narrow ? 16 : 20} />}
              <text x={tx} y={p.sub ? y + h / 2 - 2 : y + h / 2 + 4.5} className="fd-label">
                {p.label}
              </text>
              {p.sub && (
                <text x={tx} y={y + h / 2 + 13} className="fd-sub">
                  {p.sub}
                </text>
              )}
            </>
          )}
          {c && (
            <text x={x + w - 8} y={y + 15} textAnchor="end" className="fd-count" data-count={p.id}>
              {fmt(c.start)}
            </text>
          )}
        </>
      )}
      {!zone && <rect x={x} y={y} width={w} height={h} rx={pill ? h / 2 : 4} className="fd-ping" data-ping={p.id} />}
    </g>
  )
}

/** A row of small steps inside a zone. If the row is a cycle, the engine lights one step after the other. */
function Chips({ p }: { p: SysPart }) {
  const { names, y, cycle, gate } = p.chips!
  const gap = 12
  const cw = (p.w - 28 - (names.length - 1) * gap) / names.length
  return (
    <>
      {names.map((n, i) => {
        const cx = p.x + 14 + i * (cw + gap)
        return (
          <g key={n} className={`fd-chip ${cycle ? 'fd-ci' : ''} ${gate === i ? 'gate' : ''}`} data-ci={cycle ? `${p.id}:${i}` : undefined}>
            <rect x={cx} y={y} width={cw} height="30" rx="3" />
            {i < names.length - 1 && <path d={`M${cx + cw} ${y + 15}h${gap}`} className="fd-chip-link" />}
            <text x={cx + cw / 2} y={y + 19.5} textAnchor="middle">
              {n}
            </text>
            {cycle && (
              <>
                <circle cx={cx + cw - 8} cy={y + 7.5} r="3" className="fd-ci-run" />
                <path d={`M${cx + cw - 12} ${y + 7.5} l2.5 2.5 l4.5 -5`} className="fd-ci-ok" />
              </>
            )}
          </g>
        )
      })}
    </>
  )
}

/* ---------- the engine: one animation loop moves every packet ---------- */

function useEngine(svg: React.RefObject<SVGSVGElement | null>, layer: React.RefObject<SVGGElement | null>, sys: SystemPlan, paused: boolean) {
  const pausedRef = useRef(paused)
  pausedRef.current = paused
  useEffect(() => {
    const root = svg.current
    const g = layer.current
    if (!root || !g) return
    g.replaceChildren()
    const NS = 'http://www.w3.org/2000/svg'
    const make = (cls: string) => {
      const r = document.createElementNS(NS, 'rect')
      for (const [k, v] of Object.entries({ width: 6, height: 6, x: -3, y: -3, rx: 1.2 })) r.setAttribute(k, String(v))
      r.setAttribute('class', cls)
      g.appendChild(r)
      return r
    }
    const TRAIL = [0.035, 0.07, 0.105]
    const paths = new Map([...root.querySelectorAll<SVGPathElement>('path[data-flow]')].map((p) => [Number(p.dataset.flow), p]))
    type Pk = { path: SVGPathElement; len: number; to: string; stream: boolean; period: number; travel: number; offset: number; last: number; head: SVGRectElement; tail: SVGRectElement[] }
    const packets: Pk[] = []
    sys.flows.forEach((f, i) => {
      const path = paths.get(i)
      if (!path || !f.dot) return
      const len = path.getTotalLength()
      const stream = f.dot < 2
      const travel = len / (stream ? 150 : 190)
      const period = stream ? Math.max(travel, 1.2) : f.dot * 1.5
      for (let k = 0; k < 3; k++) {
        const offset = stream ? (period / 3) * k + i * 0.37 : k * 0.16 + i * 0.53
        packets.push({ path, len, to: f.to, stream, period, travel, offset, last: -1, head: make('fd-pk'), tail: TRAIL.map(() => make('fd-pk trail')) })
      }
    })
    const byId = Object.fromEntries(sys.parts.map((p) => [p.id, p]))
    const counts: Record<string, number> = Object.fromEntries(sys.parts.filter((p) => p.count).map((p) => [p.id, p.count!.start]))
    const countEls = new Map([...root.querySelectorAll<SVGTextElement>('[data-count]')].map((e) => [e.dataset.count!, e]))
    const pingEls = new Map([...root.querySelectorAll<SVGRectElement>('[data-ping]')].map((e) => [e.dataset.ping!, e]))
    const lastPing: Record<string, number> = {}
    const arrive = (id: string, clock: number) => {
      const el = pingEls.get(id)
      if (el && (!lastPing[id] || clock - lastPing[id] > 0.7)) {
        lastPing[id] = clock
        el.classList.remove('on')
        void el.getBBox()
        el.classList.add('on')
        const part = el.closest('.fd-part')
        part?.classList.remove('got')
        void el.getBBox()
        part?.classList.add('got')
      }
      const c = byId[id]?.count
      const t = countEls.get(id)
      if (c && t) {
        counts[id] += c.per[0] + Math.random() * (c.per[1] - c.per[0])
        t.textContent = fmt(counts[id])
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
    // Rows of steps that run in order, like a CI/CD pipeline: each step runs, then shows a tick.
    const rows = new Map<string, SVGGElement[]>()
    for (const e of root.querySelectorAll<SVGGElement>('[data-ci]')) {
      const [id] = e.dataset.ci!.split(':')
      rows.set(id, [...(rows.get(id) ?? []), e])
    }
    const shown = new Map<string, number>()
    const steps = (clock: number) =>
      rows.forEach((els, id) => {
        const per = 1.1
        const cycle = els.length * per + 2.4
        const k = Math.floor((clock % cycle) / per)
        if (shown.get(id) === k) return
        shown.set(id, k)
        els.forEach((e, i) => {
          e.classList.toggle('run', i === k)
          e.classList.toggle('done', i < k)
        })
      })
    const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)

    if (still) {
      // No motion: one packet half way along each line, and every step done.
      const seen = new Set<SVGPathElement>()
      for (const pk of packets) {
        place(pk.head, pk.path, pk.len, seen.has(pk.path) ? -1 : 0.5)
        seen.add(pk.path)
        pk.tail.forEach((t) => (t.style.opacity = '0'))
      }
      rows.forEach((els) => els.forEach((e) => e.classList.add('done')))
      return () => g.replaceChildren()
    }

    let clock = 0
    let prev = performance.now()
    let raf = 0
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now
      if (!pausedRef.current) clock += dt
      steps(clock)
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
      raf = requestAnimationFrame(frame)
    }
    // Draw frames only while the drawing is on screen.
    const run = (on: boolean) => {
      cancelAnimationFrame(raf)
      raf = 0
      if (!on) return
      prev = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([e]) => run(e.isIntersecting)) : null
    if (io) io.observe(root)
    else run(true)
    return () => {
      io?.disconnect()
      cancelAnimationFrame(raf)
      g.replaceChildren()
    }
  }, [svg, layer, sys])
}

/** A whole system for a planned subject, drawn and moving. `titles` gives the title of each planned lesson. */
export default function PlanSystem({ sys, titles }: { sys: SystemPlan; titles: Record<string, string> }) {
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const layer = useRef<SVGGElement>(null)
  useEngine(svg, layer, sys, paused)
  const byId = useMemo(() => Object.fromEntries(sys.parts.map((p) => [p.id, p])), [sys])
  const routes = useMemo(() => sys.flows.map((f) => routeNodes(asNode(byId[f.from]), asNode(byId[f.to])).d), [sys, byId])
  const shown = hover ? byId[hover] : null
  const hint = shown ? `${shown.lessons.length} ${shown.lessons.length === 1 ? 'lesson' : 'lessons'}: ${shown.lessons.map((id) => titles[id] ?? id).join(', ')}.` : undefined
  const zones = sys.parts.filter((p) => p.kind === 'zone')
  const rest = sys.parts.filter((p) => p.kind !== 'zone')

  return (
    <div className={`sd ps ${paused ? 'sd-paused' : ''}`}>
      <div className="mk mk-frame">
        <i className="mk-c tl" aria-hidden="true" />
        <i className="mk-c tr" aria-hidden="true" />
        <i className="mk-c bl" aria-hidden="true" />
        <i className="mk-c br" aria-hidden="true" />
        <div className="mk-top">
          <p className="mk-top-main ps-hint" title={hint}>
            {shown ? (
              <>
                <b>{shown.label}.</b> {hint}
              </>
            ) : (
              <>Point at a part to see the lessons that teach it.</>
            )}
          </p>
          {!still && (
            <button className="mk-pause" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? 'Play motion' : 'Pause motion'} title={paused ? 'Play motion' : 'Pause motion'}>
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                {paused ? <path d="M3 1.5v9l7-4.5z" fill="currentColor" /> : <path d="M3 1.5v9M9 1.5v9" stroke="currentColor" strokeWidth="2.2" />}
              </svg>
            </button>
          )}
        </div>
        <div className="wb-board mk-board">
          <svg viewBox={`0 0 ${sys.W} ${sys.H}`} role="group" aria-label={`${sys.title}: ${sys.lead}`} className="mk-svg fd" ref={svg}>
            <defs>
              <pattern id="ps-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="0.9" className="fd-grid-dot" />
              </pattern>
              <marker id="ps-head" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M1.5 1.5 8.5 5 1.5 8.5" className="fd-head" />
              </marker>
            </defs>
            <rect x="-2000" y="-2000" width="5200" height="4700" fill="url(#ps-grid)" />
            {zones.map((p) => (
              <Part key={p.id} p={p} hi={hover === p.id} paused={paused} onHover={setHover} />
            ))}
            {sys.flows.map((f, i) => (
              <path key={i} data-flow={i} d={routes[i]} className={`fd-line ${f.control ? 'control' : ''}`} markerEnd="url(#ps-head)" />
            ))}
            {rest.map((p) => (
              <Part key={p.id} p={p} hi={hover === p.id} paused={paused} onHover={setHover} />
            ))}
            <g ref={layer} className="fd-packets" aria-hidden="true" />
            {sys.labels.map((l) => (
              <text key={l.text} x={l.x} y={l.y} className="fd-note">
                {l.text}
              </text>
            ))}
          </svg>
        </div>
        <div className="mk-foot">
          <span className="mk-key">
            <i className="lg-stream" /> Steady stream
          </span>
          <span className="mk-key">
            <i className="lg-batch" /> Now and then
          </span>
          <span className="mk-key">
            <i className="lg-control" /> Controls or checks
          </span>
          <span className="mk-key">
            <i className="lg-ping" /> A part flashes when data arrives
          </span>
        </div>
      </div>
    </div>
  )
}
