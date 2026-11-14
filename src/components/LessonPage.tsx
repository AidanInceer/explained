import { Link, useNavigate, useParams } from 'react-router-dom'
import { LESSONS, SOURCES, dependents, lessonById, lessonsOf, trackById } from '../curriculum'
import { lessonContent } from '../lib/content'
import { setDone, useProgress } from '../lib/progress'
import { FIGURES } from '../figures'
import Quiz from './Quiz'
import Scenario from './Scenario'
import TrackLine from './TrackLine'

export default function LessonPage() {
  const { id = '' } = useParams()
  const lesson = lessonById[id]
  const done = useProgress()
  const nav = useNavigate()

  if (!lesson) {
    return (
      <main className="page narrow">
        <h1>No lesson at this address</h1>
        <p>
          <Link to="/">Go to the map</Link> and choose a lesson from there.
        </p>
      </main>
    )
  }

  const track = trackById[lesson.track]
  const segs = lessonContent(lesson.id)
  const isDone = done.has(lesson.id)
  const line = lessonsOf(lesson.track)
  const idx = line.indexOf(lesson)
  const leads = dependents(lesson.id)
  const onward = leads.find((l) => l.track === lesson.track)
  const branches = leads.filter((l) => l.id !== onward?.id)
  const elsewhere =
    !onward && branches.length === 0
      ? LESSONS.filter((l) => !done.has(l.id) && l.id !== lesson.id && l.prereqs.every((p) => done.has(p) || p === lesson.id)).slice(0, 3)
      : []

  // Internal links inside rendered markdown should not reload the page.
  const onProseClick = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest('a')
    const href = a?.getAttribute('href')
    if (href?.startsWith('/')) {
      e.preventDefault()
      nav(href)
    }
  }

  return (
    <main className="lesson" style={{ ['--line' as string]: track.color }}>
      <aside className="lesson-side">
        <Link to="/" className="back">
          All lines
        </Link>
        <h2>{track.name}</h2>
        <p>{track.blurb}</p>
        <TrackLine track={lesson.track} current={lesson.id} />
      </aside>

      <article className="lesson-body" key={lesson.id}>
        <header className="lesson-head">
          <p className="lesson-meta">
            <span className="pill">{track.name}</span>
            <span>
              Lesson {idx + 1} of {line.length}
            </span>
            <span>{lesson.minutes} min read</span>
            {lesson.level === 'deeper' && <span>Goes deeper</span>}
          </p>
          <h1>{lesson.title}</h1>
          <p className="lesson-summary">{lesson.summary}</p>
          {lesson.prereqs.length > 0 && (
            <p className="lesson-pre">
              Helps to know first:{' '}
              {lesson.prereqs.map((p, i) => (
                <span key={p}>
                  {i > 0 && ', '}
                  <Link to={`/lesson/${p}`}>{lessonById[p].title}</Link>
                  {done.has(p) && <span className="tick" title="Understood"> ✓</span>}
                </span>
              ))}
            </p>
          )}
        </header>

        <div className="prose" onClick={onProseClick}>
          {segs ? (
            segs.map((s, i) => {
              if (s.type === 'md') return <div key={i} dangerouslySetInnerHTML={{ __html: s.html }} />
              if (s.type === 'quiz') return <Quiz key={i} questions={s.questions} />
              if (s.type === 'scenario') return <Scenario key={i} items={s.items} />
              const F = FIGURES[s.name]
              return (
                <figure key={i} className="fig">
                  <div className="fig-body">{F ? <F /> : <p>Figure “{s.name}” is missing.</p>}</div>
                  {s.caption && <figcaption dangerouslySetInnerHTML={{ __html: s.caption }} />}
                </figure>
              )
            })
          ) : (
            <p>This lesson is not written yet.</p>
          )}
        </div>

        <section className="lesson-end">
          <button className={`btn ${isDone ? '' : 'primary'}`} onClick={() => setDone(lesson.id, !isDone)}>
            {isDone ? 'Understood ✓ (select to undo)' : 'Mark as understood'}
          </button>

          <div className="onward">
            {onward && (
              <Link to={`/lesson/${onward.id}`} className="onward-card main">
                <small>Next on the {track.name} line</small>
                <b>{onward.title}</b>
                <span>{onward.summary}</span>
              </Link>
            )}
            {branches.length > 0 && (
              <div className="onward-branches">
                <h2>{onward ? 'This lesson also leads to' : 'This lesson leads to'}</h2>
                <ul>
                  {branches.map((b) => (
                    <li key={b.id}>
                      <Link to={`/lesson/${b.id}`} style={{ ['--line' as string]: trackById[b.track].color }}>
                        <span className="pill">{trackById[b.track].name}</span>
                        <b>{b.title}</b>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {elsewhere.length > 0 && (
              <div className="onward-branches">
                <h2>End of the {track.name} line. Go to another line</h2>
                <ul>
                  {elsewhere.map((b) => (
                    <li key={b.id}>
                      <Link to={`/lesson/${b.id}`} style={{ ['--line' as string]: trackById[b.track].color }}>
                        <span className="pill">{trackById[b.track].name}</span>
                        <b>{b.title}</b>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="refs">
            <h2>Where this comes from</h2>
            <ul>
              {lesson.refs.map(([sid, where], i) => {
                const s = SOURCES[sid]
                return (
                  <li key={i}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                    ) : (
                      <cite>{s.title}</cite>
                    )}
                    . {where}.
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </article>
    </main>
  )
}
