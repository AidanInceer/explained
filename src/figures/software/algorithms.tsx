import { useMemo, useState, type ReactNode } from 'react'
import { C, Seg, Slider, StepNav, calm, fx, rng, useTicker } from '../kit'

/* ---------- bits ---------- */

/** Eight switches make a byte. The same bits read as a number, a signed number, hex and a character. */
export function SwBits() {
  const [bits, setBits] = useState([0, 1, 0, 0, 0, 0, 0, 1])
  const [text, setText] = useState('Hé😀')
  const u = bits.reduce((a, b) => a * 2 + b, 0)
  const s = u >= 128 ? u - 256 : u
  const bytes = useMemo(() => [...text].slice(0, 8).map((ch) => ({ ch, b: [...new TextEncoder().encode(ch)] })), [text])
  return (
    <div className="kx">
      <span className="ctl-label">Select a bit to switch it</span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {bits.map((b, i) => (
          <button
            key={i}
            className={`kx-cell ${b ? 'on' : ''}`}
            aria-label={`Bit worth ${2 ** (7 - i)}: ${b}`}
            onClick={() => setBits(bits.map((v, j) => (j === i ? 1 - v : v)))}
            style={{ width: 52, height: 'auto', padding: '6px 0', display: 'grid', gap: 2 }}
          >
            <span style={{ fontSize: 20 }}>{b}</span>
            <small style={{ fontSize: 10.5, opacity: 0.75 }}>{i === 0 ? '128 / −128' : 2 ** (7 - i)}</small>
          </button>
        ))}
      </div>
      <div className="kx-kpis">
        <div className="hl">
          <small>Unsigned whole number</small>
          <b>{u}</b>
        </div>
        <div>
          <small>Signed (two's complement)</small>
          <b>{s}</b>
        </div>
        <div>
          <small>Hexadecimal</small>
          <b>0x{u.toString(16).toUpperCase().padStart(2, '0')}</b>
        </div>
        <div>
          <small>As an ASCII character</small>
          <b>{u >= 33 && u <= 126 ? String.fromCharCode(u) : u === 32 ? 'space' : '–'}</b>
        </div>
      </div>
      <p className="stat">
        The byte does not know what it means. The program that reads it decides: number, signed number or letter. In the signed reading the
        leftmost bit is worth −128, so 1111 1111 is −1.
      </p>
      <label className="sl" style={{ marginTop: 18 }}>
        <span>Type some text to see its UTF-8 bytes</span>
        <input type="text" value={text} maxLength={24} onChange={(e) => setText(e.target.value)} style={{ font: 'inherit', padding: '6px 9px', border: '1px solid var(--rule)', borderRadius: 4 }} />
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
        {bytes.map(({ ch, b }, i) => (
          <div key={i} className="box" style={{ padding: '6px 9px' }}>
            <b style={{ fontSize: 18 }}>{ch === ' ' ? '␠' : ch}</b>
            <div className="kx-mono" style={{ marginTop: 3 }}>
              {b.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
            </div>
            <small style={{ color: 'var(--ink-3)' }}>
              {b.length} byte{b.length > 1 ? 's' : ''}
            </small>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Big O ---------- */

const NS = [10, 100, 1000, 1e4, 1e5, 1e6, 1e9]
const CLASSES: [string, (n: number) => number, string][] = [
  ['O(1)', () => 1, 'look up by key in a hash map'],
  ['O(log n)', (n) => Math.log2(n), 'binary search in sorted data'],
  ['O(n)', (n) => n, 'read every item once'],
  ['O(n log n)', (n) => n * Math.log2(n), 'a good sort'],
  ['O(n²)', (n) => n * n, 'compare every pair'],
  ['O(2ⁿ)', (n) => 2 ** n, 'try every subset'],
]

function dur(steps: number) {
  const s = steps / 1e9 // one billion simple steps a second
  if (!Number.isFinite(s) || s > 1e15) return 'longer than the age of the universe'
  if (s < 1e-6) return `${fx(s * 1e9, 0)} ns`
  if (s < 1e-3) return `${fx(s * 1e6, 0)} µs`
  if (s < 1) return `${fx(s * 1e3, 0)} ms`
  if (s < 120) return `${fx(s, 1)} s`
  if (s < 7200) return `${fx(s / 60, 0)} minutes`
  if (s < 172800) return `${fx(s / 3600, 0)} hours`
  if (s < 3.15e7 * 2) return `${fx(s / 86400, 0)} days`
  return `${s / 3.15e7 < 1e6 ? Math.round(s / 3.15e7).toLocaleString('en-GB') : (s / 3.15e7).toExponential(0)} years`
}

/** How the work of each cost class grows with n, on a log scale, with a time at a billion steps a second. */
export function SwBigO() {
  const [ni, setNi] = useState(2)
  const n = NS[ni]
  const lg = (v: number) => (v <= 1 ? 0 : Math.log10(v))
  const maxLg = 18
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Input size n" value={ni} min={0} max={NS.length - 1} onChange={setNi} show={() => n.toLocaleString('en-GB')} />
      </div>
      <div className="kx-bars" style={{ gap: 7 }}>
        {CLASSES.map(([name, f, eg], i) => {
          const steps = f(n)
          return (
            <div key={name} style={{ gridTemplateColumns: '92px 1fr minmax(120px, 30%)' }}>
              <span className="kx-bl" style={{ fontWeight: 650 }}>
                {name}
                <small style={{ display: 'block', fontFamily: 'var(--sans)', fontWeight: 400, color: 'var(--ink-3)', whiteSpace: 'normal', fontSize: 11 }}>{eg}</small>
              </span>
              <span className="kx-bt" style={{ height: 22 }}>
                <i style={{ width: `${Math.min(100, Math.max(1, (lg(steps) / maxLg) * 100))}%`, background: [C.teal, C.teal, C.blue, C.blue, C.amber, C.red][i] }} />
              </span>
              <span className="kx-bv" style={{ textAlign: 'left' }}>
                {steps > 1e15 ? `about 10^${Math.round(lg(steps))}` : Math.round(steps).toLocaleString('en-GB')} steps
                <small style={{ display: 'block', color: 'var(--ink-3)' }}>{dur(steps)}</small>
              </span>
            </div>
          )
        })}
      </div>
      <p className="stat">
        The bars use a log scale: each tenth of the width is ten times more work. Move n from 1,000 to 1,000,000. O(n) takes 1,000 times longer.
        O(n²) takes a million times longer: from 1 ms to 17 minutes. O(log n) hardly moves. At small n, everything is fast; the class only matters
        when n grows.
      </p>
    </div>
  )
}

/* ---------- linear and binary search ---------- */

const SORTED = (() => {
  const r = rng(4)
  const a: number[] = []
  let v = 2
  for (let i = 0; i < 31; i++) {
    v += 1 + Math.floor(r() * 5)
    a.push(v)
  }
  return a
})()

function searchTrace(target: number) {
  const lin: number[] = []
  for (let i = 0; i < SORTED.length; i++) {
    lin.push(i)
    if (SORTED[i] >= target) break
  }
  const bin: { lo: number; hi: number; mid: number }[] = []
  let lo = 0
  let hi = SORTED.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    bin.push({ lo, hi, mid })
    if (SORTED[mid] === target) break
    if (SORTED[mid] < target) lo = mid + 1
    else hi = mid - 1
  }
  return { lin, bin }
}

/** Linear and binary search on the same sorted list, one comparison per step. */
export function SwSearch() {
  const [ti, setTi] = useState(24)
  const [i, setI] = useState(0)
  const target = SORTED[ti]
  const { lin, bin } = searchTrace(target)
  const n = Math.max(lin.length, bin.length)
  const li = Math.min(i, lin.length - 1)
  const bi = Math.min(i, bin.length - 1)
  const b = bin[bi]
  const row = (title: string, cells: ReactNode, count: number, done: boolean) => (
    <div style={{ marginBottom: 14 }}>
      <h5>
        {title}: {count} comparison{count > 1 ? 's' : ''}
        {done ? ', found' : ''}
      </h5>
      <div className="kx-cells">{cells}</div>
    </div>
  )
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Number to find" value={ti} min={0} max={SORTED.length - 1} onChange={(v) => { setTi(v); setI(0) }} show={() => String(target)} />
      </div>
      <StepNav i={Math.min(i, n - 1)} n={n} set={setI} />
      {row(
        'Linear search',
        SORTED.map((v, k) => (
          <span key={k} className={`kx-cell ${k === lin[li] ? (v === target ? 'hit' : 'hl') : k < lin[li] ? 'out' : ''}`}>
            {v}
          </span>
        )),
        li + 1,
        SORTED[lin[li]] === target,
      )}
      {row(
        'Binary search',
        SORTED.map((v, k) => (
          <span key={k} className={`kx-cell ${k === b.mid ? (v === target ? 'hit' : 'hl') : k < b.lo || k > b.hi ? 'out' : ''}`}>
            {v}
          </span>
        )),
        bi + 1,
        SORTED[b.mid] === target,
      )}
      <p className="stat" role="status">
        Binary search looks at the middle of the part that is left. {SORTED[b.mid] === target ? `It found ${target}.` : `${SORTED[b.mid]} is ${SORTED[b.mid] < target ? 'smaller' : 'larger'} than ${target}, so the ${SORTED[b.mid] < target ? 'left' : 'right'} half cannot hold it and is dropped.`}{' '}
        Each comparison halves the list, so 31 items need at most 5 comparisons, and a million need 20. Linear search may need all 31. Binary search
        works only because the list is sorted.
      </p>
    </div>
  )
}

/* ---------- sorting ---------- */

type Frame = { a: number[]; hl: number[]; done: number; cmp: number; say: string }

function insertionTrace(start: number[]): Frame[] {
  const a = [...start]
  const out: Frame[] = [{ a: [...a], hl: [], done: 1, cmp: 0, say: 'The first item alone is a sorted list.' }]
  let cmp = 0
  for (let i = 1; i < a.length; i++) {
    let j = i
    while (j > 0) {
      cmp++
      if (a[j - 1] > a[j]) {
        ;[a[j - 1], a[j]] = [a[j], a[j - 1]]
        out.push({ a: [...a], hl: [j - 1, j], done: i + 1, cmp, say: `${a[j]} is larger than ${a[j - 1]}: swap them.` })
        j--
      } else {
        out.push({ a: [...a], hl: [j - 1, j], done: i + 1, cmp, say: `${a[j - 1]} is not larger than ${a[j]}: this item is in place.` })
        break
      }
    }
  }
  return out
}

function mergeTrace(start: number[]): Frame[] {
  let a = [...start]
  const out: Frame[] = [{ a: [...a], hl: [], done: 0, cmp: 0, say: 'Each item alone is a sorted run of length 1.' }]
  let cmp = 0
  for (let w = 1; w < a.length; w *= 2) {
    const b = [...a]
    for (let lo = 0; lo < a.length; lo += 2 * w) {
      const mid = Math.min(lo + w, a.length)
      const hi = Math.min(lo + 2 * w, a.length)
      let i = lo
      let j = mid
      let k = lo
      while (i < mid && j < hi) {
        cmp++
        b[k++] = a[i] <= a[j] ? a[i++] : a[j++]
      }
      while (i < mid) b[k++] = a[i++]
      while (j < hi) b[k++] = a[j++]
      const shown = [...b.slice(0, hi), ...a.slice(hi)]
      out.push({ a: shown, hl: Array.from({ length: hi - lo }, (_, q) => lo + q), done: 0, cmp, say: `Merge two sorted runs of ${w} into one run of ${Math.min(2 * w, hi - lo)}.` })
    }
    a = b
  }
  return out
}

/** Insertion sort and merge sort on the same list, with a count of comparisons. */
export function SwSort() {
  const [alg, setAlg] = useState<'ins' | 'merge'>('ins')
  const [n, setN] = useState(16)
  const [seed, setSeed] = useState(2)
  const data = useMemo(() => {
    const r = rng(seed)
    return Array.from({ length: n }, () => 1 + Math.floor(r() * 40))
  }, [n, seed])
  const frames = useMemo(() => (alg === 'ins' ? insertionTrace(data) : mergeTrace(data)), [alg, data])
  const other = useMemo(() => (alg === 'ins' ? mergeTrace(data) : insertionTrace(data)), [alg, data])
  const [i, setI] = useState(0)
  const [run, setRun] = useState(!calm)
  useTicker(run && i < frames.length - 1, alg === 'ins' ? 70 : 500, () => setI((k) => Math.min(frames.length - 1, k + 1)))
  const f = frames[Math.min(i, frames.length - 1)]
  const W = 600 / n
  const restart = () => {
    setI(0)
    setRun(true)
  }
  const last = i >= frames.length - 1
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Seg label="Algorithm" value={alg} options={[['ins', 'Insertion sort'], ['merge', 'Merge sort']] as const} onChange={(v) => { setAlg(v); restart() }} />
        <Seg label="Items" value={n} options={[[8, '8'], [16, '16'], [32, '32'], [64, '64']] as const} onChange={(v) => { setN(v); restart() }} />
      </div>
      <div className="kx-row">
        <button className="act ghost" onClick={() => setRun(!run)} disabled={last}>
          {run ? 'Pause' : 'Play'}
        </button>
        <button className="act ghost" onClick={() => { setRun(false); setI(Math.min(frames.length - 1, i + 1)) }} disabled={last}>
          One step
        </button>
        <button className="act ghost" onClick={() => { setSeed(seed + 1); restart() }}>
          New list
        </button>
      </div>
      <svg viewBox="0 0 600 170" role="img" aria-label={`${alg === 'ins' ? 'Insertion' : 'Merge'} sort of ${n} items. ${f.cmp} comparisons so far.`}>
        {f.a.map((v, k) => (
          <rect
            key={k}
            x={k * W + 1}
            width={W - 2}
            y={160 - v * 3.8}
            height={v * 3.8}
            rx={2}
            fill={f.hl.includes(k) ? C.amber : last || (alg === 'ins' && k < f.done) ? C.blue : C.grey}
          />
        ))}
      </svg>
      <div className="kx-kpis">
        <div className="hl">
          <small>Comparisons so far</small>
          <b>{f.cmp}</b>
        </div>
        <div>
          <small>{alg === 'ins' ? 'Merge sort' : 'Insertion sort'} needs, for this list</small>
          <b>{other[other.length - 1].cmp}</b>
        </div>
      </div>
      <p className="stat" role="status">
        {last
          ? `Sorted with ${f.cmp} comparisons. Try 64 items: insertion sort needs about n²/4, roughly ${Math.round((n * n) / 4)}, and merge sort about n log₂ n, roughly ${Math.round(n * Math.log2(n))}.`
          : f.say}
      </p>
    </div>
  )
}

/* ---------- hash map ---------- */

const hash = (k: string) => {
  let h = 0
  for (const ch of k) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0
  return h
}
const START = ['apple', 'pear', 'plum', 'fig', 'kiwi']

/** Keys go into buckets by hash. Collisions share a bucket; a full table grows. */
export function SwHash() {
  const [keys, setKeys] = useState(START)
  const [size, setSize] = useState(8)
  const [grow, setGrow] = useState(true)
  const [input, setInput] = useState('lime')
  const [find, setFind] = useState<string | null>(null)
  const add = () => {
    const k = input.trim().toLowerCase()
    if (!k || keys.includes(k)) return
    const next = [...keys, k]
    setKeys(next)
    if (grow && next.length / size > 0.75) setSize(size * 2)
    setFind(k)
    setInput('')
  }
  const buckets = Array.from({ length: size }, () => [] as string[])
  for (const k of keys) buckets[hash(k) % size].push(k)
  const longest = Math.max(...buckets.map((b) => b.length))
  const fb = find ? hash(find) % size : -1
  return (
    <div className="kx">
      <div className="kx-row">
        <input
          aria-label="Key to add"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="a key, e.g. lime"
          style={{ font: 'inherit', padding: '6px 9px', border: '1px solid var(--rule)', borderRadius: 4, width: 170 }}
        />
        <button className="act" onClick={add}>
          Add key
        </button>
        <button className="act ghost" onClick={() => { setKeys(START); setSize(8); setFind(null) }}>
          Start again
        </button>
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
          <input type="checkbox" checked={grow} onChange={() => setGrow(!grow)} />
          Double the buckets when more than 75% full
        </label>
      </div>
      {find && (
        <p className="kx-mono" style={{ margin: '0 0 10px' }}>
          hash("{find}") = {hash(find).toLocaleString('en-GB')} → {hash(find).toLocaleString('en-GB')} mod {size} = bucket <b>{fb}</b>
        </p>
      )}
      <div style={{ display: 'grid', gap: 3 }}>
        {buckets.map((b, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span className="kx-mono" style={{ width: 28, textAlign: 'right', color: 'var(--ink-3)' }}>
              {i}
            </span>
            <span className={`kx-cell ${i === fb ? 'hl' : ''}`} style={{ minWidth: 14, height: 26 }} />
            {b.map((k) => (
              <button key={k} className={`kx-cell ${k === find ? 'on' : ''}`} style={{ height: 26 }} onClick={() => setFind(k)}>
                {k}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="kx-kpis">
        <div>
          <small>Keys / buckets</small>
          <b>
            {keys.length} / {size}
          </b>
        </div>
        <div className="hl">
          <small>Load factor</small>
          <b>{fx(keys.length / size)}</b>
        </div>
        <div>
          <small>Longest bucket</small>
          <b>{longest}</b>
        </div>
      </div>
      <p className="stat">
        To find a key, compute its hash, go straight to one bucket and check only the keys there. That is why a lookup costs the same with 10 keys or
        10 million. Two keys in one bucket is a collision: still correct, a little slower. Turn off the doubling and add many keys: the buckets get
        long and lookups slow down towards a plain list. Select a key to see where it lives.
      </p>
    </div>
  )
}

/* ---------- recursion and memoisation ---------- */

type Node = { n: number; kids: Node[]; memo: boolean; order: number; x: number; depth: number }

function fibTree(n: number, memo: boolean) {
  const seen = new Set<number>()
  let order = 0
  let leaf = 0
  const nodes: Node[] = []
  const go = (k: number, depth: number): Node => {
    const node: Node = { n: k, kids: [], memo: false, order: order++, x: 0, depth }
    nodes.push(node)
    if (memo && seen.has(k)) {
      node.memo = true
    } else if (k >= 2) {
      node.kids = [go(k - 1, depth + 1), go(k - 2, depth + 1)]
    }
    if (memo) seen.add(k)
    if (node.kids.length) node.x = (node.kids[0].x + node.kids[node.kids.length - 1].x) / 2
    else node.x = leaf++
    return node
  }
  const root = go(n, 0)
  return { root, nodes, leaves: leaf }
}

const fibCalls = (n: number) => {
  let a = 1
  let b = 1
  for (let i = 0; i < n; i++) [a, b] = [b, a + b]
  return 2 * a - 1
}

/** The call tree of fib(n), with and without a memo of answers already found. */
export function SwFib() {
  const [n, setN] = useState(5)
  const [memo, setMemo] = useState(false)
  const t = useMemo(() => fibTree(n, memo), [n, memo])
  const [shown, setShown] = useState(Infinity)
  const [run, setRun] = useState(false)
  useTicker(run, 260, () => setShown((s) => (s >= t.nodes.length - 1 ? (setRun(false), s) : s + 1)))
  const vis = Math.min(shown, t.nodes.length)
  const W = Math.max(1, t.leaves)
  const maxD = Math.max(...t.nodes.map((q) => q.depth))
  const X = (x: number) => 20 + (x / Math.max(1, W - 1)) * 560
  const Y = (d: number) => 22 + d * (Math.min(46, 210 / Math.max(1, maxD)))
  const edges: ReactNode[] = []
  for (const p of t.nodes) for (const c of p.kids) if (c.order < vis) edges.push(<line key={`${p.order}-${c.order}`} x1={X(p.x)} y1={Y(p.depth)} x2={X(c.x)} y2={Y(c.depth)} stroke="var(--rule)" strokeWidth={1.5} />)
  const rpt = new Map<number, number>()
  for (const q of t.nodes) if (!q.memo) rpt.set(q.n, (rpt.get(q.n) ?? 0) + 1)
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="n" value={n} min={2} max={7} onChange={(v) => { setN(v); setShown(Infinity); setRun(false) }} />
        <Seg label="Remember answers" value={memo ? 1 : 0} options={[[0, 'No memo'], [1, 'With memo']] as const} onChange={(v) => { setMemo(v === 1); setShown(Infinity); setRun(false) }} />
      </div>
      <div className="kx-row">
        <button className="act ghost" onClick={() => { setShown(1); setRun(true) }}>
          Show the calls in order
        </button>
      </div>
      <svg viewBox="0 0 600 260" role="img" aria-label={`Call tree of fib(${n}) ${memo ? 'with' : 'without'} a memo: ${t.nodes.length} calls.`}>
        {edges}
        {t.nodes
          .filter((q) => q.order < vis)
          .map((q) => (
            <g key={q.order}>
              <circle cx={X(q.x)} cy={Y(q.depth)} r={12} fill={q.memo ? '#e6f4ec' : q.n === n - 2 && !memo ? '#fbecc8' : '#fff'} stroke={q.memo ? 'var(--good)' : 'var(--ink)'} strokeWidth={1.5} />
              <text x={X(q.x)} y={Y(q.depth) + 4} textAnchor="middle" className="b" style={{ fontSize: 11 }}>
                {q.n}
              </text>
            </g>
          ))}
      </svg>
      <div className="kx-kpis">
        <div className="hl">
          <small>Calls for fib({n})</small>
          <b>{t.nodes.length}</b>
        </div>
        <div>
          <small>fib(30) without memo</small>
          <b>{fibCalls(30).toLocaleString('en-GB')}</b>
        </div>
        <div>
          <small>fib(30) with memo</small>
          <b>{2 * 30 - 1}</b>
        </div>
      </div>
      <p className="stat">
        {memo
          ? 'Green circles are answers taken from the memo: each value is computed once, so the calls grow in a straight line with n.'
          : `Each call makes two more. fib(${n - 2}) is computed ${rpt.get(n - 2) ?? 0} times (orange): the same work, again and again. The number of calls nearly doubles each time n grows by 1.`}
      </p>
    </div>
  )
}

/* ---------- shortest path ---------- */

const GN = ['Home', 'A', 'B', 'C', 'D', 'E', 'Work']
const GP = [
  [40, 120],
  [170, 40],
  [170, 200],
  [320, 120],
  [450, 40],
  [450, 200],
  [570, 120],
]
const GE: [number, number, number][] = [
  [0, 1, 4],
  [0, 2, 2],
  [1, 3, 5],
  [2, 3, 8],
  [1, 4, 12],
  [3, 4, 2],
  [3, 5, 6],
  [4, 6, 3],
  [5, 6, 2],
]

function dijkstra() {
  const dist = GN.map(() => Infinity)
  const prev = GN.map(() => -1)
  const done = GN.map(() => false)
  dist[0] = 0
  const frames: { dist: number[]; done: boolean[]; cur: number; prev: number[]; relax: number[]; say: string }[] = [
    { dist: [...dist], done: [...done], cur: -1, prev: [...prev], relax: [], say: 'Start: Home is 0 minutes away. Every other place is "unknown" (∞).' },
  ]
  for (;;) {
    let u = -1
    for (let i = 0; i < GN.length; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i
    if (u < 0) break
    done[u] = true
    const relax: number[] = []
    const better: string[] = []
    GE.forEach(([a, b, w], ei) => {
      const v = a === u ? b : b === u ? a : -1
      if (v < 0 || done[v]) return
      relax.push(ei)
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w
        prev[v] = u
        better.push(`${GN[v]} ${dist[v]}`)
      }
    })
    frames.push({
      dist: [...dist],
      done: [...done],
      cur: u,
      prev: [...prev],
      relax,
      say: `The nearest unfinished place is ${GN[u]}, at ${dist[u]}. Its distance is now final. ${better.length ? `Through it, shorter routes are found: ${better.join(', ')}.` : 'It gives no shorter route to any neighbour.'}`,
    })
  }
  return frames
}

/** Dijkstra's algorithm, one place at a time. */
export function SwGraph() {
  const frames = useMemo(dijkstra, [])
  const [i, setI] = useState(0)
  const f = frames[i]
  const pathEdges = new Set<number>()
  if (i === frames.length - 1) {
    let v = 6
    while (f.prev[v] >= 0) {
      const u = f.prev[v]
      pathEdges.add(GE.findIndex(([a, b]) => (a === u && b === v) || (a === v && b === u)))
      v = u
    }
  }
  return (
    <div className="kx">
      <StepNav i={i} n={frames.length} set={setI} />
      <div className="kx-scroll">
        <svg viewBox="0 0 610 240" role="img" aria-label={`Road map with travel times. Step ${i + 1}. ${f.say}`}>
          {GE.map(([a, b, w], ei) => {
            const on = pathEdges.has(ei)
            const rl = f.relax.includes(ei)
            return (
              <g key={ei}>
                <line x1={GP[a][0]} y1={GP[a][1]} x2={GP[b][0]} y2={GP[b][1]} stroke={on ? C.teal : rl ? C.amber : '#c5ccd4'} strokeWidth={on ? 6 : rl ? 4 : 2.5} />
                <rect x={(GP[a][0] + GP[b][0]) / 2 - 11} y={(GP[a][1] + GP[b][1]) / 2 - 10} width={22} height={18} rx={3} fill="#fff" />
                <text x={(GP[a][0] + GP[b][0]) / 2} y={(GP[a][1] + GP[b][1]) / 2 + 4} textAnchor="middle" className="m">
                  {w}
                </text>
              </g>
            )
          })}
          {GN.map((name, v) => (
            <g key={name}>
              <circle cx={GP[v][0]} cy={GP[v][1]} r={24} fill={v === f.cur ? C.amber : f.done[v] ? C.blue : '#fff'} stroke="var(--ink)" strokeWidth={1.5} />
              <text x={GP[v][0]} y={GP[v][1] - 2} textAnchor="middle" className={f.done[v] || v === f.cur ? 'w' : 'b'} style={{ fontSize: 11.5 }}>
                {name}
              </text>
              <text x={GP[v][0]} y={GP[v][1] + 12} textAnchor="middle" className={f.done[v] || v === f.cur ? 'w' : 'm'} style={{ fontSize: 11 }}>
                {f.dist[v] === Infinity ? '∞' : f.dist[v]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="stat" role="status">
        {i === frames.length - 1
          ? `Done. The fastest route to Work takes ${f.dist[6]} minutes (green). It uses four roads. The route with the fewest roads, Home–A–D–Work, takes 19: fewest roads is not the same as shortest time.`
          : f.say}
      </p>
    </div>
  )
}
