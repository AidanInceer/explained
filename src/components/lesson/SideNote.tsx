import { Link } from 'react-router-dom'
import { lessonById } from '../../data/curriculum'
import { GLOSSARY } from '../../data/glossary'
import { TECH } from '../../data/tech'
import TechNote from './TechNote'

/** A note at the side of the lesson: a technology group, or a term from a lesson off this lesson's path. */
export type Note = { kind: 'tech' | 'term'; key: string; top: number; pinned: boolean }

export default function SideNote({ note, onClose }: { note: Note; onClose: () => void }) {
  if (note.kind === 'tech') return <TechNote note={TECH[note.key]} top={note.top} pinned={note.pinned} onClose={onClose} />
  const term = GLOSSARY[+note.key]
  return (
    <div className={`tech-note term-note ${note.pinned ? 'pinned' : ''}`} style={{ top: note.top }}>
      <h3>{term.term}</h3>
      <p>{term.def}</p>
      {note.pinned ? (
        <p className="term-from">
          Explained in <Link to={`/lesson/${term.lesson}`}>{lessonById[term.lesson].title}</Link>, which is not on the path to this lesson.{' '}
          <button className="link-btn" onClick={onClose}>
            Close
          </button>
        </p>
      ) : (
        <p className="tech-hint">Select the term to keep this open, with a link to its lesson.</p>
      )}
    </div>
  )
}
