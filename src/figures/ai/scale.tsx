import { useMemo, useState } from 'react'
import { Bars, C, Seg, Slider, fx, rng } from '../kit'

/* ---------- mixture of experts ---------- */

const MOE_TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat', '.', 'def', 'sort', '(', 'x', ')']

/** A router picks k experts for each token. Total parameters grow with the experts; work per token grows with k. */
export function AiMoe() {
  const [E, setE] = useState(8)
  const [k, setK] = useState(2)
  const [t, setT] = useState(1)
  const scores = useMemo(() => {
    const r = rng(31 + E)
    // tokens of one kind tend to like the same experts, as in real routers
    const fav = (tok: number) => (tok < 7 ? [0, 3, 5] : [1, 6, 2]).map((e) => e % E)
    return MOE_TOKENS.map((_, ti) => Array.from({ length: E }, (_, e) => r() * 2 + (fav(ti).includes(e) ? 1.6 : 0)))
  }, [E])
  const probs = scores.map((row) => {
    const m = Math.max(...row)
    const ex = row.map((v) => Math.exp(v - m))
    const z = ex.reduce((a, b) => a + b, 0)
    return ex.map((v) => v / z)
  })
  const chosen = probs.map((p) => p.map((v, e) => [v, e] as const).sort((a, b) => b[0] - a[0]).slice(0, k).map(([, e]) => e))
  const load = Array.from({ length: E }, (_, e) => chosen.filter((c) => c.includes(e)).length)
  const SHARED = 2 // billions: attention, embeddings
  const EXPERT = 5 * (8 / E) // keep total expert size comparable when E changes
  const total = SHARED + E * EXPERT
  const active = SHARED + k * EXPERT
  const cols = E <= 8 ? E : 8
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Seg label="Experts in each layer" value={E} options={[[8, '8'], [16, '16'], [64, '64']] as const} onChange={setE} />
        <Slider label="Experts used per token (k)" value={k} min={1} max={4} onChange={setK} />
      </div>
      <span className="ctl-label">Select a token</span>
      <div className="kx-row" style={{ gap: 4 }}>
        {MOE_TOKENS.map((tok, i) => (
          <button key={i} className={`kx-cell ${i === t ? 'on' : ''}`} onClick={() => setT(i)} aria-pressed={i === t}>
            {tok}
          </button>
        ))}
      </div>
      <div className="kx-two">
        <div>
          <h5>The router's choice for "{MOE_TOKENS[t]}"</h5>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 4 }}>
            {probs[t].map((p, e) => {
              const on = chosen[t].includes(e)
              return (
                <div key={e} className="kx-cell" style={{ height: 'auto', padding: '5px 0', display: 'grid', gap: 1, background: on ? C.blue : '#fff', color: on ? '#fff' : 'var(--ink-3)', borderColor: on ? C.blue : 'var(--rule)' }}>
                  <small style={{ fontSize: 10 }}>E{e + 1}</small>
                  <span style={{ fontSize: 11 }}>{fx(p * 100, 0)}%</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: '8px 0 0' }}>
            The token goes to the {k} expert{k > 1 ? 's' : ''} with the highest router scores (blue). Their outputs are mixed, weighted by the
            scores. The other {E - k} experts do no work for this token.
          </p>
        </div>
        <div>
          <h5>How many of the 12 tokens each expert gets</h5>
          <Bars rows={load.slice(0, 16).map((n, e) => ({ label: `E${e + 1}`, value: n, color: n > (12 * k) / E * 2 ? C.red : C.teal }))} max={12} />
          {E > 16 && <small style={{ color: 'var(--ink-3)' }}>First 16 of {E} experts shown.</small>}
        </div>
      </div>
      <div className="kx-kpis">
        <div>
          <small>Total parameters</small>
          <b>{fx(total, 0)}B</b>
        </div>
        <div className="hl">
          <small>Used for each token</small>
          <b>{fx(active, 1)}B</b>
        </div>
        <div>
          <small>Share of the model that works</small>
          <b>{fx((active / total) * 100, 0)}%</b>
        </div>
      </div>
      <p className="stat">
        The model stores {fx(total, 0)}B parameters, so it needs the memory for all of them, but each token pays the compute of only {fx(active, 1)}B.
        Red bars are experts with more than twice their fair share of tokens. A busy expert slows the batch and the others learn little, so training
        adds a penalty that pushes the router to spread tokens evenly. <i>The numbers are illustrative.</i>
      </p>
    </div>
  )
}

/* ---------- approximate nearest-neighbour search ---------- */

const PTS = (() => {
  const r = rng(77)
  return Array.from({ length: 400 }, () => [r(), r()])
})()
const CENT = (() => {
  // 16 cells: k-means from a jittered grid
  const r = rng(5)
  let c = Array.from({ length: 16 }, (_, i) => [((i % 4) + 0.3 + r() * 0.4) / 4, (Math.floor(i / 4) + 0.3 + r() * 0.4) / 4])
  for (let it = 0; it < 8; it++) {
    const sums = c.map(() => [0, 0, 0])
    for (const p of PTS) {
      const j = nearest(p, c)
      sums[j][0] += p[0]
      sums[j][1] += p[1]
      sums[j][2]++
    }
    c = c.map((q, j) => (sums[j][2] ? [sums[j][0] / sums[j][2], sums[j][1] / sums[j][2]] : q))
  }
  return c
})()
const CELL = PTS.map((p) => nearest(p, CENT))
const CELL_COL = ['#dbe6ff', '#fbecc8', '#d3f0ea', '#ecdffb', '#fde0dc', '#e3ead0', '#f6dcef', '#d9eef6']

function d2(a: number[], b: number[]) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
}
function nearest(p: number[], set: number[][]) {
  let bi = 0
  for (let i = 1; i < set.length; i++) if (d2(p, set[i]) < d2(p, set[bi])) bi = i
  return bi
}
function search(q: number[], probe: number) {
  const order = CENT.map((c, i) => [d2(q, c), i] as const).sort((a, b) => a[0] - b[0]).slice(0, probe).map(([, i]) => i)
  const cand = PTS.map((_, i) => i).filter((i) => order.includes(CELL[i]))
  const best = cand.length ? cand.reduce((b, i) => (d2(q, PTS[i]) < d2(q, PTS[b]) ? i : b), cand[0]) : -1
  return { cells: order, cand: cand.length, best }
}
const TRUE_NN = (q: number[]) => nearest(q, PTS)

/** Exact search compares the query with every vector. An index compares it only with the vectors in a few nearby cells. */
export function AiAnn() {
  const [qi, setQi] = useState(0)
  const [probe, setProbe] = useState(1)
  const queries = useMemo(() => {
    const r = rng(123)
    return Array.from({ length: 300 }, () => [r(), r()])
  }, [])
  const recall = useMemo(
    () => Array.from({ length: 16 }, (_, p) => queries.filter((q) => search(q, p + 1).best === TRUE_NN(q)).length / queries.length),
    [queries],
  )
  const q = queries[qi]
  const res = search(q, probe)
  const truth = TRUE_NN(q)
  const hit = res.best === truth
  const S = 300
  return (
    <div className="kx">
      <div className="kx-ctl">
        <Slider label="Cells to search" value={probe} min={1} max={16} onChange={setProbe} show={(v) => `${v} of 16`} />
        <div className="kx-row" style={{ marginBottom: 0 }}>
          <button className="act" onClick={() => setQi((qi + 1) % queries.length)}>
            New question
          </button>
        </div>
      </div>
      <div className="kx-two">
        <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={`400 document vectors in 16 cells. The search looks in ${probe} cells, compares ${res.cand} vectors, and ${hit ? 'finds' : 'misses'} the true nearest one.`} style={{ maxWidth: 380 }}>
          {PTS.map((p, i) => {
            const on = res.cells.includes(CELL[i])
            return <circle key={i} cx={p[0] * S} cy={p[1] * S} r={3.2} fill={on ? '#5b7fd6' : CELL_COL[CELL[i] % CELL_COL.length]} stroke={on ? 'none' : '#b9c2cc'} strokeWidth={0.6} />
          })}
          {CENT.map((c, i) => (
            <path key={i} d={`M${c[0] * S - 5},${c[1] * S} h10 M${c[0] * S},${c[1] * S - 5} v10`} stroke={res.cells.includes(i) ? C.blue : '#8e98a4'} strokeWidth={2} />
          ))}
          <line x1={q[0] * S} y1={q[1] * S} x2={PTS[truth][0] * S} y2={PTS[truth][1] * S} stroke={C.teal} strokeWidth={2} />
          {!hit && res.best >= 0 && <line x1={q[0] * S} y1={q[1] * S} x2={PTS[res.best][0] * S} y2={PTS[res.best][1] * S} stroke={C.red} strokeWidth={2} strokeDasharray="4 3" />}
          <circle cx={PTS[truth][0] * S} cy={PTS[truth][1] * S} r={6} fill="none" stroke={C.teal} strokeWidth={2.5} />
          <rect x={q[0] * S - 6} y={q[1] * S - 6} width={12} height={12} fill={C.amber} stroke="#fff" strokeWidth={1.5} transform={`rotate(45 ${q[0] * S} ${q[1] * S})`} />
        </svg>
        <div>
          <div className="kx-kpis" style={{ marginTop: 0 }}>
            <div>
              <small>Exact search compares</small>
              <b>400</b>
            </div>
            <div className="hl">
              <small>Index compares</small>
              <b>{16 + res.cand}</b>
            </div>
            <div>
              <small>Found the true nearest?</small>
              <b style={{ color: hit ? 'var(--good)' : 'var(--bad)' }}>{hit ? 'yes' : 'no'}</b>
            </div>
          </div>
          <h5 style={{ marginTop: 14 }}>Recall over 300 questions</h5>
          <Bars rows={[1, 2, 4, 8, 16].map((p) => ({ label: `${p} cell${p > 1 ? 's' : ''}`, value: recall[p - 1], color: p === probe ? C.blue : C.grey }))} max={1} fmt={(v) => `${fx(v * 100, 0)}%`} />
        </div>
      </div>
      <p className="stat">
        The orange diamond is the question's vector; the green ring is the true nearest document. The index has split the 400 vectors into 16 cells,
        each with a centre (+). A search first finds the nearest centres, then compares only the vectors in those cells (blue). Near the edge of a
        cell the true nearest can sit in the next cell, and one cell misses it. Search more cells for better recall, at more cost.
      </p>
    </div>
  )
}
