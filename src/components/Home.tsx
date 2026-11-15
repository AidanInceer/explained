import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonById, lessonsIn, lessonsOf, type Lesson } from '../data/curriculum'
import { DATA_TRACKS as TRACKS, trackById, type DataTrackId } from '../data/tracks'
import { nextUp, resetProgress, useProgress } from '../lib/progress'
import { quizText, useQuizScores } from '../lib/quizStore'
import SystemDrawing, { GLYPH_D } from './system/SystemDrawing'
import TrackLine from './TrackLine'
import Corners from './Corners'
import { BAND, H, W, WIDE, pos, route } from '../map/layout'

/** The written data engineering lessons. This page is their map. */
const LESSONS = lessonsIn('data')

const EDGES = LESSONS.flatMap((l) =>
  l.prereqs.map((p) => {
    const from = lessonById[p]
    const same = from.track === l.track
    return { key: `${p}>${l.id}`, to: l.id, same, color: trackById[from.track].color, d: route(pos(from), pos(l), same) }
  }),
)

/** Small drawings for the map key: the same shapes as on the map. */
function KeyIcon({ kind }: { kind: 'core' | 'deeper' | 'done' | 'next' | 'same' | 'cross' }) {
  return (
    <svg className="key-icon" viewBox="0 0 24 16" width="24" height="16" aria-hidden="true">
      {kind === 'core' && <rect x="5" y="1.5" width="13" height="13" rx="3" fill="#fff" stroke="var(--ink)" strokeWidth="2.2" />}
      {kind === 'deeper' && <rect x="7" y="3.5" width="9" height="9" rx="1.8" transform="rotate(45 11.5 8)" fill="#fff" stroke="var(--ink)" strokeWidth="2" />}
      {kind === 'done' && (
        <>
          <rect x="5" y="1.5" width="13" height="13" rx="3" fill="var(--ink)" stroke="var(--ink)" strokeWidth="2.2" />
          <path d="M8.3 8.2l2.3 2.3 4.2-4.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === 'next' && (
        <>
          <rect x="5" y="1.5" width="13" height="13" rx="3" fill="#fff" stroke="var(--ink)" strokeWidth="2.2" />
          <rect x="8.2" y="4.7" width="6.6" height="6.6" rx="1.2" fill="#2f6bff" />
        </>
      )}
      {kind === 'same' && <path d="M1 8h22" stroke="var(--ink)" strokeWidth="3.5" strokeLinecap="round" />}
      {kind === 'cross' && <path d="M1 8h22" stroke="#9eaaa5" strokeWidth="1.4" strokeDasharray="3 3" />}
    </svg>
  )
}

/** The same small icon tiles as the system drawing. */
const AimIcon = ({ d }: { d: string }) => (
  <svg className="aim-icon" viewBox="0 0 20 20" width="30" height="30" aria-hidden="true">
    <rect x="0.5" y="0.5" width="19" height="19" rx="3.5" />
    <path d={d} />
  </svg>
)

const PILLS = TRACKS.map((t) => {
  const first = lessonsOf(t.id).reduce((m, l) => (l.at[1] < m.at[1] || (l.at[1] === m.at[1] && l.at[0] < m.at[0]) ? l : m))
  const p = pos(first)
  return { t, x: BAND[t.id].x === WIDE ? p.x : BAND[t.id].x[0], y: p.y - 54 }
})

export default function Home() {
  const done = useProgress()
  const quiz = useQuizScores()
  const next = nextUp(done, LESSONS)
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

  const started = LESSONS.some((l) => done.has(l.id))
  // The drawing is open for new readers. Returning readers open it when they want it.
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
      <section className="hero">
        <h1>Data engineering, explained in small pieces.</h1>
        <p className="lead">
          {LESSONS.length} short lessons that take the whole subject apart: how data is stored, modeled, moved, processed
          and kept correct. Each lesson is one idea, a drawing, and the reason behind each choice.
        </p>
        <ul className="aims">
          <Corners />
          <li>
            <AimIcon d={GLYPH_D.person} />
            <b>Do the job</b>
            Know enough to be useful in a data team: build a pipeline, keep it running, and explain your choices.
          </li>
          <li>
            <AimIcon d={GLYPH_D.plug} />
            <b>Build for yourself</b>
            Make a small pipeline of your own when you need one, with free tools and data that you care about.
          </li>
          <li>
            <AimIcon d={GLYPH_D.model} />
            <b>Steer AI well</b>
            An assistant can write the code. You must know which design is correct for the situation, and see when its
            answer is wrong.
          </li>
        </ul>
        <div className="hero-go row">
          {cta}
          <a className="link-btn" href="#map">
            Go to the lesson map
          </a>
        </div>
      </section>

      <section className="overview">
        <div className="overview-head">
          <div>
            <h2>What all of it builds</h2>
            <p className="lead">
              One invented airline, drawn whole. Sources on the left, users on the right, and everything that a data
              team builds between them.
            </p>
          </div>
          <button className="link-btn" onClick={() => setIntro(!intro)}>
            {intro ? 'Hide the drawing' : 'Show the drawing'}
          </button>
        </div>
        {intro && (
          <>
            <SystemDrawing />
            <div className="hero-after">
              <div>
                <h3>Looks complicated? It is {LESSONS.length} small ideas.</h3>
                <p>
                  Each box in the drawing is a lesson on the map below. Select “Five stages” to see the stages that every
                  data platform has, or follow one journey through it. Then start with the basics. At the end you can design this
                  system yourself, and say why each part is there.
                </p>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="home-top" id="map">
        <div>
          <h2 className="map-title">The lesson map</h2>
          <p className="lead">
            Start at the top if you are new. If you already do this work, go to the lesson that you want to refresh.
            The last two lines put it together: whole system designs, then a project of your own.
          </p>
        </div>
        <aside className="board" aria-label="Your progress and how to read the map">
          <Corners />
          <div className="board-top">
            <h2>Your progress</h2>
            <span>Saved in this browser</span>
          </div>
          <div className="board-body">
            <p className="board-count">
              <b>{LESSONS.filter((l) => done.has(l.id)).length}</b> of {LESSONS.length} lessons understood
            </p>
            {/* One row of squares for each subject. A square fills in the subject's colour when you mark the lesson as understood. */}
            <ul className="board-rows" aria-label="Progress in each subject">
              {TRACKS.map((t) => {
                const ls = lessonsOf(t.id)
                const n = ls.filter((l) => done.has(l.id)).length
                return (
                  <li key={t.id} aria-label={`${t.name}: ${n} of ${ls.length}`}>
                    <span className="board-name">{t.name}</span>
                    <span className="board-sq" aria-hidden="true">
                      {ls.map((l) => (
                        <i key={l.id} className={done.has(l.id) ? 'on' : ''} style={{ ['--line' as string]: t.color }} />
                      ))}
                    </span>
                    <span className="board-n">
                      {n}/{ls.length}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
          <div className="board-key">
            <p>Read the map downward. A line into a lesson comes from something that helps to know first. Nothing is locked.</p>
            <ul className="legend">
              <li>
                <KeyIcon kind="core" /> Core lesson
              </li>
              <li>
                <KeyIcon kind="deeper" /> Goes deeper
              </li>
              <li>
                <KeyIcon kind="done" /> Understood
              </li>
              <li>
                <KeyIcon kind="next" /> Next for you
              </li>
              <li>
                <KeyIcon kind="same" /> Same subject
              </li>
              <li>
                <KeyIcon kind="cross" /> From another subject
              </li>
            </ul>
            {started && (
              <button className="link-btn" onClick={() => confirm('Clear all progress in this browser?') && resetProgress()}>
                Clear progress
              </button>
            )}
          </div>
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
      <div className="map-frame">
        <Corners />
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
              BAND[l.track as DataTrackId].x === WIDE && 'wide',
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
                    {quiz[l.id] && !isPre && <span className="st-quiz">{quizText(quiz[l.id])}</span>}
                  </small>
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      </div>

    </main>
  )
}
