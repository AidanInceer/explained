import { useState } from 'react'
import { C, Seg, Slider, calm, fx, scale, useTicker } from '../kit'

const rad = (d: number) => (d * Math.PI) / 180

/** Two arrows, the projection of one on the other, and the dot product and cosine. */
export function AiDot() {
  const [ta, setTa] = useState(20)
  const [tb, setTb] = useState(70)
  const [la, setLa] = useState(2.5)
  const [lb, setLb] = useState(2)
  const a = [la * Math.cos(rad(ta)), la * Math.sin(rad(ta))]
  const b = [lb * Math.cos(rad(tb)), lb * Math.sin(rad(tb))]
  const dot = a[0] * b[0] + a[1] * b[1]
  const cos = dot / (la * lb)
  const proj = dot / (la * la) // b projected on a, as a multiple of a
  const U = 46
  const X = (v: number) => 160 + v * U
  const Y = (v: number) => 160 - v * U
  let angle = Math.abs(tb - ta) % 360
  if (angle > 180) angle = 360 - angle
  const say =
    Math.abs(cos) < 0.02
      ? 'The arrows are at right angles. The dot product is 0: the two vectors share nothing.'
      : cos > 0
        ? 'The arrows point the same general way, so the dot product is positive.'
        : 'The arrows point in opposite general directions, so the dot product is negative.'
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Direction of a" value={ta} min={0} max={359} onChange={setTa} show={(v) => `${v}°`} />
        <Slider label="Length of a" value={la} min={0.5} max={3} step={0.1} onChange={setLa} show={(v) => fx(v, 1)} />
        <Slider label="Direction of b" value={tb} min={0} max={359} onChange={setTb} show={(v) => `${v}°`} />
        <Slider label="Length of b" value={lb} min={0.5} max={3} step={0.1} onChange={setLb} show={(v) => fx(v, 1)} />
      </div>
      <div className="kx-two">
        <svg viewBox="0 0 320 320" role="img" aria-label={`Vector a is (${fx(a[0], 1)}, ${fx(a[1], 1)}) and vector b is (${fx(b[0], 1)}, ${fx(b[1], 1)}). Their dot product is ${fx(dot)}.`}>
          <defs>
            <marker id="ai-dot-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>
          {[-3, -2, -1, 1, 2, 3].map((k) => (
            <g key={k}>
              <line className="grid" x1={X(k)} x2={X(k)} y1={0} y2={320} />
              <line className="grid" y1={Y(k)} y2={Y(k)} x1={0} x2={320} />
            </g>
          ))}
          <line className="ax" x1={0} x2={320} y1={160} y2={160} />
          <line className="ax" y1={0} y2={320} x1={160} x2={160} />
          {/* the line through a, and the projection of b on it */}
          <line x1={X(-a[0] * 3)} y1={Y(-a[1] * 3)} x2={X(a[0] * 3)} y2={Y(a[1] * 3)} stroke={C.blue} strokeOpacity={0.18} strokeWidth={1} />
          <line x1={X(b[0])} y1={Y(b[1])} x2={X(a[0] * proj)} y2={Y(a[1] * proj)} stroke={C.grey} strokeDasharray="4 4" />
          <line x1={X(0)} y1={Y(0)} x2={X(a[0] * proj)} y2={Y(a[1] * proj)} stroke={C.teal} strokeWidth={7} strokeOpacity={0.35} strokeLinecap="round" />
          <line x1={X(0)} y1={Y(0)} x2={X(a[0])} y2={Y(a[1])} stroke={C.blue} strokeWidth={3} markerEnd="url(#ai-dot-h)" />
          <line x1={X(0)} y1={Y(0)} x2={X(b[0])} y2={Y(b[1])} stroke={C.amber} strokeWidth={3} markerEnd="url(#ai-dot-h)" />
          <text className="b" x={X(a[0] * 1.12)} y={Y(a[1] * 1.12)} style={{ fill: C.blue }} textAnchor="middle" dominantBaseline="middle">
            a
          </text>
          <text className="b" x={X(b[0] * 1.14)} y={Y(b[1] * 1.14)} style={{ fill: C.amber }} textAnchor="middle" dominantBaseline="middle">
            b
          </text>
        </svg>
        <div>
          <p className="kx-mono" style={{ margin: '0 0 8px' }}>
            a = ({fx(a[0])}, {fx(a[1])})<br />b = ({fx(b[0])}, {fx(b[1])})
          </p>
          <p className="kx-mono" style={{ margin: '0 0 8px' }}>
            a · b = {fx(a[0])}×{fx(b[0])} + {fx(a[1])}×{fx(b[1])}
            <br />= <b>{fx(dot)}</b>
          </p>
          <div className="kx-kpis">
            <div className="hl">
              <small>Dot product</small>
              <b>{fx(dot)}</b>
            </div>
            <div>
              <small>Cosine</small>
              <b>{fx(cos)}</b>
            </div>
            <div>
              <small>Angle</small>
              <b>{Math.round(angle)}°</b>
            </div>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '10px 0 0' }}>
            The green band is the shadow of b on the line of a. Dot product = length of a × signed length of that shadow.
          </p>
        </div>
      </div>
      <p className="stat">{say} Change only the lengths: the cosine stays the same, because it measures direction only.</p>
    </div>
  )
}

const PRESETS: [string, number[]][] = [
  ['Identity', [1, 0, 0, 1]],
  ['Stretch', [2, 0, 0, 0.5]],
  ['Rotate 30°', [0.87, -0.5, 0.5, 0.87]],
  ['Shear', [1, 1, 0, 1]],
  ['Flip', [-1, 0, 0, 1]],
  ['Squash flat', [1, 2, 0.5, 1]],
]

/** A 2 × 2 matrix moves every point of the plane. The letter F shows stretch, turn and flip. */
export function AiMatrix() {
  const [m, setM] = useState([1, 1, 0, 1])
  const [a, b, c, d] = m
  const set = (k: number) => (v: number) => setM(m.map((x, i) => (i === k ? v : x)))
  const T = (x: number, y: number) => [a * x + b * y, c * x + d * y]
  const U = 32
  const X = (v: number) => 180 + v * U
  const Y = (v: number) => 160 - v * U
  const P = (x: number, y: number) => {
    const [u, v] = T(x, y)
    return `${X(u)},${Y(v)}`
  }
  const det = a * d - b * c
  const F = [
    [0, 0], [0.4, 0], [0.4, 1], [0.9, 1], [0.9, 1.35], [0.4, 1.35], [0.4, 1.65], [1.1, 1.65], [1.1, 2], [0, 2],
  ]
  const lines = []
  for (let k = -5; k <= 5; k++) {
    lines.push(<polyline key={`v${k}`} points={`${P(k, -5)} ${P(k, 5)}`} className="grid" style={{ stroke: '#c9d3e8' }} />)
    lines.push(<polyline key={`h${k}`} points={`${P(-5, k)} ${P(5, k)}`} className="grid" style={{ stroke: '#c9d3e8' }} />)
  }
  const say =
    Math.abs(det) < 0.02
      ? 'The determinant is 0. The matrix squashes the whole plane onto a line, and the move cannot be undone.'
      : det < 0
        ? `The determinant is ${fx(det)}. It is negative, so the plane is flipped: the F is now a mirror image. Areas are multiplied by ${fx(Math.abs(det))}.`
        : `The determinant is ${fx(det)}: every area is multiplied by this number.`
  return (
    <div className="kx">
      <div className="kx-row">
        {PRESETS.map(([n, v]) => (
          <button key={n} className="act ghost" onClick={() => setM(v)}>
            {n}
          </button>
        ))}
      </div>
      <div className="kx-two">
        <svg viewBox="0 0 360 320" role="img" aria-label={`The plane after the matrix [[${a}, ${b}], [${c}, ${d}]]. Determinant ${fx(det)}.`}>
          <clipPath id="ai-mx-c">
            <rect width="360" height="320" />
          </clipPath>
          <g clipPath="url(#ai-mx-c)">
            {lines}
            <line className="ax" x1={0} x2={360} y1={Y(0)} y2={Y(0)} strokeOpacity={0.4} />
            <line className="ax" y1={0} y2={320} x1={X(0)} x2={X(0)} strokeOpacity={0.4} />
            <polygon points={`${P(0, 0)} ${P(1, 0)} ${P(1, 1)} ${P(0, 1)}`} fill={C.blue} fillOpacity={0.12} stroke={C.blue} strokeOpacity={0.4} />
            <polygon points={F.map(([x, y]) => P(x, y)).join(' ')} fill={C.amber} fillOpacity={0.85} />
            <line x1={X(0)} y1={Y(0)} x2={X(a)} y2={Y(c)} stroke={C.red} strokeWidth={3} />
            <line x1={X(0)} y1={Y(0)} x2={X(b)} y2={Y(d)} stroke={C.teal} strokeWidth={3} />
            <circle cx={X(a)} cy={Y(c)} r={4} fill={C.red} />
            <circle cx={X(b)} cy={Y(d)} r={4} fill={C.teal} />
          </g>
        </svg>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
            <Slider label="a" value={a} min={-2} max={2} step={0.05} onChange={set(0)} show={(v) => fx(v)} />
            <Slider label="b" value={b} min={-2} max={2} step={0.05} onChange={set(1)} show={(v) => fx(v)} />
            <Slider label="c" value={c} min={-2} max={2} step={0.05} onChange={set(2)} show={(v) => fx(v)} />
            <Slider label="d" value={d} min={-2} max={2} step={0.05} onChange={set(3)} show={(v) => fx(v)} />
          </div>
          <p className="kx-mono" style={{ margin: '12px 0 0', lineHeight: 1.6 }}>
            <span style={{ color: C.red, fontWeight: 700 }}>first column (a, c)</span> = where (1, 0) lands
            <br />
            <span style={{ color: C.teal, fontWeight: 700 }}>second column (b, d)</span> = where (0, 1) lands
          </p>
        </div>
      </div>
      <p className="stat">{say} The grid lines stay straight and evenly spaced: that is what makes a move linear.</p>
    </div>
  )
}

const f = (x: number) => 0.2 * x ** 3 - x + 1
const df = (x: number) => 0.6 * x * x - 1

/** A secant line becomes the tangent as the gap h shrinks. */
export function AiTangent() {
  const [x0, setX0] = useState(1.5)
  const [hi, setHi] = useState(0)
  const H = [2, 1, 0.5, 0.2, 0.1, 0.01, 0.001]
  const h = H[hi]
  const sx = scale(-3.2, 3.2, 20, 500)
  const sy = scale(-4, 6, 270, 10)
  const pts = []
  for (let x = -3.2; x <= 3.2; x += 0.05) pts.push(`${sx(x)},${sy(f(x))}`)
  const sec = (f(x0 + h) - f(x0)) / h
  const tan = df(x0)
  const line = (m: number, color: string, dash?: string) => (
    <line x1={sx(-3.2)} y1={sy(f(x0) + m * (-3.2 - x0))} x2={sx(3.2)} y2={sy(f(x0) + m * (3.2 - x0))} stroke={color} strokeWidth={2} strokeDasharray={dash} />
  )
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Point x" value={x0} min={-2.6} max={2.4} step={0.1} onChange={setX0} show={(v) => fx(v, 1)} />
        <Slider label="Gap h" value={hi} min={0} max={H.length - 1} onChange={setHi} show={() => String(h)} />
      </div>
      <svg viewBox="0 0 520 280" role="img" aria-label={`The curve f(x) = 0.2x³ − x + 1. At x = ${fx(x0, 1)} the secant slope with gap ${h} is ${fx(sec, 3)}; the derivative is ${fx(tan, 3)}.`}>
        <clipPath id="ai-tan-c">
          <rect width="520" height="280" />
        </clipPath>
        <line className="ax" x1={20} x2={500} y1={sy(0)} y2={sy(0)} />
        <line className="ax" x1={sx(0)} x2={sx(0)} y1={10} y2={270} />
        <g clipPath="url(#ai-tan-c)">
          <polyline points={pts.join(' ')} className="curve" />
          {line(tan, C.teal, '6 5')}
          {line(sec, C.amber)}
        </g>
        <circle cx={sx(x0)} cy={sy(f(x0))} r={5} fill={C.blue} />
        <circle cx={sx(x0 + h)} cy={sy(f(x0 + h))} r={5} fill={C.amber} />
        <text x={sx(x0)} y={sy(f(x0)) + 20} textAnchor="middle" className="b">
          x
        </text>
        <text x={510} y={22} textAnchor="end" style={{ fill: C.amber }} className="b">
          secant: slope {fx(sec, 3)}
        </text>
        <text x={510} y={40} textAnchor="end" style={{ fill: C.teal }} className="b">
          tangent: slope {fx(tan, 3)}
        </text>
      </svg>
      <p className="stat">
        The secant joins the curve at x and at x + h. Its slope is the rise over the run: (f(x + h) − f(x)) / h ={' '}
        <b className="kx-num">{fx(sec, 3)}</b>. Make h smaller: the slope gets closer to <b className="kx-num">{fx(tan, 3)}</b>, the derivative.
        {Math.abs(tan) < 0.15 && ' Here the tangent is almost flat: x is near a peak or a valley of the curve.'}
      </p>
    </div>
  )
}

type Fn = 'bowl' | 'two'
const LOSS: Record<Fn, { L: (w: number) => number; d: (w: number) => number; lo: number; hi: number; top: number; bottom: number; label: string }> = {
  bowl: { L: (w) => (w - 3) ** 2, d: (w) => 2 * (w - 3), lo: -1.5, hi: 7.5, top: 22, bottom: -1, label: 'L(w) = (w − 3)²' },
  two: { L: (w) => 0.1 * w ** 4 - w * w + 0.5 * w + 3, d: (w) => 0.4 * w ** 3 - 2 * w + 0.5, lo: -3.6, hi: 3.6, top: 8, bottom: -1.5, label: 'Two valleys' },
}

/** Gradient descent on a one-weight loss. The learning rate decides if it settles, bounces or flies off. */
export function AiDescent() {
  const [fn, setFn] = useState<Fn>('bowl')
  const [lr, setLr] = useState(0.25)
  const [w0, setW0] = useState(0)
  const [path, setPath] = useState<number[]>([0])
  const [run, setRun] = useState(false)
  const F = LOSS[fn]
  const w = path[path.length - 1]
  const gone = !Number.isFinite(w) || Math.abs(w) > 1e3
  const settled = !gone && path.length > 1 && Math.abs(path[path.length - 2] - w) < 1e-4
  const step = () => setPath((p) => (p.length > 200 ? p : [...p, p[p.length - 1] - lr * F.d(p[p.length - 1])]))
  useTicker(run && !gone && !settled && path.length < 200, 380, step)
  const reset = (nfn = fn, nw = w0) => {
    setRun(false)
    setPath([nw])
  }
  const sx = scale(F.lo, F.hi, 24, 500)
  const sy = scale(F.bottom, F.top, 250, 14)
  const pts = []
  for (let x = F.lo; x <= F.hi + 1e-9; x += (F.hi - F.lo) / 200) pts.push(`${sx(x)},${sy(F.L(x))}`)
  const vis = path.filter((p) => Number.isFinite(p) && p >= F.lo && p <= F.hi && F.L(p) <= F.top)
  let say: string
  if (gone) say = 'The weight has flown off to huge values. Every step overshoots the valley by more than the last one. Make the learning rate smaller.'
  else if (settled) say = `Settled at w = ${fx(w, 3)} after ${path.length - 1} steps, with loss ${fx(F.L(w), 3)}.`
  else if (path.length > 3 && Math.sign(path[path.length - 1] - path[path.length - 2]) !== Math.sign(path[path.length - 2] - path[path.length - 3]))
    say = 'The steps jump from one side of the valley to the other. The learning rate is large for this slope.'
  else say = path.length === 1 ? 'Select Step or Run. Each step moves w against the slope, by learning rate × slope.' : `Step ${path.length - 1}: w = ${fx(w, 3)}, slope ${fx(F.d(w), 3)}, loss ${fx(F.L(w), 3)}.`
  if (fn === 'two' && settled && w > 0) say += ' This is the higher valley on the right: a local minimum. Gradient descent only sees the slope where it stands.'
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Seg
          label="Loss"
          value={fn}
          options={[['bowl', 'Bowl'], ['two', 'Two valleys']] as const}
          onChange={(v) => {
            setFn(v)
            const nw = v === 'bowl' ? 0 : 0.6
            setW0(nw)
            setLr(v === 'bowl' ? 0.25 : 0.05)
            reset(v, nw)
          }}
        />
        <Slider label="Learning rate" value={lr} min={0.01} max={fn === 'bowl' ? 1.1 : 0.5} step={0.01} onChange={(v) => { setLr(v); reset() }} show={(v) => fx(v)} />
        <Slider label="Start w" value={w0} min={F.lo + 0.2} max={F.hi - 0.2} step={0.1} onChange={(v) => { setW0(v); reset(fn, v) }} show={(v) => fx(v, 1)} />
      </div>
      <div className="kx-row">
        <button className="act" disabled={gone || settled} onClick={step}>
          Step
        </button>
        <button className="act ghost" disabled={gone || settled} onClick={() => setRun(!run)}>
          {run ? 'Pause' : 'Run'}
        </button>
        <button className="act ghost" onClick={() => reset()}>
          Start again
        </button>
      </div>
      <svg viewBox="0 0 520 262" role="img" aria-label={`${F.label}. Gradient descent with learning rate ${lr}. ${say}`}>
        <line className="ax" x1={24} x2={500} y1={sy(0)} y2={sy(0)} />
        <polyline points={pts.join(' ')} className="curve" />
        <polyline points={vis.map((p) => `${sx(p)},${sy(F.L(p))}`).join(' ')} fill="none" stroke={C.amber} strokeWidth={1.5} strokeOpacity={0.7} />
        {vis.map((p, i) => (
          <circle key={i} cx={sx(p)} cy={sy(F.L(p))} r={i === vis.length - 1 ? 6 : 3.5} fill={i === vis.length - 1 ? C.red : C.amber} />
        ))}
        <text x={30} y={26} className="b">
          {F.label}
        </text>
        <text x={500} y={sy(0) + 16} textAnchor="end">
          w →
        </text>
      </svg>
      <p className="stat" role="status">
        {say}
      </p>
    </div>
  )
}

type Opt = 'gd' | 'mom' | 'adam'
const OPT_COL: Record<Opt, string> = { gd: C.red, mom: C.blue, adam: C.teal }
const OPT_NAME: Record<Opt, string> = { gd: 'Plain', mom: 'Momentum', adam: 'Adam' }

/** Paths of plain gradient descent, momentum and Adam in a long, narrow valley. */
function paths(lr: number, beta: number, n: number) {
  const g = (x: number, y: number) => [x, 20 * y] // L = x²/2 + 10y²
  const start = [-9, 1.6]
  const out: Record<Opt, number[][]> = { gd: [start], mom: [start], adam: [start] }
  let [x, y] = start
  for (let i = 0; i < n; i++) {
    const [gx, gy] = g(x, y)
    x -= lr * gx
    y -= lr * gy
    out.gd.push([x, y])
  }
  ;[x, y] = start
  let vx = 0
  let vy = 0
  for (let i = 0; i < n; i++) {
    const [gx, gy] = g(x, y)
    vx = beta * vx + gx
    vy = beta * vy + gy
    x -= lr * vx
    y -= lr * vy
    out.mom.push([x, y])
  }
  ;[x, y] = start
  let m = [0, 0]
  let v = [0, 0]
  const a = 0.6
  for (let i = 1; i <= n; i++) {
    const gr = g(x, y)
    m = m.map((k, j) => 0.9 * k + 0.1 * gr[j])
    v = v.map((k, j) => 0.999 * k + 0.001 * gr[j] ** 2)
    const st = m.map((k, j) => (a * (k / (1 - 0.9 ** i))) / (Math.sqrt(v[j] / (1 - 0.999 ** i)) + 1e-8))
    x -= st[0]
    y -= st[1]
    out.adam.push([x, y])
  }
  return out
}

export function AiMomentum() {
  const [lr, setLr] = useState(0.085)
  const [beta, setBeta] = useState(0.8)
  const [n, setN] = useState(calm ? 40 : 0)
  const [run, setRun] = useState(!calm)
  const [show, setShow] = useState<Record<Opt, boolean>>({ gd: true, mom: true, adam: false })
  useTicker(run && n < 60, 120, () => setN((k) => Math.min(60, k + 1)))
  const p = paths(lr, beta, n)
  const sx = scale(-10.5, 10.5, 10, 590)
  const sy = scale(-3, 3, 222, 18)
  const loss = ([x, y]: number[]) => x * x / 2 + 10 * y * y
  const rings = [0.5, 2, 5, 10, 20, 35, 55].map((c) => {
    const pts = []
    for (let t = 0; t <= 64; t++) {
      const a = (t / 64) * 2 * Math.PI
      pts.push(`${sx(Math.sqrt(2 * c) * Math.cos(a))},${sy(Math.sqrt(c / 10) * Math.sin(a))}`)
    }
    return <polyline key={c} points={pts.join(' ')} fill="none" stroke="#d5dbe6" />
  })
  const clip = (v: number[]) => [Math.max(-12, Math.min(12, v[0])), Math.max(-4, Math.min(4, v[1]))]
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Learning rate" value={lr} min={0.01} max={0.1} step={0.005} onChange={(v) => { setLr(v); setN(0); setRun(true) }} show={(v) => fx(v, 3)} />
        <Slider label="Momentum β" value={beta} min={0} max={0.95} step={0.05} onChange={(v) => { setBeta(v); setN(0); setRun(true) }} show={(v) => fx(v)} />
        <Slider label="Steps" value={n} min={0} max={60} onChange={(v) => { setRun(false); setN(v) }} />
      </div>
      <div className="kx-row">
        {(Object.keys(OPT_NAME) as Opt[]).map((o) => (
          <label key={o} style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600, color: OPT_COL[o] }}>
            <input type="checkbox" checked={show[o]} onChange={() => setShow({ ...show, [o]: !show[o] })} style={{ accentColor: OPT_COL[o] }} />
            {OPT_NAME[o]}
          </label>
        ))}
        <button className="act ghost" onClick={() => { setN(0); setRun(true) }}>
          Start again
        </button>
      </div>
      <svg viewBox="0 0 600 240" role="img" aria-label="A long narrow valley seen from above. The minimum is in the centre. Paths of the chosen optimisers after the chosen number of steps.">
        {rings}
        <circle cx={sx(0)} cy={sy(0)} r={4} fill="var(--ink)" />
        {(Object.keys(p) as Opt[])
          .filter((o) => show[o])
          .map((o) => (
            <g key={o}>
              <polyline points={p[o].map((q) => clip(q)).map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')} fill="none" stroke={OPT_COL[o]} strokeWidth={1.8} />
              {(() => {
                const [x, y] = clip(p[o][p[o].length - 1])
                return <circle cx={sx(x)} cy={sy(y)} r={5} fill={OPT_COL[o]} />
              })()}
            </g>
          ))}
      </svg>
      <div className="kx-kpis">
        {(Object.keys(p) as Opt[])
          .filter((o) => show[o])
          .map((o) => (
            <div key={o}>
              <small style={{ color: OPT_COL[o] }}>{OPT_NAME[o]}: loss after {n} steps</small>
              <b>{fx(loss(p[o][p[o].length - 1]), 3)}</b>
            </div>
          ))}
      </div>
      <p className="stat">
        The valley is steep across and almost flat along. Plain steps bounce from wall to wall and creep along the floor. Momentum adds up the steps
        before: the bounces cancel out and the movement along the floor builds up. Adam scales each direction by its own recent slope, so both
        directions move at a similar speed.
      </p>
    </div>
  )
}
