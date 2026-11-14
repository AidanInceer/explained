import { Link } from 'react-router-dom'
import type { Lesson } from '../../data/curriculum'
import { SOURCES } from '../../data/sources'
import { trackById } from '../../data/tracks'
import { clearMarks } from '../../lib/marks'
import { setDone, type onwardFrom } from '../../lib/progress'

function LessonList({ title, lessons }: { title: string; lessons: Lesson[] }) {
  return (
    <div className="onward-branches">
      <h2>{title}</h2>
      <ul>
        {lessons.map((b) => (
          <li key={b.id}>
            <Link to={`/lesson/${b.id}`} style={{ ['--line' as string]: trackById[b.track].color }}>
              <span className="pill">{trackById[b.track].name}</span>
              <b>{b.title}</b>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The end of a lesson: mark it as understood, where to go next, and the sources. */
export default function LessonEnd({
  lesson,
  hidden,
  isDone,
  quizEnds,
  markCount,
  onward: { onward, branches, elsewhere },
}: {
  lesson: Lesson
  hidden: boolean
  isDone: boolean
  /** The lesson ends with a quiz that is all correct. Its box already has the "Mark as understood" button. */
  quizEnds: boolean
  markCount: number
  onward: ReturnType<typeof onwardFrom>
}) {
  const track = trackById[lesson.track]
  return (
    <section className="lesson-end" hidden={hidden}>
      {!quizEnds && (
        <button className={`btn ${isDone ? '' : 'primary'}`} onClick={() => setDone(lesson.id, !isDone)}>
          {isDone ? 'Understood ✓ (select to undo)' : 'Mark as understood'}
        </button>
      )}
      <p className="marks-note">
        Select text in the lesson to highlight or underline it. Select a mark to remove it. Your marks are saved in this browser.
        {markCount > 0 && (
          <>
            {' '}
            <button className="link-btn" onClick={() => confirm('Remove all your marks on this lesson?') && clearMarks(lesson.id)}>
              Remove the {markCount} on this lesson
            </button>
          </>
        )}
      </p>

      <div className="onward">
        {onward && (
          <Link to={`/lesson/${onward.id}`} className="onward-card main">
            <small>Next on the {track.name} line</small>
            <b>{onward.title}</b>
            <span>{onward.summary}</span>
          </Link>
        )}
        {branches.length > 0 && <LessonList title={onward ? 'This lesson also leads to' : 'This lesson leads to'} lessons={branches} />}
        {elsewhere.length > 0 && <LessonList title={`End of the ${track.name} line. Go to another line`} lessons={elsewhere} />}
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
  )
}
