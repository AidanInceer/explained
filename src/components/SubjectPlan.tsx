import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { PROPOSE_LESSON_URL } from '../data/site'
import type { Subject } from '../data/subjects'
import { layoutPlan, type PlanMapLayout } from '../map/plan-layout'
import Corners from './Corners'

/** The planned map, drawn like the data engineering map. Stops are not links yet: the lessons have no text. */
function PlanMap({ map }: { map: PlanMapLayout }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [hover, setHover] = useState<string | null>(null)
  const shown = hover ? map.byId[hover] : null

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / map.W)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [map.W])

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
              <path key={e.key} d={e.d} stroke={e.color} className={hover === e.to ? 'on' : ''} />
            ))}
          </svg>

          {map.pills.map(({ line, x, y }) => (
            <span key={line.name} className={`line-name ${shown && shown.line !== line ? 'dim' : ''}`} style={{ left: x, top: y, background: line.color }}>
              {line.name}
            </span>
          ))}

          {map.lessons.map((l) => {
            const isPre = !!shown?.prereqs?.includes(l.id)
            const cls = ['station', 'planned', l.wide && 'wide', l.level ?? 'core', isPre && 'prereq', hover === l.id && 'hovered'].filter(Boolean).join(' ')
            return (
              <div
                key={l.id}
                className={cls}
                tabIndex={0}
                aria-label={`${l.title}. Planned${l.level === 'deeper' ? ', goes deeper' : ''}. ${l.summary}`}
                style={{ left: l.x, top: l.y, ['--line' as string]: l.line.color }}
                onMouseEnter={() => setHover(l.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(l.id)}
                onBlur={() => setHover(null)}
              >
                <span className="dot" aria-hidden="true" />
                <span className="label" aria-hidden="true">
                  <b>{l.title}</b>
                  <small>{isPre ? 'Helps to know first' : l.level === 'deeper' ? 'Planned, deeper' : 'Planned'}</small>
                </span>
              </div>
            )
          })}
        </div>
      </div>
      {shown && (
        <div className="hover-card" style={{ ['--line' as string]: shown.line.color }} aria-hidden="true">
          <span className="hover-line">{shown.line.name}, planned</span>
          <h2>{shown.title}</h2>
          <p>{shown.summary}</p>
          {!!shown.prereqs?.length && (
            <p className="hover-pre">Helps to know first: {shown.prereqs.map((p) => map.byId[p]?.title ?? p).join(', ')}</p>
          )}
        </div>
      )}
    </div>
  )
}

/** A subject that is planned but not written: its lines and lesson titles, drawn as a map. */
export default function SubjectPlan({ subject }: { subject: Subject }) {
  const map = useMemo(() => layoutPlan(subject.lines), [subject])
  const count = map.lessons.length
  return (
    <main className="home plan">
      <section className="hero">
        <p className="plan-tag">
          <span>Planned</span> {count} lessons on {subject.lines.length} lines. No lesson text yet.
        </p>
        <h1>{subject.headline}</h1>
        <p className="lead">{subject.lead}</p>
        <div className="hero-go row">
          <a className="btn primary" href={PROPOSE_LESSON_URL} target="_blank" rel="noreferrer">
            Propose or write a lesson
          </a>
          <Link className="link-btn" to="/">
            Read data engineering now
          </Link>
        </div>
      </section>

      <section className="plan-head" aria-labelledby="plan-map">
        <div>
          <h2 className="map-title" id="plan-map">
            The planned map
          </h2>
          <p className="lead">
            Read it downward, as you will read the finished map. A line into a lesson comes from something that helps to
            know first. Point at a lesson to see what it will teach. Titles and order can change while the lessons are
            written.
          </p>
        </div>
        <ul className="legend plan-legend" aria-label="Key">
          <li>
            <i className="plan-key core" aria-hidden="true" /> Core lesson
          </li>
          <li>
            <i className="plan-key deeper" aria-hidden="true" /> Goes deeper
          </li>
        </ul>
      </section>

      <PlanMap map={map} />

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
                  {line.lessons.map((l) => (
                    <li key={l.id} className={l.level ?? 'core'}>
                      <span className="plan-stop" aria-hidden="true" />
                      <span>
                        <b>{l.title}</b>
                        <small>
                          {l.summary}
                          {l.level === 'deeper' ? ' Goes deeper.' : ''}
                        </small>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
