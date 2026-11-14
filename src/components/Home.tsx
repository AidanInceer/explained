import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LESSONS, TRACKS, lessonById, lessonsOf, trackById, type Lesson, type TrackId } from '../curriculum'
import { nextUp, resetProgress, useProgress } from '../lib/progress'
import BigPicture from './BigPicture'
import TrackLine from './TrackLine'

/* Map geometry. Every lesson sits below all of its prerequisites, so every line runs downward. */
const W = 1180
const ROW = 100
const WIDE = [200, 395, 590, 785, 980]
const TIER1 = 650
const TIER2 = 1430
const TIER3 = 2210
const BAND: Record<TrackId, { x: number[]; y: number }> = {
  foundations: { x: WIDE, y: 70 },
  storage: { x: [44, 232], y: TIER1 },
  modeling: { x: [434, 622], y: TIER1 },
  pipelines: { x: [824, 1012], y: TIER1 },
  processing: { x: [44, 232], y: TIER2 },
  architecture: { x: [434, 622], y: TIER2 },
  ops: { x: [824, 1012], y: TIER2 },
  designs: { x: WIDE, y: TIER3 },
}
const H = TIER3 + 2 * ROW + 96

const pos = (l: Lesson) => ({ x: BAND[l.track].x[l.at[0]], y: BAND[l.track].y + l.at[1] * ROW })

const BUS = 30
const R = 14

/** Lines inside a subject run down, across above the lower lesson's label, then down. Other lines curve. */
function route(a: { x: number; y: number }, b: { x: number; y: number }, same: boolean) {
  if (same) {
    if (a.x === b.x) return `M${a.x} ${a.y} V${b.y}`
    const y = b.y - BUS
    const s = b.x > a.x ? 1 : -1
    return `M${a.x} ${a.y} V${y - R} Q${a.x} ${y} ${a.x + s * R} ${y} H${b.x - s * R} Q${b.x} ${y} ${b.x} ${y + R} V${b.y}`
  }
  if (Math.abs(a.x - b.x) < 1) {
    // Same column in another subject: bow out to the side, so the line does not lie on the column.
    const cx = a.x - 48
    return `M${a.x} ${a.y} C${cx} ${a.y + 70} ${cx} ${b.y - 70} ${b.x} ${b.y}`
  }
  const y0 = a.y + 52
  const ym = (y0 + b.y) / 2
  return `M${a.x} ${a.y} V${y0} C${a.x} ${ym} ${b.x} ${ym} ${b.x} ${b.y}`
}

const EDGES = LESSONS.flatMap((l) =>
  l.prereqs.map((p) => {
    const from = lessonById[p]
    const same = from.track === l.track
    return { key: `${p}>${l.id}`, to: l.id, same, color: trackById[from.track].color, d: route(pos(from), pos(l), same) }
  }),
)

const PILLS = TRACKS.map((t) => {
  const first = lessonsOf(t.id).reduce((m, l) => (l.at[1] < m.at[1] || (l.at[1] === m.at[1] && l.at[0] < m.at[0]) ? l : m))
  const p = pos(first)
  return { t, x: t.id === 'foundations' || t.id === 'designs' ? p.x : BAND[t.id].x[0], y: p.y - 54 }
})

export default function Home() {
  const done = useProgress()
  const next = nextUp(done)
  const [hover, setHover] = useState<string | null>(null)
  const shown = hover ? lessonById[hover] : null
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const started = done.size > 0
  // New readers get the whole system first. Returning readers get the map first.
  const [intro, setIntro] = useState(!started)
  const cta = next ? (
    <Link className="btn primary" to={`/lesson/${next.id}`}>
      {started ? `Continue with “${next.title}”` : 'Start with the first lesson'}
    </Link>
  ) : (
    <Link className="btn primary" to="/glossary">
      Review the glossary
    </Link>
  )

  return (
    <main className="home">
      {intro ? (
        <section className="hero">
          <h1>A customer books a flight. Follow the data.</h1>
          <p className="lead">
            In the next hour, pricing, finance, marketing and the control room all need to know about that booking, and
            each one needs it in a different form. This is the kind of system an airline builds to make that happen.
          </p>
          <BigPicture />
          <div className="hero-after">
            <div>
              <h2>Looks complicated? It is {LESSONS.length} small ideas.</h2>
              <p>
                Each box in the drawing is a lesson on the map below. Select “How we think about it” to see the five
                stages that every data platform has. Then start with the basics. At the end you can design this system
                yourself, and say why each part is there.
              </p>
            </div>
            <div className="hero-go">
              {cta}
              <Link className="link-btn" to="/lesson/case-flight-booking">
                Go directly to the flight booking design
              </Link>
              {started && (
                <button className="link-btn" onClick={() => setIntro(false)}>
                  Hide this introduction
                </button>
              )}
            </div>
          </div>
          <p className="hero-fine">The airline is an invented example. The parts and the practices are the ones that real companies use.</p>
        </section>
      ) : null}

      <section className="home-top">
        <div>
          {intro ? <h2 className="map-title">The map</h2> : <h1>Data engineering, explained</h1>}
          <p className="lead">
            The core ideas, from first principles to whole system designs. Start at the top if you are new. If you
            already do this work, go to the lesson you want to refresh.
          </p>
          {intro ? null : (
            <div className="hero-go row">
              {cta}
              <button className="link-btn" onClick={() => setIntro(true)}>
                Show the whole system again
              </button>
            </div>
          )}
        </div>
        <aside className="board">
          <h2>
            {done.size} of {LESSONS.length} lessons understood
          </h2>
          <div className="meter" role="img" aria-label={`${done.size} of ${LESSONS.length} lessons understood`}>
            {LESSONS.map((l) => (
              <i key={l.id} style={{ background: done.has(l.id) ? (l.track === 'foundations' ? '#b9c6c9' : trackById[l.track].color) : undefined }} />
            ))}
          </div>
          <p>
            Read the map downward. A line into a lesson comes from something that helps to know first. Nothing is locked.
          </p>
          <ul className="legend">
            <li>
              <span className="dot" /> Core lesson
            </li>
            <li>
              <span className="dot deeper" /> Goes deeper (advanced)
            </li>
            <li>
              <span className="dot done" /> Understood
            </li>
            <li>
              <span className="ln thick" /> Same subject
            </li>
            <li>
              <span className="ln" /> From another subject
            </li>
          </ul>
          {started && (
            <button className="link-btn" onClick={() => confirm('Clear all progress in this browser?') && resetProgress()}>
              Clear progress
            </button>
          )}
        </aside>
      </section>

      {/* Small screens: stacked lines */}
      <section className="home-list">
        {TRACKS.map((t) => (
          <div key={t.id} className="home-list-track">
            <h2 style={{ color: t.color }}>{t.name}</h2>
            <p>{t.blurb}</p>
            <TrackLine track={t.id} />
          </div>
        ))}
      </section>

      {/* Wide screens: the map */}
      <div className="map-wrap" ref={wrap} style={{ height: H * scale }}>
        <div className={`map ${shown ? 'has-hover' : ''}`} style={{ width: W, height: H, transform: `scale(${scale})` }}>
          <svg className="map-lines" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {EDGES.filter((e) => !e.same).map((e) => (
              <path key={e.key} d={e.d} stroke={e.color} className={`cross ${hover === e.to ? 'on' : ''}`} />
            ))}
            {EDGES.filter((e) => e.same).map((e) => (
              <path key={e.key} d={e.d} stroke={e.color} className={hover === e.to ? 'on' : ''} />
            ))}
          </svg>

          {PILLS.map(({ t, x, y }) => (
            <span key={t.id} className={`line-name ${shown && shown.track !== t.id ? 'dim' : ''}`} style={{ left: x, top: y, background: t.color }}>
              {t.name}
            </span>
          ))}

          {LESSONS.map((l) => {
            const p = pos(l)
            const isDone = done.has(l.id)
            const isPre = !!shown?.prereqs.includes(l.id)
            const cls = [
              'station',
              (l.track === 'foundations' || l.track === 'designs') && 'wide',
              l.level,
              isDone && 'done',
              next?.id === l.id && 'next',
              isPre && 'prereq',
              hover === l.id && 'hovered',
            ]
              .filter(Boolean)
              .join(' ')
            return (
              <Link
                key={l.id}
                to={`/lesson/${l.id}`}
                className={cls}
                style={{ left: p.x, top: p.y, ['--line' as string]: trackById[l.track].color }}
                onFocus={(e) => {
                  // Keyboard focus only. A mouse press must not light the map.
                  if (!e.currentTarget.matches(':focus-visible')) return
                  setHover(l.id)
                }}
                onBlur={() => setHover(null)}
              >
                <span
                  className="dot"
                  aria-hidden="true"
                  onMouseEnter={() => setHover(l.id)}
                  onMouseLeave={() => setHover(null)}
                />
                <span className="label">
                  <b>{l.title}</b>
                  <small>
                    {isPre ? 'Helps to know first' : isDone ? 'Understood' : next?.id === l.id ? 'Next for you' : `${l.minutes} min`}
                    {l.level === 'deeper' && !isDone && !isPre ? ', deeper' : ''}
                  </small>
                </span>
              </Link>
            )
          })}
        </div>
      </div>

    </main>
  )
}
