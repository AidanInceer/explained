import { Link } from 'react-router-dom'
import { lessonsOf, trackById, type TrackId } from '../curriculum'
import { useProgress } from '../lib/progress'

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
        </li>
      ))}
    </ol>
  )
}
