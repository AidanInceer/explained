import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonById, lessonsIn } from '../data/curriculum'
import { PROPOSE_LESSON_URL } from '../data/site'
import { countsOf, type Subject } from '../data/subjects'
import { layoutPlan, type PlanMapLayout, type PlacedLesson } from '../map/plan-layout'
import { nextUp, useProgress } from '../lib/progress'
import { quizText, useQuizScores } from '../lib/quizStore'
import Corners from './Corners'
import PlanSystem from './system/PlanSystem'

/**
 * The map of a subject whose lines come from a plan (software engineering, AI). A lesson with text is a link,
 * drawn like the data engineering map. A lesson with no text yet is a dashed stop.
 */
function PlanMap({ map, next }: { map: PlanMapLayout; next?: string }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [hover, setHover] = useState<string | null>(null)
  const done = useProgress()
  const quiz = useQuizScores()
  const shown = hover ? map.byId[hover] : null

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / map.W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [map.W])

  const stop = (l: PlacedLesson) => {
    const written = lessonById[l.id]
    const isPre = !!shown?.prereqs?.includes(l.id)
    const isDone = !!written && done.has(l.id)
    const cls = [
      'station',
      !written && 'planned',
      l.wide && 'wide',
      l.level ?? 'core',
      isDone && 'done',
      next === l.id && 'next',
      isPre && 'prereq',
      hover === l.id && 'hovered',
    ]
      .filter(Boolean)
      .join(' ')
    const status = isPre
      ? 'Helps to know first'
      : !written
        ? l.level === 'deeper'
          ? 'Planned, deeper'
          : 'Planned'
        : isDone
          ? 'Understood'
          : next === l.id
            ? 'Next for you'
            : `${written.minutes} min${l.level === 'deeper' ? ', deeper' : ''}`
    const inner = (
      <>
        <span className="dot" aria-hidden="true" onMouseEnter={() => setHover(l.id)} onMouseLeave={() => setHover(null)} />
        <span className="label">
          <b>{l.title}</b>
          <small>
            {status}
            {written && quiz[l.id] && !isPre && <span className="st-quiz">{quizText(quiz[l.id])}</span>}
          </small>
        </span>
      </>
    )
    const common = {
      className: cls,
      style: { left: l.x, top: l.y, ['--line' as string]: l.line.color },
      onFocus: () => setHover(l.id),
      onBlur: () => setHover(null),
    }
    return written ? (
      <Link key={l.id} to={`/lesson/${l.id}`} {...common} title={l.summary}>
        {inner}
      </Link>
    ) : (
      <div key={l.id} {...common} tabIndex={0} title={`${l.summary} Planned: no lesson text yet.`} aria-label={`${l.title}. Planned. ${l.summary}`}>
        {inner}
      </div>
    )
  }

  return (
    <div className="map-frame">
      <Corners />
      <div className="map-wrap" ref={wrap} style={{ height: map.H * scale }}>
        <div className={`map ${shown ? 'has-hover' : ''}`} style={{ width: map.W, height: map.H, transform: `scale(${scale})` }}>
          <svg className="map-lines" width={map.W} height={map.H} viewBox={`0 0 ${map.W} ${map.H}`} aria-hidden="true">
            {map.edges.filter((e) => !e.same).map((e) => (
              <path key={e.key} d={e.d} stroke={e.color} className={`cross ${hover === e.to ? 'on' : ''}`} />
            ))}
            {map.edges.filter((e) => e.same).map((e) => (
              <path key={e.key} d={e.d} stroke={e.color} className={`${hover === e.to ? 'on' : ''} ${lessonById[e.to] ? '' : 'todo'}`} />
            ))}
          </svg>

          {map.pills.map(({ line, x, y }) => (
            <span key={line.name} className={`line-name ${shown && shown.line !== line ? 'dim' : ''}`} style={{ left: x, top: y, background: line.color }}>
              {line.name}
            </span>
          ))}

          {map.lessons.map(stop)}
        </div>
      </div>
    </div>
  )
}

/** A subject whose map comes from a plan: the system drawing, then the map of lessons, written or planned. */
export default function SubjectPlan({ subject }: { subject: Subject }) {
  const map = useMemo(() => layoutPlan(subject.lines), [subject])
  const titles = useMemo(() => Object.fromEntries(map.lessons.map((l) => [l.id, l.title])), [map])
  const done = useProgress()
  const { written, total, lines } = countsOf(subject)
  const lessons = lessonsIn(subject.id)
  const next = written ? nextUp(done, lessons) : undefined
  const started = lessons.some((l) => done.has(l.id))
  return (
    <main className="home plan">
      <section className="hero">
        <p className="plan-tag up">
          {written === 0 ? (
            <>
              <span>Planned</span> {total} lessons on {lines} lines. No lesson text yet.
            </>
          ) : written < total ? (
            <>
              <span>In progress</span> {written} of {total} lessons written, on {lines} lines.
            </>
          ) : (
            <>
              {total} lessons on {lines} lines.
            </>
          )}
        </p>
        <h1 className="up" style={{ animationDelay: '0.08s' }}>
          {subject.headline}
        </h1>
        <p className="lead up" style={{ animationDelay: '0.2s' }}>
          {subject.lead}
        </p>
        <div className="hero-go row up" style={{ animationDelay: '0.3s' }}>
          {next ? (
            <Link className="btn primary" to={`/lesson/${next.id}`}>
              {started ? `Continue with “${next.title}”` : 'Start with the first lesson'}
            </Link>
          ) : (
            <a className="btn primary" href={PROPOSE_LESSON_URL} target="_blank" rel="noreferrer">
              Propose or write a lesson
            </a>
          )}
          <a className="link-btn" href="#plan-map">
            Go to the lesson map
          </a>
        </div>
      </section>

      {subject.system && (
        <section className="overview" aria-labelledby="plan-system">
          <div className="overview-head">
            <div>
              <h2 id="plan-system">{subject.system.title}</h2>
              <p className="lead">{subject.system.lead}</p>
            </div>
          </div>
          <PlanSystem sys={subject.system} titles={titles} />
        </section>
      )}

      <section className="plan-head" aria-labelledby="plan-map">
        <div>
          <h2 className="map-title" id="plan-map">
            The lesson map
          </h2>
          <p className="lead">
            Read it downward. A line into a lesson comes from something that helps to know first. Nothing is locked.
            {written < total && ' A dashed stop is planned: it has a title, and no text yet.'}
          </p>
        </div>
        <ul className="legend plan-legend" aria-label="Key">
          <li>
            <i className="plan-key core" aria-hidden="true" /> Core lesson
          </li>
          <li>
            <i className="plan-key deeper" aria-hidden="true" /> Goes deeper
          </li>
          {written < total && (
            <li>
              <i className="plan-key todo" aria-hidden="true" /> Planned
            </li>
          )}
        </ul>
      </section>

      <PlanMap map={map} next={next?.id} />

      {/* Small screens: each line as a list. */}
      <div className="home-list">
        <div className="plan-frame">
          <div className="plan-map">
            {subject.lines.map((line) => (
              <section key={line.name} className="plan-line" style={{ ['--line' as string]: line.color }}>
                <h3>
                  <span className="line-name">{line.name}</span>
                </h3>
                <p>{line.blurb}</p>
                <ol>
                  {line.lessons.map((l) => {
                    const w = lessonById[l.id]
                    const body = (
                      <>
                        <span className={`plan-stop ${w ? 'is-written' : ''} ${w && done.has(l.id) ? 'is-done' : ''}`} aria-hidden="true" />
                        <span>
                          <b>{l.title}</b>
                          <small>
                            {l.summary}
                            {l.level === 'deeper' ? ' Goes deeper.' : ''}
                            {w ? '' : ' Planned.'}
                          </small>
                        </span>
                      </>
                    )
                    return (
                      <li key={l.id} className={l.level ?? 'core'}>
                        {w ? <Link to={`/lesson/${l.id}`}>{body}</Link> : body}
                      </li>
                    )
                  })}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
