import { Link } from 'react-router-dom'
import { LESSONS, SOURCES, type SourceId } from '../curriculum'

export default function Sources() {
  return (
    <main className="page narrow">
      <h1>Sources</h1>
      <p className="lead">
        The lessons summarise these books, papers and community references in new words. When a lesson and a source
        disagree, trust the source.
      </p>
      <ul className="source-list">
        {(Object.keys(SOURCES) as SourceId[]).map((id) => {
          const s = SOURCES[id]
          const used = LESSONS.filter((l) => l.refs.some(([r]) => r === id))
          return (
            <li key={id}>
              <p className="source-kind">{s.kind}</p>
              <h2>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : s.title}</h2>
              <p className="source-by">{s.by}</p>
              <p>{s.why}</p>
              <p className="source-used">
                Used in:{' '}
                {used.map((l, i) => (
                  <span key={l.id}>
                    {i > 0 && ', '}
                    <Link to={`/lesson/${l.id}`}>{l.title}</Link>
                  </span>
                ))}
              </p>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
