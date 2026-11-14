import { Link } from 'react-router-dom'
import { PROPOSE_LESSON_URL } from '../data/site'
import type { Subject } from '../data/subjects'
import Corners from './Corners'

/** A subject that is planned but not written: its lines and lesson titles, drawn as a skeleton map. */
export default function SubjectPlan({ subject }: { subject: Subject }) {
  const count = subject.lines.reduce((n, l) => n + l.lessons.length, 0)
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

      <section aria-labelledby="plan-map">
        <h2 className="map-title" id="plan-map">
          The planned map
        </h2>
        <p className="lead">
          Read it as you will read the finished map: top to bottom on each line, foundations first. Titles and order can
          change while the lessons are written.
        </p>
        <div className="plan-frame">
          <Corners />
          <div className="plan-map">
            {subject.lines.map((line) => (
              <section key={line.name} className="plan-line" style={{ ['--line' as string]: line.color }}>
                <h3>
                  <span className="line-name">{line.name}</span>
                </h3>
                <p>{line.blurb}</p>
                <ol>
                  {line.lessons.map((l) => (
                    <li key={l.title} className={l.level ?? 'core'}>
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
      </section>
    </main>
  )
}
