import { Link } from 'react-router-dom'
import { lessonsOf } from '../data/curriculum'
import { trackById } from '../data/tracks'
import { setDone, useProgress } from '../lib/progress'
import { quizText, useQuizScores } from '../lib/quizStore'

/** One line drawn vertically with its lessons as stops. */
export default function TrackLine({ track, current }: { track: string; current?: string }) {
  const done = useProgress()
  const quiz = useQuizScores()
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
                {quiz[l.id] ? `, ${quizText(quiz[l.id])}` : ''}
              </small>
            </span>
          </Link>
          <button
            type="button"
            className="tl-check"
            // Only the current lesson's tick is in the tab order, so keyboard users reach the lesson text quickly.
            // The other ticks still work with a mouse or touch, and on their own lesson pages.
            tabIndex={l.id === current || !current ? undefined : -1}
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
