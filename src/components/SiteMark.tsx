import { useEffect, useRef } from 'react'
import { still } from '../lib/motion'

/**
 * The site logo: a square taken apart into four pieces. One piece, in blue, is pulled out to look at on its own.
 * The pieces bounce softly four times, then travel once round the square, anticlockwise, and land where they started.
 * Each piece moves on an arc, leans into the turn and trails the piece before it a little, so the turn reads as one
 * loose movement, not a machine. The blue piece pulses faintly. Motion stops for readers who ask for less.
 */

/** Top-left corner of each place. Pieces are 27 units square. The top-right place is pulled out. */
const PLACES = [
  [0, 8], // top left
  [0, 41], // bottom left
  [33, 41], // bottom right
  [37, 0], // top right: the blue piece
] as const
/** Pieces in place order. Going up the list is anticlockwise on screen. */
const CENTRE = [31.5, 36]
const polar = (i: number) => {
  const x = PLACES[i][0] + 13.5 - CENTRE[0]
  const y = PLACES[i][1] + 13.5 - CENTRE[1]
  return [Math.atan2(y, x), Math.hypot(x, y)] as const
}

const CYCLE = 7000
/** Parts of the cycle, as fractions: four bounces, a pause, the trip round, the landing. */
const BOUNCES = 0.48
const GO = 0.5
const TRIP = 0.36
const LAG = 0.01

/** In and out, with a small wind-up before the start and a soft overshoot at the end. */
function travel(t: number) {
  const c = 0.5 * 1.525
  return t < 0.5 ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2 : ((2 * t - 2) ** 2 * ((c + 1) * (t * 2 - 2) + c) + 2) / 2
}

/** Offset from home of piece `home` after it has travelled `u` places anticlockwise (u can be a fraction or below 0). */
function offset(home: number, u: number): [number, number] {
  const n = Math.floor(u)
  const f = u - n
  const a = (((home + n) % 4) + 4) % 4
  const b = (a + 1) % 4
  const [a0, r0] = polar(a)
  const [b0, r1] = polar(b)
  let a1 = b0
  while (a1 > a0) a1 -= 2 * Math.PI // anticlockwise on screen: the angle goes down, because y points down
  const ang = a0 + (a1 - a0) * f
  const r = r0 + (r1 - r0) * f + Math.sin(Math.PI * f) * 4 // bulge out, so the path is an arc
  return [CENTRE[0] + r * Math.cos(ang) - PLACES[home][0] - 13.5, CENTRE[1] + r * Math.sin(ang) - PLACES[home][1] - 13.5]
}

/** The transform of piece `home` at time `p`, a fraction of the cycle. */
function pose(home: number, p: number): string {
  if (p < BOUNCES) {
    const y = -2 * (1 - Math.cos(2 * Math.PI * ((p % 0.12) / 0.12)))
    return `translate(0px, ${y}px)`
  }
  // The blue piece leads; the others follow it round.
  const start = GO + ((home + 1) % 4) * LAG
  const t = (p - start) / TRIP
  if (t < -0.04) return 'none'
  if (t < 0) {
    const k = Math.sin(Math.PI * (-t / 0.04)) // crouch before the move
    return `translate(0px, ${k}px) scale(${1 + 0.06 * k}, ${1 - 0.08 * k})`
  }
  if (t <= 1) {
    const [x, y] = offset(home, 4 * travel(t))
    const speed = (4 * (travel(Math.min(1, t + 0.01)) - travel(Math.max(0, t - 0.01)))) / 0.02
    const lean = -Math.max(-9, Math.min(9, speed * 1.6))
    const s = 1 + Math.min(0.05, Math.abs(speed) * 0.007)
    return `translate(${x}px, ${y}px) rotate(${lean}deg) scale(${s}, ${2 - s})`
  }
  // Land: squash, a small rebound, then rest.
  const l = (p - start - TRIP) / 0.09
  if (l >= 1) return 'none'
  const squash = Math.sin(Math.PI * Math.min(1, l / 0.35)) * (1 - l)
  const lift = l > 0.3 ? -2.5 * Math.sin((Math.PI * (l - 0.3)) / 0.7) : 0
  return `translate(0px, ${lift + squash * 0.5}px) scale(${1 + 0.08 * squash}, ${1 - 0.1 * squash})`
}

export default function SiteMark({ size = 22 }: { size?: number }) {
  const pieces = useRef<(SVGRectElement | null)[]>([])
  useEffect(() => {
    if (still) return
    let raf = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      const p = ((now - t0) % CYCLE) / CYCLE
      pieces.current.forEach((el, i) => el?.style.setProperty('transform', pose(i, p)))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])
  const set = (i: number) => (el: SVGRectElement | null) => {
    pieces.current[i] = el
  }
  return (
    <svg viewBox="0 0 64 68" width={(size * 64) / 68} height={size} aria-hidden="true" className="sm" style={{ overflow: 'visible' }}>
      <rect ref={set(0)} x="0" y="8" width="27" height="27" rx="3.5" fill="currentColor" className="sm-p" />
      <rect ref={set(1)} x="0" y="41" width="27" height="27" rx="3.5" fill="currentColor" className="sm-p" />
      <rect ref={set(2)} x="33" y="41" width="27" height="27" rx="3.5" fill="currentColor" className="sm-p" />
      <rect ref={set(3)} x="37" y="0" width="27" height="27" rx="3.5" fill="#2f6bff" className="sm-p sm-blue" />
    </svg>
  )
}
