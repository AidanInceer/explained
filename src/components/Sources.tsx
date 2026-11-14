import { Link } from 'react-router-dom'
import { LESSONS, SOURCES, type SourceId } from '../curriculum'

const KINDS = ['Book', 'Paper', 'Essay', 'Website', 'Community']
const PLURAL: Record<string, string> = { Book: 'Books', Paper: 'Papers', Essay: 'Essays', Website: 'Websites', Community: 'Community' }

export default function Sources() {
  return (
    <main className="page narrow">
      <h1>Sources</h1>
      <p className="lead">
        The lessons summarise these books, papers and community references in new words. When a lesson and a source
        disagree, trust the source.
      </p>
      <nav className="src-kinds" aria-label="Kinds of source">
        {KINDS.filter((k) => Object.values(SOURCES).some((s) => s.kind === k)).map((k) => (
          <a key={k} href={`#src-${k}`}>
            {PLURAL[k]} <span>{Object.values(SOURCES).filter((s) => s.kind === k).length}</span>
          </a>
        ))}
      </nav>
      {KINDS.filter((k) => Object.values(SOURCES).some((s) => s.kind === k)).map((kind) => (
      <section key={kind} id={`src-${kind}`} className="src-group">
        <h2>{PLURAL[kind]}</h2>
      <ul className="source-list">
        {(Object.keys(SOURCES) as SourceId[]).filter((id) => SOURCES[id].kind === kind).map((id) => {
          const s = SOURCES[id]
          const used = LESSONS.filter((l) => l.refs.some(([r]) => r === id))
          return (
            <li key={id}>
              <div className="source-head">
                <h3>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : s.title}</h3>
                <p className="source-by">{s.by}</p>
              </div>
              <div className="source-body">
              <p>{s.why}</p>
              <details className="source-used">
                <summary>Used in {used.length} {used.length === 1 ? 'lesson' : 'lessons'}</summary>
                <ul>
                  {used.map((l) => (
                    <li key={l.id}>
                      <Link to={`/lesson/${l.id}`}>{l.title}</Link>
                    </li>
                  ))}
                </ul>
              </details>
              </div>
            </li>
          )
        })}
      </ul>
      </section>
      ))}
    </main>
  )
}
