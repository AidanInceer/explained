import { useEffect, useRef, type ReactNode } from 'react'
import { still } from '../lib/motion'

/** Shared parts for the interactive figures of software engineering and AI. */

/** Series colours. Figures stay light in dark mode, so fixed colours are safe here. */
export const C = { blue: '#2456d6', amber: '#b97700', teal: '#0b8a78', red: '#b3261e', purple: '#7a3fd1', grey: '#9ea7b2' }

/** A labelled range input. `show` formats the value next to the label. */
export function Slider(p: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  show?: (v: number) => ReactNode
}) {
  return (
    <label className="sl">
      <span>
        {p.label} <b>{p.show ? p.show(p.value) : p.value}</b>
      </span>
      <input type="range" min={p.min} max={p.max} step={p.step ?? 1} value={p.value} onChange={(e) => p.onChange(Number(e.target.value))} />
    </label>
  )
}

/** A row of mutually exclusive buttons. */
export function Seg<T extends string | number>(p: { label?: string; value: T; options: readonly (readonly [T, string])[]; onChange: (v: T) => void }) {
  return (
    <div>
      {p.label && <span className="ctl-label">{p.label}</span>}
      <div className="seg">
        {p.options.map(([v, text]) => (
          <button key={String(v)} aria-pressed={p.value === v} onClick={() => p.onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Back, next and a counter for figures that go one step at a time. */
export function StepNav(p: { i: number; n: number; set: (i: number) => void; extra?: ReactNode }) {
  return (
    <div className="kx-nav">
      <button className="act ghost" disabled={p.i === 0} onClick={() => p.set(p.i - 1)}>
        Back
      </button>
      <button className="act" disabled={p.i >= p.n - 1} onClick={() => p.set(p.i + 1)}>
        Next step
      </button>
      <span>
        {p.i + 1} of {p.n}
      </span>
      {p.extra}
    </div>
  )
}

/** Calls `fn` every `ms` while `on` is true. Never runs when the reader asks for reduced motion and has not pressed play. */
export function useTicker(on: boolean, ms: number, fn: () => void) {
  const f = useRef(fn)
  f.current = fn
  useEffect(() => {
    if (!on) return
    const id = setInterval(() => f.current(), ms)
    return () => clearInterval(id)
  }, [on, ms])
}

/** True when animations should not start by themselves. */
export const calm = still

/** A small seeded random number generator, so a figure shows the same data on each visit. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A normal random number from two uniform ones (Box–Muller). */
export function gauss(r: () => number) {
  const u = Math.max(1e-12, r())
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

/** Linear map from one range to another. */
export const scale = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0)

/** Horizontal bars with a label and a value. */
export function Bars(p: { rows: { label: ReactNode; value: number; color?: string; dim?: boolean; note?: ReactNode }[]; max?: number; fmt?: (v: number) => string }) {
  const max = p.max ?? Math.max(1e-9, ...p.rows.map((r) => r.value))
  return (
    <div className="kx-bars">
      {p.rows.map((r, i) => (
        <div key={i} className={r.dim ? 'dim' : undefined}>
          <span className="kx-bl">{r.label}</span>
          <span className="kx-bt">
            <i style={{ width: `${Math.min(100, (r.value / max) * 100)}%`, background: r.color ?? 'var(--line)' }} />
          </span>
          <span className="kx-bv">
            {p.fmt ? p.fmt(r.value) : r.value}
            {r.note}
          </span>
        </div>
      ))}
    </div>
  )
}

/** Plain-number formatting with a fixed number of decimals and no "-0". */
export const fx = (v: number, d = 2) => {
  const s = v.toFixed(d)
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s
}
