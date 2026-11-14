import { useMemo, useState } from 'react'
import { Bars, C, Seg, Slider, calm, fx, gauss, rng, scale, useTicker } from '../kit'

/* ---------- linear regression ---------- */

const HOUSES = (() => {
  const r = rng(5)
  return Array.from({ length: 10 }, (_, i) => {
    const x = 0.5 + i * 0.16 + r() * 0.08
    return [x, 1.4 * x + 0.6 + gauss(r) * 0.22]
  })
})()

function best() {
  const n = HOUSES.length
  const mx = HOUSES.reduce((a, [x]) => a + x, 0) / n
  const my = HOUSES.reduce((a, [, y]) => a + y, 0) / n
  const sxy = HOUSES.reduce((a, [x, y]) => a + (x - mx) * (y - my), 0)
  const sxx = HOUSES.reduce((a, [x]) => a + (x - mx) ** 2, 0)
  const w = sxy / sxx
  return [w, my - w * mx]
}

/** Move a line by hand, or let gradient descent move it, and watch the squared errors. */
export function AiFit() {
  const [w, setW] = useState(0.2)
  const [b, setB] = useState(2.4)
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState(0)
  const mse = (w: number, b: number) => HOUSES.reduce((a, [x, y]) => a + (w * x + b - y) ** 2, 0) / HOUSES.length
  const grad = (w: number, b: number) => {
    let gw = 0
    let gb = 0
    for (const [x, y] of HOUSES) {
      const e = w * x + b - y
      gw += (2 * e * x) / HOUSES.length
      gb += (2 * e) / HOUSES.length
    }
    return [gw, gb]
  }
  const [bw, bb] = best()
  const done = mse(w, b) - mse(bw, bb) < 1e-4
  useTicker(run && !done, 40, () => {
    let nw = w
    let nb = b
    for (let k = 0; k < 3; k++) {
      const [gw, gb] = grad(nw, nb)
      nw -= 0.2 * gw
      nb -= 0.2 * gb
    }
    setW(nw)
    setB(nb)
    setSteps((s) => s + 3)
  })
  const sx = scale(0, 2.4, 40, 380)
  const sy = scale(0, 5, 250, 12)
  const loss = mse(w, b)
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Slope w" value={w} min={-1} max={4} step={0.01} onChange={(v) => { setRun(false); setW(v) }} show={(v) => fx(v)} />
        <Slider label="Intercept b" value={b} min={-2} max={4} step={0.01} onChange={(v) => { setRun(false); setB(v) }} show={(v) => fx(v)} />
      </div>
      <div className="kx-row">
        <button className="act" disabled={done} onClick={() => { if (!run) setSteps(0); setRun(!run) }}>
          {run ? 'Pause' : 'Run gradient descent'}
        </button>
        <button className="act ghost" onClick={() => { setRun(false); setW(0.2); setB(2.4); setSteps(0) }}>
          Start again
        </button>
      </div>
      <div className="kx-two">
        <svg viewBox="0 0 400 270" role="img" aria-label={`Ten houses: size against price. The line has slope ${fx(w)} and intercept ${fx(b)}. Mean squared error ${fx(loss, 3)}.`}>
          <line className="ax" x1={40} x2={390} y1={sy(0)} y2={sy(0)} />
          <line className="ax" x1={sx(0)} x2={sx(0)} y1={8} y2={250} />
          <text x={390} y={266} textAnchor="end">
            size (100 m²)
          </text>
          <text x={44} y={14}>
            price (£100k)
          </text>
          {HOUSES.map(([x, y], i) => {
            const p = w * x + b
            const side = Math.abs(sy(p) - sy(y))
            return (
              <g key={i}>
                <rect x={sx(x)} y={Math.min(sy(p), sy(y))} width={side} height={side} fill={C.red} fillOpacity={0.1} stroke={C.red} strokeOpacity={0.35} />
                <line x1={sx(x)} x2={sx(x)} y1={sy(y)} y2={sy(p)} stroke={C.red} strokeWidth={1.5} />
              </g>
            )
          })}
          <line x1={sx(0)} y1={sy(b)} x2={sx(2.4)} y2={sy(w * 2.4 + b)} stroke={C.blue} strokeWidth={2.5} />
          {HOUSES.map(([x, y], i) => (
            <circle key={i} cx={sx(x)} cy={sy(y)} r={4.5} fill="var(--ink)" />
          ))}
        </svg>
        <div>
          <div className="kx-kpis" style={{ marginTop: 0 }}>
            <div className="hl">
              <small>Mean squared error</small>
              <b>{fx(loss, 3)}</b>
            </div>
            <div>
              <small>Best possible</small>
              <b>{fx(mse(bw, bb), 3)}</b>
            </div>
            {steps > 0 && (
              <div>
                <small>Steps</small>
                <b>{steps}</b>
              </div>
            )}
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '12px 0 0' }}>
            Each red square has a side as long as the error for one house. The loss is the average area of the squares. Big misses count far more
            than small ones.
          </p>
        </div>
      </div>
      <p className="stat">
        {done
          ? `This is the best line: slope ${fx(bw)}, intercept ${fx(bb)}. No change to either number makes the squares smaller on average.`
          : 'Move the sliders to make the red squares as small as you can, or let gradient descent do it. It moves both numbers downhill on the loss at each step.'}
      </p>
    </div>
  )
}

/* ---------- overfitting and regularisation ---------- */

const TRUE = (x: number) => Math.sin(2 * Math.PI * x)
const PTS = (() => {
  const r = rng(21)
  const tr = Array.from({ length: 12 }, (_, i) => {
    const x = (i + 0.2 + r() * 0.6) / 12
    return [x, TRUE(x) + gauss(r) * 0.28]
  })
  const te = Array.from({ length: 60 }, () => {
    const x = r()
    return [x, TRUE(x) + gauss(r) * 0.28]
  })
  return { tr, te }
})()

function solve(A: number[][], y: number[]) {
  const n = y.length
  const M = A.map((row, i) => [...row, y[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r
    ;[M[c], M[p]] = [M[p], M[c]]
    for (let r = 0; r < n; r++) {
      if (r === c) continue
      const k = M[r][c] / M[c][c]
      for (let j = c; j <= n; j++) M[r][j] -= k * M[c][j]
    }
  }
  return M.map((row, i) => row[n] / row[i])
}

function polyFit(deg: number, lam: number) {
  const feats = (x: number) => Array.from({ length: deg + 1 }, (_, k) => (2 * x - 1) ** k)
  const X = PTS.tr.map(([x]) => feats(x))
  const A = Array.from({ length: deg + 1 }, (_, i) =>
    Array.from({ length: deg + 1 }, (_, j) => X.reduce((a, row) => a + row[i] * row[j], 0) + (i === j ? (i === 0 ? 1e-10 : lam * PTS.tr.length + 1e-10) : 0)),
  )
  const yv = Array.from({ length: deg + 1 }, (_, i) => X.reduce((a, row, n) => a + row[i] * PTS.tr[n][1], 0))
  const c = solve(A, yv)
  const f = (x: number) => feats(x).reduce((a, v, k) => a + v * c[k], 0)
  const err = (set: number[][]) => set.reduce((a, [x, y]) => a + (f(x) - y) ** 2, 0) / set.length
  return { f, train: err(PTS.tr), test: err(PTS.te), size: Math.sqrt(c.slice(1).reduce((a, v) => a + v * v, 0)) }
}

const LAMS = [0, 1e-6, 1e-5, 1e-4, 1e-3, 1e-2, 0.1, 1]

function Poly({ ridge }: { ridge: boolean }) {
  const [deg, setDeg] = useState(ridge ? 11 : 3)
  const [li, setLi] = useState(0)
  const lam = LAMS[li]
  const all = useMemo(() => Array.from({ length: 11 }, (_, k) => polyFit(k + 1, lam)), [lam])
  const fit = all[deg - 1]
  const sx = scale(0, 1, 30, 400)
  const sy = scale(-2, 2, 250, 10)
  const curve = []
  for (let x = 0; x <= 1.0001; x += 0.004) curve.push(`${sx(x)},${sy(Math.max(-2.4, Math.min(2.4, fit.f(x))))}`)
  const truth = []
  for (let x = 0; x <= 1.0001; x += 0.01) truth.push(`${sx(x)},${sy(TRUE(x))}`)
  const ex = scale(1, 11, 30, 250)
  const ey = (v: number) => 150 - Math.min(1, v / 0.6) * 130
  const bestDeg = all.reduce((b, f, i) => (f.test < all[b].test ? i : b), 0) + 1
  let say: string
  if (fit.test > fit.train * 3 && fit.train < 0.05) say = `The curve passes close to every training point, so the training error is tiny. Between the points it swings wildly, so the test error is large. The model has memorised the noise.`
  else if (deg <= 2 && fit.train > 0.15) say = 'The model is too simple for the shape of the data. Both errors are high: this is underfitting, or high bias.'
  else say = `Training and test errors are close. Here the model learns the shape, not the noise. On this data degree ${bestDeg} gives the lowest test error.`
  if (ridge && lam > 0) say += ` The penalty λ = ${lam} pulls the weights towards 0 (their size is now ${fx(fit.size, 1)}), so the curve cannot bend as sharply.`
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Polynomial degree" value={deg} min={1} max={11} onChange={setDeg} />
        {ridge && <Slider label="Penalty λ" value={li} min={0} max={LAMS.length - 1} onChange={setLi} show={() => String(lam)} />}
      </div>
      <div className="kx-two">
        <svg viewBox="0 0 410 262" role="img" aria-label={`A degree ${deg} polynomial fitted to 12 noisy points. Training error ${fx(fit.train, 3)}, test error ${fx(fit.test, 3)}.`}>
          <clipPath id={`ai-poly-c${ridge ? 'r' : ''}`}>
            <rect x={30} y={8} width={372} height={246} />
          </clipPath>
          <line className="ax" x1={30} x2={400} y1={sy(0)} y2={sy(0)} strokeOpacity={0.5} />
          <polyline points={truth.join(' ')} fill="none" stroke={C.grey} strokeDasharray="5 5" strokeWidth={1.5} />
          {PTS.te.map(([x, y], i) => (
            <circle key={`t${i}`} cx={sx(x)} cy={sy(y)} r={2.6} fill="none" stroke={C.teal} strokeOpacity={0.7} />
          ))}
          <g clipPath={`url(#ai-poly-c${ridge ? 'r' : ''})`}>
            <polyline points={curve.join(' ')} fill="none" stroke={C.blue} strokeWidth={2.5} />
          </g>
          {PTS.tr.map(([x, y], i) => (
            <circle key={i} cx={sx(x)} cy={sy(y)} r={4.5} fill="var(--ink)" />
          ))}
        </svg>
        <div>
          <h5>Error against degree</h5>
          <svg viewBox="0 0 260 170" role="img" aria-label="Training error falls as the degree grows. Test error falls, then rises.">
            <line className="ax" x1={30} x2={255} y1={150} y2={150} />
            <polyline points={all.map((f, i) => `${ex(i + 1)},${ey(f.train)}`).join(' ')} fill="none" stroke="var(--ink)" strokeWidth={2} />
            <polyline points={all.map((f, i) => `${ex(i + 1)},${ey(f.test)}`).join(' ')} fill="none" stroke={C.teal} strokeWidth={2} />
            <line x1={ex(deg)} x2={ex(deg)} y1={14} y2={150} stroke={C.blue} strokeDasharray="3 3" />
            {[1, 3, 5, 7, 9, 11].map((d) => (
              <text key={d} x={ex(d)} y={165} textAnchor="middle" fontSize={11}>
                {d}
              </text>
            ))}
            <text x={34} y={14} style={{ fill: C.teal }} className="b">
              test
            </text>
            <text x={74} y={14} className="b">
              training
            </text>
          </svg>
          <div className="kx-kpis">
            <div>
              <small>Training error</small>
              <b>{fx(fit.train, 3)}</b>
            </div>
            <div className="hl">
              <small style={{ color: C.teal }}>Test error</small>
              <b>{fx(fit.test, 3)}</b>
            </div>
          </div>
        </div>
      </div>
      <p className="stat">
        Black dots: 12 training points. Open green circles: new points the model never saw. Dashed grey: the true pattern. {say}
      </p>
    </div>
  )
}

export const AiOverfit = () => <Poly ridge={false} />
export const AiRidge = () => <Poly ridge />

/* ---------- classification threshold ---------- */

const SCORES = (() => {
  const r = rng(9)
  const cl = (v: number) => Math.max(0.01, Math.min(0.99, v))
  return [
    ...Array.from({ length: 30 }, () => ({ s: cl(0.68 + gauss(r) * 0.14), pos: true, j: r() })),
    ...Array.from({ length: 170 }, () => ({ s: cl(0.36 + gauss(r) * 0.14), pos: false, j: r() })),
  ]
})()

/** Move the threshold and watch precision and recall trade places. */
export function AiThreshold() {
  const [th, setTh] = useState(0.5)
  let tp = 0
  let fp = 0
  let fn = 0
  let tn = 0
  for (const d of SCORES) {
    const yes = d.s >= th
    if (d.pos && yes) tp++
    else if (d.pos) fn++
    else if (yes) fp++
    else tn++
  }
  const prec = tp + fp ? tp / (tp + fp) : 1
  const rec = tp / (tp + fn)
  const acc = (tp + tn) / SCORES.length
  const f1 = prec + rec ? (2 * prec * rec) / (prec + rec) : 0
  const sx = scale(0, 1, 20, 580)
  const pc = (v: number) => `${fx(v * 100, 0)}%`
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Threshold: flag as fraud when the score is at least" value={th} min={0.05} max={0.95} step={0.01} onChange={setTh} show={(v) => fx(v)} />
      </div>
      <svg viewBox="0 0 600 190" role="img" aria-label={`200 payments by model score. Threshold ${fx(th)}. ${tp} frauds caught, ${fn} missed, ${fp} false alarms.`}>
        <rect x={sx(th)} y={4} width={580 - sx(th)} height={166} fill={C.amber} fillOpacity={0.08} />
        <text x={14} y={22} className="b" style={{ fill: C.red }}>
          Fraud (30)
        </text>
        <text x={14} y={92} className="b">
          Not fraud (170)
        </text>
        {SCORES.map((d, i) => (
          <circle
            key={i}
            cx={sx(d.s)}
            cy={d.pos ? 32 + d.j * 34 : 102 + d.j * 60}
            r={4}
            fill={d.pos ? C.red : '#8e98a4'}
            fillOpacity={d.s >= th ? 1 : 0.35}
            stroke={d.s >= th ? 'var(--ink)' : 'none'}
          />
        ))}
        <line x1={sx(th)} x2={sx(th)} y1={4} y2={172} stroke="var(--ink)" strokeWidth={2} />
        <text x={sx(th) + 5} y={184} className="b">
          flagged →
        </text>
        <text x={20} y={184}>
          score 0
        </text>
        <text x={580} y={184} textAnchor="end">
          1
        </text>
      </svg>
      <div className="kx-two" style={{ marginTop: 10 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th />
              <th>Flagged</th>
              <th>Not flagged</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Fraud</th>
              <td style={{ color: C.teal, fontWeight: 700 }}>{tp} caught</td>
              <td style={{ color: C.red, fontWeight: 700 }}>{fn} missed</td>
            </tr>
            <tr>
              <th>Not fraud</th>
              <td style={{ color: C.amber, fontWeight: 700 }}>{fp} false alarms</td>
              <td>{tn}</td>
            </tr>
          </tbody>
        </table>
        <Bars
          rows={[
            { label: 'precision', value: prec, color: C.amber },
            { label: 'recall', value: rec, color: C.red },
            { label: 'F1', value: f1, color: C.purple },
            { label: 'accuracy', value: acc, color: C.grey },
          ]}
          max={1}
          fmt={pc}
        />
      </div>
      <p className="stat">
        Precision: of the flagged payments, {pc(prec)} are fraud. Recall: of all frauds, {pc(rec)} are caught. Raise the threshold and precision goes
        up, recall goes down. Accuracy stays high whatever you do: flag nothing at all and it is still {pc(170 / 200)}, because most payments are
        honest.
      </p>
    </div>
  )
}

/* ---------- k-means ---------- */

const BLOBS = (() => {
  const r = rng(13)
  const cs = [
    [2.2, 2.4],
    [6.8, 2.8],
    [4.5, 6.6],
  ]
  return cs.flatMap(([cx, cy]) => Array.from({ length: 30 }, () => [cx + gauss(r) * 0.85, cy + gauss(r) * 0.85]))
})()
const KCOL = [C.blue, C.amber, C.teal, C.purple, C.red]

export function AiKmeans() {
  const [k, setK] = useState(3)
  const [seed, setSeed] = useState(1)
  const init = (k: number, seed: number) => {
    const r = rng(seed * 97)
    return Array.from({ length: k }, () => BLOBS[Math.floor(r() * BLOBS.length)].slice())
  }
  const [cent, setCent] = useState(() => init(3, 1))
  const [asg, setAsg] = useState<number[] | null>(null)
  const [phase, setPhase] = useState<'assign' | 'move' | 'done'>('assign')
  const [round, setRound] = useState(0)
  const restart = (nk: number, ns: number) => {
    setK(nk)
    setSeed(ns)
    setCent(init(nk, ns))
    setAsg(null)
    setPhase('assign')
    setRound(0)
  }
  const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
  const next = () => {
    if (phase === 'assign') {
      const na = BLOBS.map((p) => cent.reduce((bi, c, i) => (d2(p, c) < d2(p, cent[bi]) ? i : bi), 0))
      if (asg && na.every((v, i) => v === asg[i])) setPhase('done')
      else {
        setAsg(na)
        setPhase('move')
        setRound((r) => r + 1)
      }
    } else if (phase === 'move' && asg) {
      setCent(
        cent.map((c, i) => {
          const mine = BLOBS.filter((_, j) => asg[j] === i)
          return mine.length ? [mine.reduce((a, p) => a + p[0], 0) / mine.length, mine.reduce((a, p) => a + p[1], 0) / mine.length] : c
        }),
      )
      setPhase('assign')
    }
  }
  const [auto, setAuto] = useState(false)
  useTicker(auto && phase !== 'done', 650, next)
  const inertia = asg ? BLOBS.reduce((a, p, j) => a + d2(p, cent[asg[j]]), 0) : null
  const s = (v: number) => 20 + v * 50
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Number of clusters k" value={k} min={2} max={5} onChange={(v) => restart(v, seed)} />
        <div className="kx-row" style={{ marginBottom: 0 }}>
          <button className="act" disabled={phase === 'done'} onClick={next}>
            {phase === 'assign' ? 'Assign points' : phase === 'move' ? 'Move centres' : 'Finished'}
          </button>
          <button className="act ghost" disabled={phase === 'done'} onClick={() => setAuto(!auto)}>
            {auto ? 'Pause' : 'Run'}
          </button>
          <button className="act ghost" onClick={() => { setAuto(false); restart(k, seed + 1) }}>
            New random start
          </button>
        </div>
      </div>
      <svg viewBox="0 0 500 420" role="img" aria-label={`${BLOBS.length} points and ${k} cluster centres after ${round} rounds.`} style={{ maxWidth: 520 }}>
        {asg &&
          BLOBS.map((p, j) => <line key={`l${j}`} x1={s(p[0])} y1={s(8.2 - p[1])} x2={s(cent[asg[j]][0])} y2={s(8.2 - cent[asg[j]][1])} stroke={KCOL[asg[j]]} strokeOpacity={0.18} />)}
        {BLOBS.map((p, j) => (
          <circle key={j} cx={s(p[0])} cy={s(8.2 - p[1])} r={4.5} fill={asg ? KCOL[asg[j]] : '#9ea7b2'} />
        ))}
        {cent.map((c, i) => (
          <g key={i} style={{ transition: calm ? undefined : 'transform 0.45s ease' }} transform={`translate(${s(c[0])},${s(8.2 - c[1])})`}>
            <path d="M-11,0 L11,0 M0,-11 L0,11" stroke="#fff" strokeWidth={7} />
            <path d="M-10,0 L10,0 M0,-10 L0,10" stroke={KCOL[i]} strokeWidth={4} />
          </g>
        ))}
      </svg>
      <div className="kx-kpis">
        <div>
          <small>Rounds</small>
          <b>{round}</b>
        </div>
        <div className="hl">
          <small>Total squared distance</small>
          <b>{inertia === null ? '–' : fx(inertia, 1)}</b>
        </div>
      </div>
      <p className="stat" role="status">
        {phase === 'done'
          ? `No point changed its cluster, so k-means has stopped. ${k === 3 ? 'Try a new random start: some starts end in a worse split.' : 'The data has 3 groups. With another k, k-means still finds k clusters: it cannot tell you the right number.'}`
          : phase === 'assign'
            ? round === 0
              ? 'The crosses are the starting centres, picked at random from the points. Each round has two steps: assign, then move.'
              : 'Assign: each point joins the nearest centre.'
            : 'Move: each centre goes to the average position of its points.'}
      </p>
    </div>
  )
}

/* ---------- one neuron ---------- */

type Act = 'none' | 'relu' | 'sigmoid' | 'tanh'
const ACT: Record<Act, (z: number) => number> = {
  none: (z) => z,
  relu: (z) => Math.max(0, z),
  sigmoid: (z) => 1 / (1 + Math.exp(-z)),
  tanh: Math.tanh,
}

const heat = (v: number) => {
  const t = Math.max(-1, Math.min(1, v))
  const [r, g, b] = t >= 0 ? [36, 86, 214] : [185, 119, 0]
  const a = Math.abs(t)
  return `rgb(${Math.round(255 + (r - 255) * a)},${Math.round(255 + (g - 255) * a)},${Math.round(255 + (b - 255) * a)})`
}

/** Two inputs, two weights, a bias and a bend. The map shows the output for every pair of inputs. */
export function AiNeuron() {
  const [x, setX] = useState([1, -0.5])
  const [w, setW] = useState([1.5, 1])
  const [b, setB] = useState(-0.5)
  const [act, setAct] = useState<Act>('relu')
  const z = w[0] * x[0] + w[1] * x[1] + b
  const y = ACT[act](z)
  const G = 22
  const cells = []
  for (let i = 0; i < G; i++)
    for (let j = 0; j < G; j++) {
      const a = -2 + (4 * (i + 0.5)) / G
      const c = 2 - (4 * (j + 0.5)) / G
      const o = ACT[act](w[0] * a + w[1] * c + b)
      const v = act === 'sigmoid' ? o * 2 - 1 : act === 'tanh' ? o : o / 3
      cells.push(<rect key={`${i}-${j}`} x={i * 10} y={j * 10} width={10.4} height={10.4} fill={heat(v)} />)
    }
  const px = ((x[0] + 2) / 4) * 220
  const py = ((2 - x[1]) / 4) * 220
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Input x₁" value={x[0]} min={-2} max={2} step={0.1} onChange={(v) => setX([v, x[1]])} show={(v) => fx(v, 1)} />
        <Slider label="Input x₂" value={x[1]} min={-2} max={2} step={0.1} onChange={(v) => setX([x[0], v])} show={(v) => fx(v, 1)} />
        <Slider label="Weight w₁" value={w[0]} min={-3} max={3} step={0.1} onChange={(v) => setW([v, w[1]])} show={(v) => fx(v, 1)} />
        <Slider label="Weight w₂" value={w[1]} min={-3} max={3} step={0.1} onChange={(v) => setW([w[0], v])} show={(v) => fx(v, 1)} />
        <Slider label="Bias b" value={b} min={-3} max={3} step={0.1} onChange={setB} show={(v) => fx(v, 1)} />
        <Seg label="Activation" value={act} options={[['none', 'None'], ['relu', 'ReLU'], ['sigmoid', 'Sigmoid'], ['tanh', 'Tanh']] as const} onChange={setAct} />
      </div>
      <div className="kx-two">
        <div>
          <p className="kx-mono" style={{ margin: '0 0 10px', lineHeight: 1.7 }}>
            z = w₁x₁ + w₂x₂ + b
            <br />= {fx(w[0], 1)}×{fx(x[0], 1)} + {fx(w[1], 1)}×{fx(x[1], 1)} + {fx(b, 1)} = <b>{fx(z)}</b>
            <br />
            output = {act === 'none' ? 'z' : `${act === 'relu' ? 'ReLU' : act}(z)`} = <b>{fx(y, 3)}</b>
          </p>
          <ActPlot act={act} z={z} />
        </div>
        <div>
          <h5>Output for every (x₁, x₂)</h5>
          <svg viewBox="-4 -4 228 228" role="img" aria-label="Map of the neuron's output over the two inputs. The boundary where the weighted sum is zero is a straight line." style={{ maxWidth: 260 }}>
            {cells}
            <line x1={0} x2={220} y1={110} y2={110} stroke="#000" strokeOpacity={0.15} />
            <line y1={0} y2={220} x1={110} x2={110} stroke="#000" strokeOpacity={0.15} />
            <circle cx={px} cy={py} r={6} fill="#fff" stroke="var(--ink)" strokeWidth={2.5} />
          </svg>
        </div>
      </div>
      <p className="stat">
        Blue means a large output, orange a negative one. The edge between them is always a straight line: where w₁x₁ + w₂x₂ + b = 0. The weights turn
        the line, the bias moves it. One neuron can only split its inputs with one straight line; layers of neurons combine many lines into curved
        shapes.
      </p>
    </div>
  )
}

function ActPlot({ act, z }: { act: Act; z: number }) {
  const sx = scale(-4, 4, 10, 250)
  const sy = scale(-1.5, 3, 130, 6)
  const pts = []
  for (let v = -4; v <= 4.001; v += 0.05) pts.push(`${sx(v)},${sy(Math.max(-1.5, Math.min(3, ACT[act](v))))}`)
  const zc = Math.max(-4, Math.min(4, z))
  return (
    <svg viewBox="0 0 260 140" role="img" aria-label={`The ${act} activation, with the current z marked.`} style={{ maxWidth: 300 }}>
      <line className="ax" x1={10} x2={250} y1={sy(0)} y2={sy(0)} />
      <line className="ax" x1={sx(0)} x2={sx(0)} y1={6} y2={130} />
      <polyline points={pts.join(' ')} className="curve" />
      <circle cx={sx(zc)} cy={sy(Math.max(-1.5, Math.min(3, ACT[act](zc))))} r={5} fill={C.red} />
      <text x={248} y={sy(0) - 5} textAnchor="end">
        z
      </text>
    </svg>
  )
}

/* ---------- convolution ---------- */

const IMGS: Record<string, string[]> = {
  square: ['........', '........', '..####..', '..####..', '..####..', '..####..', '........', '........'],
  cross: ['...##...', '...##...', '...##...', '########', '########', '...##...', '...##...', '...##...'],
  slope: ['#.......', '##......', '###.....', '####....', '#####...', '######..', '#######.', '########'],
}
const FILTERS: Record<string, { name: string; k: number[][] }> = {
  vert: { name: 'Vertical edges', k: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]] },
  horz: { name: 'Horizontal edges', k: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]] },
  blur: { name: 'Blur', k: [[1, 1, 1], [1, 1, 1], [1, 1, 1]] },
}

/** A 3 × 3 filter slides across a small image; each output cell is one weighted sum. */
export function AiConv() {
  const [img, setImg] = useState<number[][]>(() => IMGS.square.map((r) => r.split('').map((c) => (c === '#' ? 1 : 0))))
  const [fk, setFk] = useState('vert')
  const [pos, setPos] = useState(13)
  const [run, setRun] = useState(false)
  useTicker(run, 450, () => setPos((p) => (p + 1) % 36))
  const K = FILTERS[fk].k
  const out = Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 6 }, (_, c) => K.reduce((a, row, i) => a + row.reduce((s, kv, j) => s + kv * img[r + i][c + j], 0), 0)),
  )
  const pr = Math.floor(pos / 6)
  const pc = pos % 6
  const max = Math.max(1, ...out.flat().map(Math.abs))
  const toggle = (r: number, c: number) => setImg(img.map((row, i) => row.map((v, j) => (i === r && j === c ? 1 - v : v))))
  const terms = K.flatMap((row, i) => row.map((kv, j) => [kv, img[pr + i][pc + j]] as const)).filter(([kv, v]) => kv !== 0 && v !== 0)
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Seg label="Filter" value={fk} options={Object.entries(FILTERS).map(([k, f]) => [k, f.name] as const)} onChange={setFk} />
        <Slider label="Filter position" value={pos} min={0} max={35} onChange={(v) => { setRun(false); setPos(v) }} show={(v) => `row ${Math.floor(v / 6) + 1}, column ${(v % 6) + 1}`} />
      </div>
      <div className="kx-row">
        <button className="act ghost" onClick={() => setRun(!run)}>
          {run ? 'Pause' : 'Slide the filter'}
        </button>
        {Object.keys(IMGS).map((k) => (
          <button key={k} className="act ghost" onClick={() => setImg(IMGS[k].map((r) => r.split('').map((c) => (c === '#' ? 1 : 0))))}>
            Image: {k}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <h5>Input (select a pixel to change it)</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 30px)', gap: 2 }}>
            {img.flatMap((row, r) =>
              row.map((v, c) => {
                const inWin = r >= pr && r < pr + 3 && c >= pc && c < pc + 3
                return (
                  <button
                    key={`${r}-${c}`}
                    aria-label={`Pixel row ${r + 1} column ${c + 1}, ${v ? 'on' : 'off'}`}
                    onClick={() => toggle(r, c)}
                    className="kx-cell"
                    style={{ minWidth: 30, height: 30, padding: 0, background: v ? 'var(--ink)' : '#fff', outline: inWin ? `3px solid ${C.amber}` : undefined, outlineOffset: -2, color: v ? '#fff' : 'var(--ink-3)', fontSize: 11 }}
                  >
                    {inWin ? K[r - pr][c - pc] : ''}
                  </button>
                )
              }),
            )}
          </div>
        </div>
        <div>
          <h5>Output feature map</h5>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 34px)', gap: 2 }}>
            {out.flatMap((row, r) =>
              row.map((v, c) => (
                <span
                  key={`${r}-${c}`}
                  className="kx-cell"
                  style={{ minWidth: 34, height: 34, padding: 0, background: heat(v / max), outline: r === pr && c === pc ? `3px solid ${C.amber}` : undefined, outlineOffset: -2, fontSize: 11.5 }}
                >
                  {v}
                </span>
              )),
            )}
          </div>
        </div>
      </div>
      <p className="stat kx-mono" style={{ fontSize: 13 }}>
        Output at row {pr + 1}, column {pc + 1} = {terms.length ? terms.map(([kv, v]) => `${kv}×${v}`).join(' + ') : '0'} = <b>{out[pr][pc]}</b>
      </p>
      <p className="stat">
        The small numbers in the orange window are the filter's weights. Each output cell multiplies them by the pixels below and adds up. The same 9
        weights are used at every position. The vertical-edge filter gives big numbers only where dark meets light from left to right: it ignores
        everything else.
      </p>
    </div>
  )
}
