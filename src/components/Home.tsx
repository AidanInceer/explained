import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LESSONS, TRACKS, lessonById, lessonsOf, trackById, type Lesson, type TrackId } from '../curriculum'
import { nextUp, resetProgress, useProgress } from '../lib/progress'
import TrackLine from './TrackLine'

/* Map geometry. Every lesson sits below all of its prerequisites, so every line runs downward. */
const W = 1180
const ROW = 100
const WIDE = [200, 395, 590, 785, 980]
const TIER1 = 550
const TIER2 = 1230
const TIER3 = 1810
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
const H = TIER3 + ROW + 96

const pos = (l: Lesson) => ({ x: BAND[l.track].x[l.at[0]], y: BAND[l.track].y + l.at[1] * ROW })

const EDGES = LESSONS.flatMap((l) =>
  l.prereqs.map((p) => {
    const from = lessonById[p]
    const a = pos(from)
    const b = pos(l)
    // Run straight down past the label of the upper lesson before the line turns.
    const y0 = a.y + Math.min(52, (b.y - a.y) / 2)
    const ym = (y0 + b.y) / 2
    return {
      key: `${p}>${l.id}`,
      to: l.id,
      same: from.track === l.track,
      color: trackById[from.track].color,
      d: a.x === b.x ? `M${a.x} ${a.y} V${b.y}` : `M${a.x} ${a.y} V${y0} C${a.x} ${ym} ${b.x} ${ym} ${b.x} ${b.y}`,
    }
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
  const [low, setLow] = useState(false)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const started = done.size > 0
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
      <section className="home-top">
        <div>
          <h1>Data engineering, explained</h1>
          <p className="lead">
            A map of the core ideas, from first principles to whole system designs. Start at the top if you are new. If
            you already do this work, go to the lesson you want to refresh.
          </p>
          {cta}
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
            <span key={t.id} className="line-name" style={{ left: x, top: y, background: t.color }}>
              {t.name}
            </span>
          ))}

          {LESSONS.map((l) => {
            const p = pos(l)
            const isDone = done.has(l.id)
            const isPre = !!shown?.prereqs.includes(l.id)
            const cls = [
              'station',
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
                  setLow(e.currentTarget.getBoundingClientRect().top > window.innerHeight - 250)
                }}
                onBlur={() => setHover(null)}
              >
                <span
                  className="dot"
                  aria-hidden="true"
                  onMouseEnter={(e) => {
                    setHover(l.id)
                    setLow(e.currentTarget.getBoundingClientRect().top > window.innerHeight - 250)
                  }}
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

      {shown && (
        <aside className={`hover-card ${low ? 'at-top' : ''}`}aria-live="polite" style={{ ['--line' as string]: trackById[shown.track].color }}>
          <p className="hover-line">
            <span className="pill">{trackById[shown.track].name}</span> {shown.minutes} min
            {shown.level === 'deeper' ? ', goes deeper' : ''}
          </p>
          <h2>{shown.title}</h2>
          <p>{shown.summary}</p>
          <p className="hover-pre">
            {shown.prereqs.length > 0
              ? `Helps to know first: ${shown.prereqs.map((p) => lessonById[p].title).join(', ')}.`
              : 'No earlier lesson is needed.'}
          </p>
        </aside>
      )}
    </main>
  )
}
