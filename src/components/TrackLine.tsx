import { Link } from 'react-router-dom'
import { lessonsOf, trackById, type TrackId } from '../curriculum'
import { setDone, useProgress } from '../lib/progress'

/** One line drawn vertically with its lessons as stops. */
export default function TrackLine({ track, current }: { track: TrackId; current?: string }) {
  const done = useProgress()
  const t = trackById[track]
  return (
    <ol className="track-line" style={{ ['--line' as string]: t.color }}>
      {lessonsOf(track).map((l) => (
        <li key={l.id} className={[l.level, done.has(l.id) ? 'done' : '', l.id === current ? 'current' : ''].join(' ')}>
          <Link to={`/lesson/${l.id}`} aria-current={l.id === current ? 'page' : undefined}>
            <span className="dot" aria-hidden="true" />
            <span>
              {l.title}
              <small>
                {done.has(l.id) ? 'Understood' : `${l.minutes} min`}
                {l.level === 'deeper' ? ', deeper' : ''}
              </small>
            </span>
          </Link>
          <button
            type="button"
            className="tl-check"
            aria-pressed={done.has(l.id)}
            aria-label={done.has(l.id) ? `${l.title}: understood. Select to undo` : `Mark “${l.title}” as understood`}
            title={done.has(l.id) ? 'Understood. Select to undo' : 'Mark as understood'}
            onClick={() => setDone(l.id, !done.has(l.id))}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </li>
      ))}
    </ol>
  )
}
