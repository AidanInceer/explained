import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BRANCH_TRACKS, LESSONS, TRACKS, lessonById, lessonsOf, trackById, type Lesson } from '../curriculum'
import { nextUp, resetProgress, useProgress } from '../lib/progress'
import TrackLine from './TrackLine'

const W = 1180
const COL_X = (i: number) => 60 + i * 185
const TRUNK_X = 522
const TRUNK_Y = [70, 160, 250]
const BUS_Y = 350
const FIRST_Y = 466
const STEP = 104

function pos(l: Lesson) {
  const idx = lessonsOf(l.track).indexOf(l)
  if (l.track === 'foundations') return { x: TRUNK_X, y: TRUNK_Y[idx] }
  const col = BRANCH_TRACKS.findIndex((t) => t.id === l.track)
  return { x: COL_X(col), y: FIRST_Y + idx * STEP }
}

const maxRows = Math.max(...BRANCH_TRACKS.map((t) => lessonsOf(t.id).length))
const H = FIRST_Y + (maxRows - 1) * STEP + 90

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
      {/* Small screens: stacked lines */}
      <section className="home-list">
        <h1>Data engineering, explained</h1>
        <p className="lead">
          A map of the core ideas. Start at the top if you are new. If you already do this work, go to the lesson you
          want to refresh.
        </p>
        {cta}
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
        <div className="map" style={{ width: W, height: H, transform: `scale(${scale})` }}>
          <div className="map-intro">
            <h1>
              Data engineering,
              <br />
              explained
            </h1>
            <p className="lead">
              A map of the core ideas. Start at the top if you are new. If you already do this work, go to the lesson
              you want to refresh.
            </p>
            {cta}
          </div>

          <aside className="board" aria-live="polite">
            {shown ? (
              <>
                <p className="board-line" style={{ color: trackById[shown.track].color }}>
                  {trackById[shown.track].name} line, {shown.minutes} min{shown.level === 'deeper' ? ', goes deeper' : ''}
                </p>
                <h2>{shown.title}</h2>
                <p>{shown.summary}</p>
                {shown.prereqs.length > 0 && (
                  <p className="board-pre">Helps to know first: {shown.prereqs.map((p) => lessonById[p].title).join(', ')}</p>
                )}
              </>
            ) : (
              <>
                <h2>
                  {done.size} of {LESSONS.length} lessons understood
                </h2>
                <div className="meter" role="img" aria-label={`${done.size} of ${LESSONS.length} lessons understood`}>
                  {LESSONS.map((l) => (
                    <i key={l.id} style={{ background: done.has(l.id) ? (l.track === 'foundations' ? '#b9c6c9' : trackById[l.track].color) : undefined }} />
                  ))}
                </div>
                <p>
                  Each line is one subject. Nothing is locked. Point at a lesson to see what it covers and what helps to
                  know first.
                </p>
                <ul className="legend">
                  <li>
                    <span className="dot" /> Core lesson
                  </li>
                  <li>
                    <span className="dot deeper" /> Goes deeper
                  </li>
                  <li>
                    <span className="dot done" /> Understood
                  </li>
                </ul>
                {started && (
                  <button className="link-btn" onClick={() => confirm('Clear all progress in this browser?') && resetProgress()}>
                    Clear progress
                  </button>
                )}
              </>
            )}
          </aside>

          <svg className="map-lines" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
            {BRANCH_TRACKS.map((t, i) => {
              const n = lessonsOf(t.id).length
              const edge = i === 0 || i === BRANCH_TRACKS.length - 1
              return (
                <path
                  key={t.id}
                  d={`M${COL_X(i)} ${BUS_Y + (edge ? 22 : 0)} V${FIRST_Y + (n - 1) * STEP}`}
                  stroke={t.color}
                />
              )
            })}
            <path d={`M${TRUNK_X} ${TRUNK_Y[0]} V${BUS_Y}`} stroke="var(--ink)" />
            <path
              d={`M${COL_X(0)} ${BUS_Y + 22} Q${COL_X(0)} ${BUS_Y} ${COL_X(0) + 22} ${BUS_Y} H${COL_X(5) - 22} Q${COL_X(5)} ${BUS_Y} ${COL_X(5)} ${BUS_Y + 22}`}
              stroke="var(--ink)"
            />
          </svg>

          <span className="line-name trunk-name" style={{ left: TRUNK_X, top: 16 }}>
            Foundations
          </span>
          {BRANCH_TRACKS.map((t, i) => (
            <span key={t.id} className="line-name" style={{ left: COL_X(i), top: BUS_Y + 50, background: t.color }}>
              {t.name}
            </span>
          ))}

          {LESSONS.map((l) => {
            const p = pos(l)
            const isDone = done.has(l.id)
            const cls = [
              'station',
              l.level,
              isDone && 'done',
              next?.id === l.id && 'next',
              shown?.prereqs.includes(l.id) && 'prereq',
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
                onMouseEnter={() => setHover(l.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(l.id)}
                onBlur={() => setHover(null)}
              >
                <span className="dot" aria-hidden="true" />
                <span className="label">
                  <b>{l.title}</b>
                  <small>
                    {isDone ? 'Understood' : next?.id === l.id ? 'Next for you' : `${l.minutes} min`}
                    {l.level === 'deeper' && !isDone ? ', deeper' : ''}
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
