import { FIGURES } from '../../figures'
import Corners from '../Corners'

/** A `::fig name | caption` line in a lesson. */
export default function LessonFigure({ name, caption }: { name: string; caption: string }) {
  const F = FIGURES[name]
  return (
    <figure className="fig">
      <div className="fig-frame">
        <Corners />
        <div className="fig-body">{F ? <F /> : <p>Figure “{name}” is missing.</p>}</div>
      </div>
      {caption && <figcaption dangerouslySetInnerHTML={{ __html: caption }} />}
    </figure>
  )
}
