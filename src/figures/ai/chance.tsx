import { useMemo, useRef, useState } from 'react'
import { Bars, C, Seg, Slider, fx, rng, scale } from '../kit'

const PREV = [0.1, 0.5, 1, 2, 5, 10, 20, 50]

/** 1,000 people, a disease and a test. How many of the positives are ill? */
export function AiBayes() {
  const [pi, setPi] = useState(2)
  const [sens, setSens] = useState(90)
  const [fpr, setFpr] = useState(5)
  const prev = PREV[pi] / 100
  const N = 1000
  const ill = Math.round(N * prev)
  const tp = Math.round(ill * (sens / 100))
  const fn = ill - tp
  const fp = Math.round((N - ill) * (fpr / 100))
  const tn = N - ill - fp
  const post = (prev * sens) / 100 / ((prev * sens) / 100 + ((1 - prev) * fpr) / 100)
  // order: ill-positive, ill-negative, well-positive, well-negative
  const cells: string[] = []
  for (let i = 0; i < tp; i++) cells.push('tp')
  for (let i = 0; i < fn; i++) cells.push('fn')
  for (let i = 0; i < fp; i++) cells.push('fp')
  for (let i = 0; i < tn; i++) cells.push('tn')
  const col: Record<string, [string, string]> = { tp: [C.red, C.red], fn: ['#fff', C.red], fp: [C.amber, C.amber], tn: ['#e3e7ec', '#e3e7ec'] }
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="People who have the disease" value={pi} min={0} max={PREV.length - 1} onChange={setPi} show={() => `${PREV[pi]}%`} />
        <Slider label="Ill people the test finds" value={sens} min={50} max={100} onChange={setSens} show={(v) => `${v}%`} />
        <Slider label="Well people it wrongly flags" value={fpr} min={0} max={20} step={0.5} onChange={setFpr} show={(v) => `${v}%`} />
      </div>
      <svg viewBox="0 0 600 242" role="img" aria-label={`1,000 people. ${tp} are ill and test positive, ${fn} are ill and test negative, ${fp} are well and test positive, ${tn} are well and test negative.`}>
        {cells.map((k, i) => {
          const x = (i % 50) * 12
          const y = Math.floor(i / 50) * 12
          return <rect key={i} x={x + 1} y={y + 1} width={9.5} height={9.5} rx={2} fill={col[k][0]} stroke={col[k][1]} strokeWidth={1.3} />
        })}
      </svg>
      <div className="kx-kpis">
        <div>
          <small style={{ color: C.red }}>■ Ill, positive</small>
          <b>{tp}</b>
        </div>
        <div>
          <small style={{ color: C.red }}>□ Ill, missed</small>
          <b>{fn}</b>
        </div>
        <div>
          <small style={{ color: C.amber }}>■ Well, positive</small>
          <b>{fp}</b>
        </div>
        <div>
          <small>■ Well, negative</small>
          <b>{tn}</b>
        </div>
        <div className="hl">
          <small>P(ill | positive)</small>
          <b>{fx(post * 100, 1)}%</b>
        </div>
      </div>
      <p className="stat">
        {tp + fp} people test positive. Only {tp} of them are ill. So a positive result means a{' '}
        <b>{fx(post * 100, 1)}%</b> chance of the disease{post < 0.5 ? `, not the ${sens}% that many people guess` : ''}. When a disease is rare, the
        few true positives are lost among false alarms from the many well people. Bayes' rule gives the exact number: P(ill) × P(positive | ill) ÷
        P(positive).
      </p>
    </div>
  )
}

const SIZES = [1, 2, 5, 10, 30, 100]

/** Draw samples from a skewed population. Sample means pile up around the true mean, tighter as the sample grows. */
export function AiSamples() {
  const r = useRef(rng(7))
  const [ni, setNi] = useState(3)
  const [means, setMeans] = useState<number[]>([])
  const [last, setLast] = useState<number[]>([])
  const n = SIZES[ni]
  const MU = 20 // minutes; exponential, so the spread is also 20
  const draw = () => -MU * Math.log(1 - r.current())
  const take = (k: number) => {
    const got: number[] = []
    let one: number[] = []
    for (let j = 0; j < k; j++) {
      one = Array.from({ length: n }, draw)
      got.push(one.reduce((a, b) => a + b, 0) / n)
    }
    setLast(one)
    setMeans((m) => [...m, ...got].slice(-2000))
  }
  const B = 40
  const hi = 80
  const bins = new Array(B).fill(0)
  for (const m of means) bins[Math.min(B - 1, Math.floor((m / hi) * B))]++
  const top = Math.max(1, ...bins)
  const sx = scale(0, hi, 30, 590)
  const avg = means.length ? means.reduce((a, b) => a + b, 0) / means.length : 0
  const sd = means.length > 1 ? Math.sqrt(means.reduce((a, b) => a + (b - avg) ** 2, 0) / (means.length - 1)) : 0
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Sample size" value={ni} min={0} max={SIZES.length - 1} onChange={(v) => { setNi(v); setMeans([]); setLast([]) }} show={() => `${n} deliveries`} />
        <div className="kx-row" style={{ marginBottom: 0 }}>
          <button className="act" onClick={() => take(1)}>
            Take one sample
          </button>
          <button className="act ghost" onClick={() => take(200)}>
            Take 200
          </button>
          <button className="act ghost" onClick={() => { setMeans([]); setLast([]) }}>
            Clear
          </button>
        </div>
      </div>
      <svg viewBox="0 0 600 200" role="img" aria-label={`Histogram of ${means.length} sample means for samples of ${n}. Their spread is ${fx(sd, 1)} minutes.`}>
        {bins.map((b, i) => (
          <rect key={i} x={sx((i * hi) / B) + 1} width={(560 / B) - 2} y={170 - (b / top) * 150} height={(b / top) * 150} fill={C.blue} fillOpacity={0.75} />
        ))}
        {last.map((v, i) => (
          <circle key={i} cx={sx(Math.min(hi, v))} cy={186} r={2.5} fill={C.amber} />
        ))}
        <line x1={sx(MU)} x2={sx(MU)} y1={8} y2={176} stroke={C.red} strokeWidth={2} strokeDasharray="5 4" />
        <text x={sx(MU) + 6} y={20} className="b" style={{ fill: C.red }}>
          true mean: 20 min
        </text>
        <line className="ax" x1={30} x2={590} y1={170} y2={170} />
        {[0, 20, 40, 60, 80].map((t) => (
          <text key={t} x={sx(t)} y={199} textAnchor="middle" fontSize={11}>
            {t}
          </text>
        ))}
      </svg>
      <div className="kx-kpis">
        <div>
          <small>Samples taken</small>
          <b>{means.length}</b>
        </div>
        <div>
          <small>Mean of the means</small>
          <b>{means.length ? fx(avg, 1) : '–'}</b>
        </div>
        <div className="hl">
          <small>Spread of the means</small>
          <b>{means.length > 1 ? fx(sd, 1) : '–'}</b>
        </div>
        <div>
          <small>Theory: 20 ÷ √{n}</small>
          <b>{fx(MU / Math.sqrt(n), 1)}</b>
        </div>
      </div>
      <p className="stat">
        Delivery times are skewed: most are short, a few are very long (orange dots: the last sample). Each sample gives one mean, a blue bar.
        With 1 delivery the means are as wild as the data. With 30 or 100 they crowd round 20 and the pile takes a bell shape. Four times the
        sample size halves the spread.
      </p>
    </div>
  )
}

const LETTERS = ['A', 'B', 'C', 'D']
const LCOL = [C.blue, C.amber, C.teal, C.purple]

/** Four outcomes. Make one more likely and watch the entropy fall. */
export function AiEntropy() {
  const [w, setW] = useState([25, 25, 25, 25])
  const sum = w.reduce((a, b) => a + b, 0) || 1
  const p = w.map((v) => v / sum)
  const H = -p.reduce((a, q) => a + (q > 0 ? q * Math.log2(q) : 0), 0)
  return (
    <div className="kx">
      <div className="kx-row">
        {(
          [
            ['Even', [25, 25, 25, 25]],
            ['Two even', [50, 50, 0, 0]],
            ['Skewed', [70, 10, 10, 10]],
            ['Certain', [100, 0, 0, 0]],
          ] as [string, number[]][]
        ).map(([n, v]) => (
          <button key={n} className="act ghost" onClick={() => setW(v)}>
            {n}
          </button>
        ))}
      </div>
      <div className="kx-two">
        <div className="kx-ctl" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {w.map((v, i) => (
            <Slider key={i} label={`Weight of ${LETTERS[i]}`} value={v} min={0} max={100} onChange={(x) => setW(w.map((y, j) => (j === i ? x : y)))} />
          ))}
        </div>
        <Bars
          rows={p.map((q, i) => ({
            label: LETTERS[i],
            value: q,
            color: LCOL[i],
            note: <small style={{ display: 'block', color: 'var(--ink-3)' }}>{q > 0 ? `${fx(-Math.log2(q), 2)} bits` : 'never'}</small>,
          }))}
          max={1}
          fmt={(v) => `${fx(v * 100, 0)}%`}
        />
      </div>
      <div className="kx-kpis">
        <div className="hl">
          <small>Entropy</small>
          <b>{fx(H, 3)} bits</b>
        </div>
        <div>
          <small>Most possible (4 outcomes)</small>
          <b>2 bits</b>
        </div>
      </div>
      <p className="stat">
        The small grey number under each bar is its surprise, −log₂ p: a rare outcome surprises more. Entropy is the average surprise.{' '}
        {H > 1.98 ? 'All four are equally likely: you cannot do better than guess, so entropy is at its maximum.' : H < 0.01 ? 'One outcome is certain. Nothing is left to learn, so entropy is 0.' : 'Some outcomes are more likely, so you can guess better and the average surprise is lower.'}
      </p>
    </div>
  )
}

const NEXT: [string, number][] = [
  ['mat', 3.2],
  ['floor', 2.6],
  ['sofa', 2.3],
  ['bed', 1.9],
  ['roof', 1.1],
  ['moon', -0.2],
  ['banana', -1.5],
]

function probs(t: number) {
  if (t === 0) return NEXT.map((_, i) => (i === 0 ? 1 : 0))
  const e = NEXT.map(([, s]) => Math.exp(s / t))
  const z = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / z)
}

/** Scores for the next word turned into probabilities, then (in the sampling figure) cut by top-p and sampled. */
function NextWord({ topP }: { topP: boolean }) {
  const [t, setT] = useState(1)
  const [p, setP] = useState(topP ? 0.9 : 1)
  const [counts, setCounts] = useState<number[] | null>(null)
  const r = useRef(rng(3))
  const pr = useMemo(() => probs(t), [t])
  // top-p: keep the most likely words until their total reaches p
  const keep = new Set<number>()
  let acc = 0
  for (const i of pr.map((_, i) => i).sort((a, b) => pr[b] - pr[a])) {
    if (acc >= p - 1e-9) break
    keep.add(i)
    acc += pr[i]
  }
  const kept = pr.map((q, i) => (keep.has(i) ? q / acc : 0))
  const sample = () => {
    const c = new Array(NEXT.length).fill(0)
    for (let k = 0; k < 50; k++) {
      let u = r.current()
      let j = 0
      while (j < kept.length - 1 && u >= kept[j]) u -= kept[j++]
      c[j]++
    }
    setCounts(c)
  }
  return (
    <div className="kx">
      <p style={{ margin: '0 0 12px', fontSize: 16 }}>
        The cat sat on the <b style={{ borderBottom: '2px solid var(--ink)' }}>____</b>
      </p>
      <div className="kx-ctl">
        <Slider label="Temperature" value={t} min={0} max={2} step={0.05} onChange={(v) => { setT(v); setCounts(null) }} show={(v) => (v === 0 ? '0 (greedy)' : fx(v))} />
        {topP && <Slider label="Top-p" value={p} min={0.1} max={1} step={0.05} onChange={(v) => { setP(v); setCounts(null) }} show={(v) => fx(v)} />}
      </div>
      <div className="kx-bars">
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
          <span>word, score</span>
          <span>probability</span>
          <span style={{ textAlign: 'right' }}>{counts ? 'of 50 draws' : ''}</span>
        </div>
      </div>
      <Bars
        rows={NEXT.map(([w, s], i) => ({
          label: `${w.padEnd(7)} ${s >= 0 ? ' ' : ''}${fx(s, 1)}`,
          value: topP ? kept[i] : pr[i],
          dim: topP && !keep.has(i),
          color: C.blue,
          note: counts ? <small style={{ display: 'block', color: C.amber, fontWeight: 700 }}>{counts[i]}×</small> : undefined,
        }))}
        max={1}
        fmt={(v) => `${fx(v * 100, 1)}%`}
      />
      <div className="kx-row" style={{ marginTop: 12 }}>
        <button className="act" onClick={sample}>
          Draw the next word 50 times
        </button>
      </div>
      <p className="stat">
        {t === 0
          ? 'Temperature 0 always takes the top word. The output is the same every time.'
          : t < 0.7
            ? 'A low temperature divides the scores by a small number, so the gaps between them grow. The top word takes almost all the probability.'
            : t > 1.3
              ? 'A high temperature shrinks the gaps between scores. Unlikely words, even "banana", get a real chance.'
              : 'At temperature 1 the probabilities are the plain softmax of the scores.'}
        {topP && p < 1 && ` Top-p ${fx(p)} keeps only the most likely words whose probabilities add up to ${fx(p)}, here ${keep.size} of ${NEXT.length}, and shares the probability among them.`}
      </p>
    </div>
  )
}

export const AiSoftmax = () => <NextWord topP={false} />
export const AiSampling = () => <NextWord topP />

/** A pixel picture, with more and more noise added: the forward process of diffusion. */
const PIC = [
  '................',
  '......####......',
  '....########....',
  '...##########...',
  '..####.##.####..',
  '..####.##.####..',
  '.##############.',
  '.##############.',
  '.###.######.###.',
  '.####.####.####.',
  '..####....####..',
  '..###########...',
  '...#########....',
  '....#######.....',
  '......###.......',
  '................',
]

export function AiNoise() {
  const [t, setT] = useState(0)
  const eps = useMemo(() => {
    const r = rng(11)
    return Array.from({ length: 256 }, () => {
      const u = Math.max(1e-12, r())
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
    })
  }, [])
  // linear beta schedule over 1,000 steps
  let ab = 1
  for (let s = 1; s <= t; s++) ab *= 1 - (1e-4 + ((0.02 - 1e-4) * (s - 1)) / 999)
  const x0 = PIC.join('').split('').map((ch) => (ch === '#' ? 1 : -1))
  const xt = x0.map((v, i) => Math.sqrt(ab) * v + Math.sqrt(1 - ab) * eps[i])
  const shade = (v: number) => {
    const g = Math.round(255 * (1 - Math.max(0, Math.min(1, (v + 1) / 2))))
    return `rgb(${g},${g},${g})`
  }
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Noise step t" value={t} min={0} max={1000} step={10} onChange={setT} show={(v) => `${v} of 1,000`} />
        <Seg label="Jump to" value={t} options={[[0, '0'], [100, '100'], [300, '300'], [600, '600'], [1000, '1,000']] as const} onChange={setT} />
      </div>
      <div className="kx-two">
        <svg viewBox="0 0 160 160" role="img" aria-label={`A 16 by 16 pixel picture after ${t} noise steps. ${fx(Math.sqrt(ab) * 100, 0)}% of the picture signal is left.`} style={{ maxWidth: 300 }}>
          {xt.map((v, i) => (
            <rect key={i} x={(i % 16) * 10} y={Math.floor(i / 16) * 10} width={10} height={10} fill={shade(v)} />
          ))}
        </svg>
        <div>
          <Bars
            rows={[
              { label: 'picture', value: Math.sqrt(ab), color: C.blue },
              { label: 'noise', value: Math.sqrt(1 - ab), color: C.grey },
            ]}
            max={1}
            fmt={(v) => fx(v, 2)}
          />
          <p className="kx-mono" style={{ margin: '12px 0 0' }}>
            noisy = {fx(Math.sqrt(ab))} × picture + {fx(Math.sqrt(1 - ab))} × noise
          </p>
        </div>
      </div>
      <p className="stat">
        Each step adds a little random noise. After about 1,000 steps nothing of the picture is left. In training, the model sees a noisy picture
        and the step number, and learns to predict the noise that was added. To generate, it starts from pure noise and removes its predicted
        noise one step at a time.
      </p>
    </div>
  )
}
