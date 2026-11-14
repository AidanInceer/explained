import { useMemo, useState } from 'react'
import { Bars, C, Slider, StepNav, fx } from '../kit'

/* ---------- byte-pair encoding ---------- */

const CORPUS: [string, number][] = [
  ['low', 5],
  ['lower', 2],
  ['newest', 6],
  ['widest', 3],
]
const TRY = ['lowest', 'newer', 'wider', 'slow']

function bpe(rounds: number) {
  let words = CORPUS.map(([w, n]) => ({ sym: [...w.split(''), '_'], n }))
  const merges: { pair: [string, string]; count: number }[] = []
  const states = [words.map((w) => w.sym)]
  for (let r = 0; r < rounds; r++) {
    const counts = new Map<string, number>()
    for (const w of words)
      for (let i = 0; i < w.sym.length - 1; i++) {
        const k = `${w.sym[i]}\u0000${w.sym[i + 1]}`
        counts.set(k, (counts.get(k) ?? 0) + w.n)
      }
    let top = ''
    let best = 0
    for (const [k, v] of counts) if (v > best) [top, best] = [k, v]
    if (!top) break
    const [a, b] = top.split('\u0000') as [string, string]
    merges.push({ pair: [a, b], count: best })
    words = words.map((w) => {
      const out: string[] = []
      for (let i = 0; i < w.sym.length; i++) {
        if (i < w.sym.length - 1 && w.sym[i] === a && w.sym[i + 1] === b) {
          out.push(a + b)
          i++
        } else out.push(w.sym[i])
      }
      return { sym: out, n: w.n }
    })
    states.push(words.map((w) => w.sym))
  }
  return { merges, states }
}

function apply(word: string, merges: { pair: [string, string] }[]) {
  let sym = [...word.split(''), '_']
  for (const { pair: [a, b] } of merges) {
    const out: string[] = []
    for (let i = 0; i < sym.length; i++) {
      if (i < sym.length - 1 && sym[i] === a && sym[i + 1] === b) {
        out.push(a + b)
        i++
      } else out.push(sym[i])
    }
    sym = out
  }
  return sym
}

const TOKC = ['#dbe6ff', '#fbecc8', '#d3f0ea', '#ecdffb', '#fde0dc']
function Toks({ t }: { t: string[] }) {
  return (
    <span className="kx-tok">
      {t.map((s, i) => (
        <span key={i} style={{ background: s.length > 1 ? TOKC[i % TOKC.length] : '#f1f3f5', fontWeight: s.length > 1 ? 650 : 400 }}>
          {s}
        </span>
      ))}
    </span>
  )
}

/** Byte-pair encoding: merge the most frequent pair of symbols, again and again. */
export function AiBpe() {
  const { merges, states } = useMemo(() => bpe(10), [])
  const [i, setI] = useState(0)
  const done = merges.slice(0, i)
  const base = new Set(CORPUS.flatMap(([w]) => [...w.split(''), '_'])).size
  return (
    <div className="kx">
      <StepNav i={i} n={states.length} set={setI} />
      <div className="kx-two">
        <div>
          <h5>Training text (word × times seen)</h5>
          <ul className="kx-list">
            {CORPUS.map(([w, n], k) => (
              <li key={w} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <Toks t={states[i][k]} />
                <span className="kx-mono">× {n}</span>
              </li>
            ))}
          </ul>
          <h5 style={{ marginTop: 14 }}>New words, cut with the merges learned so far</h5>
          <ul className="kx-list">
            {TRY.map((w) => {
              const t = apply(w, done)
              return (
                <li key={w} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                  <Toks t={t} />
                  <span className="kx-mono">{t.length} tokens</span>
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h5>Merges, in order</h5>
          <ol className="kx-list" style={{ listStyle: 'none' }}>
            {done.length === 0 && <li>None yet: every character is its own token.</li>}
            {done.map((m, k) => (
              <li key={k} className={k === i - 1 ? 'now' : undefined}>
                <span className="kx-mono">
                  {k + 1}. {m.pair[0]} + {m.pair[1]} → {m.pair[0] + m.pair[1]}
                </span>{' '}
                <small style={{ color: 'var(--ink-3)' }}>seen {m.count}×</small>
              </li>
            ))}
          </ol>
          <div className="kx-kpis">
            <div className="hl">
              <small>Vocabulary size</small>
              <b>{base + i}</b>
            </div>
          </div>
        </div>
      </div>
      <p className="stat" role="status">
        {i === 0
          ? 'Start with single characters. "_" marks the end of a word. Each step counts every pair of neighbouring symbols, weighted by how often the word appears, and merges the most frequent pair into one new token.'
          : `Step ${i}: "${done[i - 1].pair[0]}" and "${done[i - 1].pair[1]}" appear side by side ${done[i - 1].count} times, more than any other pair, so they become one token. Frequent words end up as one token; rare words, like "slow", stay in pieces.`}
      </p>
    </div>
  )
}

/* ---------- attention ---------- */

const WORDS = ['The', 'animal', 'did', 'not', 'cross', 'the', 'street', 'because', 'it', 'was', 'too']

/** Illustrative attention scores. Before softmax; every word also scores 1 for itself. */
function scores(q: number, end: 'tired' | 'wide', causal: boolean): Record<number, number> {
  const tired = end === 'tired'
  switch (q) {
    case 0: return { 1: 2.5 }
    case 1: return tired ? { 0: 2, 4: 1.5, 11: 2 } : { 0: 2, 4: 1.5 }
    case 2: return { 3: 2, 4: 2 }
    case 3: return { 2: 2.5, 4: 2 }
    case 4: return { 1: 2.5, 6: 2.2, 3: 1.5 }
    case 5: return { 6: 2.5 }
    case 6: return tired ? { 5: 2, 4: 2.2 } : { 5: 2, 4: 2.2, 11: 2 }
    case 7: return { 4: 1.5, 11: 1.5, 8: 1 }
    case 8: return causal ? { 1: 2.4, 6: 2.3 } : tired ? { 1: 3.4, 6: 1, 11: 1.6 } : { 6: 3.4, 1: 1, 11: 1.6 }
    case 9: return { 8: 2.5, 11: 2 }
    case 10: return { 11: 2.8, 9: 1 }
    default: return tired ? { 8: 2.6, 1: 2.9, 9: 1.2 } : { 8: 2.6, 6: 2.9, 9: 1.2 }
  }
}

export function AiAttention() {
  const [q, setQ] = useState(8)
  const [end, setEnd] = useState<'tired' | 'wide'>('tired')
  const [causal, setCausal] = useState(false)
  const toks = [...WORDS, end]
  const s = scores(q, end, causal)
  const raw = toks.map((_, j) => (causal && j > q ? -Infinity : (s[j] ?? 0) + (j === q ? 1 : 0)))
  const mx = Math.max(...raw)
  const e = raw.map((v) => (v === -Infinity ? 0 : Math.exp(v - mx)))
  const z = e.reduce((a, b) => a + b, 0)
  const wts = e.map((v) => v / z)
  const top = wts.map((w, j) => [w, j] as const).filter(([, j]) => j !== q).sort((a, b) => b[0] - a[0])[0]
  return (
    <div className="kx">
      <div className="kx-row">
        <div className="seg">
          <button aria-pressed={end === 'tired'} onClick={() => setEnd('tired')}>
            … too tired
          </button>
          <button aria-pressed={end === 'wide'} onClick={() => setEnd('wide')}>
            … too wide
          </button>
        </div>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" checked={causal} onChange={() => setCausal(!causal)} />
          Causal mask: a word sees only the words before it
        </label>
      </div>
      <span className="ctl-label">Select a word to see where it looks</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {toks.map((t, j) => (
          <button
            key={j}
            onClick={() => setQ(j)}
            aria-pressed={q === j}
            className="kx-cell"
            style={{
              height: 'auto',
              padding: '6px 8px 4px',
              display: 'grid',
              gap: 3,
              background: `rgba(36, 86, 214, ${wts[j] * 0.9})`,
              color: wts[j] > 0.35 ? '#fff' : 'var(--ink)',
              borderColor: q === j ? 'var(--ink)' : 'var(--rule)',
              borderWidth: q === j ? 2 : 1,
              opacity: causal && j > q ? 0.35 : 1,
              fontFamily: 'var(--sans)',
              fontSize: 15,
            }}
          >
            {t}
            <small className="kx-num" style={{ fontSize: 11 }}>
              {causal && j > q ? 'hidden' : `${fx(wts[j] * 100, 0)}%`}
            </small>
          </button>
        ))}
      </div>
      <Bars rows={toks.map((t, j) => ({ label: t, value: wts[j], color: j === q ? C.grey : C.blue, dim: causal && j > q }))} max={1} fmt={(v) => `${fx(v * 100, 0)}%`} />
      <p className="stat">
        The query word "{toks[q]}" compares itself with every key, and softmax turns the scores into weights that add up to 100%. Its new vector is
        the weighted mix of the other words' values: here mostly "{toks[top[1]]}".
        {q === 8 && !causal && ` Change the last word: "it" now looks at "${end === 'tired' ? 'animal' : 'street'}", because a ${end} thing is more likely to be ${end === 'tired' ? 'an animal' : 'a street'}.`}
        {q === 8 && causal && ' With the mask, "it" cannot see the last word yet, so it cannot tell which noun it means. The later words, such as "' + end + '", settle it.'}{' '}
        <i>The weights here are made up to show the idea. A real model has many heads and layers, each with its own pattern.</i>
      </p>
    </div>
  )
}

/* ---------- number formats ---------- */

function roundFloat(v: number, mant: number, minExp: number, maxVal: number) {
  if (v === 0) return 0
  const s = Math.sign(v)
  const a = Math.abs(v)
  if (a > maxVal) return s * Infinity
  const e = Math.max(minExp, Math.floor(Math.log2(a)))
  const step = 2 ** (e - mant)
  return s * Math.round(a / step) * step
}

const FORMATS = [
  { name: 'float32', bits: 32, q: (v: number) => Math.fround(v), note: '8 exponent bits, 23 fraction bits' },
  { name: 'bfloat16', bits: 16, q: (v: number) => roundFloat(v, 7, -126, 3.39e38), note: '8 exponent bits, 7 fraction bits: same range as float32' },
  { name: 'float16', bits: 16, q: (v: number) => roundFloat(v, 10, -14, 65504), note: '5 exponent bits, 10 fraction bits: largest value 65,504' },
  { name: 'int8', bits: 8, q: (v: number, r = 4) => Math.max(-127, Math.min(127, Math.round((v / r) * 127))) * (r / 127), note: '256 levels spread over the range ±4 (one scale for the whole tensor)' },
]

/** One weight, stored in four formats. Fewer bits, bigger rounding steps, less memory. */
export function AiNumbers() {
  const [v, setV] = useState(0.1234)
  const [big, setBig] = useState(false)
  const val = big ? v * 1000 : v
  const params = 7e9
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Value to store" value={v} min={-4} max={4} step={0.0001} onChange={setV} show={() => String(+val.toFixed(4))} />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" checked={big} onChange={() => setBig(!big)} />
          Multiply by 1,000 (an outlier)
        </label>
      </div>
      <table className="tbl">
        <thead>
          <tr>
            <th>Format</th>
            <th>Stored as</th>
            <th>Error</th>
            <th>7B-parameter model</th>
          </tr>
        </thead>
        <tbody>
          {FORMATS.map((f) => {
            const st = f.q(val)
            const err = Math.abs(st - val)
            return (
              <tr key={f.name} className={f.name === 'int8' && big ? 'err' : undefined}>
                <th title={f.note}>
                  {f.name}
                  <small style={{ display: 'block', fontWeight: 400, color: 'var(--ink-3)', whiteSpace: 'normal', fontSize: 11.5 }}>{f.note}</small>
                </th>
                <td>{Number.isFinite(st) ? +st.toPrecision(8) : 'overflow'}</td>
                <td>{err === 0 ? '0' : err < 1e-6 ? err.toExponential(1) : +err.toPrecision(2)}</td>
                <td>{fx((params * f.bits) / 8 / 1e9, 0)} GB</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="stat">
        Each format can only store certain numbers; any other value is rounded to the nearest one it has. Fewer bits means fewer numbers, so bigger
        rounding errors, but half or a quarter of the memory, and memory is what limits speed. {big ? 'The outlier is outside the int8 range of ±4, so int8 clips it to 4. One large value can force a coarse scale on every other value in the tensor.' : 'Turn on the outlier to see why int8 needs care.'}
      </p>
    </div>
  )
}
