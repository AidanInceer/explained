import { Link } from 'react-router-dom'
import { lessonById } from '../data/curriculum'
import { PLANNED } from '../data/tracks'

/** A lesson by id: a link if it is written, its planned title if not. */
export default function LessonRef({ id }: { id: string }) {
  const l = lessonById[id]
  if (l) return <Link to={`/lesson/${id}`}>{l.title}</Link>
  return (
    <span className="planned-ref" title="Planned: no lesson text yet">
      {PLANNED.get(id)?.lesson.title ?? id}
    </span>
  )
}
