import { Link } from 'react-router-dom'
import { lessonsIn } from '../data/curriculum'
import { SOURCES, SOURCES_OF, type SourceId } from '../data/sources'
import type { Subject } from '../data/subjects'

const KINDS = ['Book', 'Paper', 'Essay', 'Website', 'Community']
const PLURAL: Record<string, string> = { Book: 'Books', Paper: 'Papers', Essay: 'Essays', Website: 'Websites', Community: 'Community' }

export default function Sources({ subject }: { subject: Subject }) {
  const lessons = lessonsIn(subject.id)
  // The subject's own sources, and any other source that its lessons cite.
  const ids = [...new Set<SourceId>([...SOURCES_OF[subject.id], ...lessons.flatMap((l) => l.refs.map(([r]) => r))])]
  const of = (k: string) => ids.filter((id) => SOURCES[id].kind === k)
  return (
    <main className="page narrow">
      <p className="page-kicker">{subject.name}</p>
      <h1>Sources</h1>
      <p className="lead">
        The lessons summarise these books, papers and community references in new words. When a lesson and a source
        disagree, trust the source.
      </p>
      <nav className="src-kinds" aria-label="Kinds of source">
        {KINDS.filter((k) => of(k).length).map((k) => (
          <a key={k} href={`#src-${k}`}>
            {PLURAL[k]} <span>{of(k).length}</span>
          </a>
        ))}
      </nav>
      {KINDS.filter((k) => of(k).length).map((kind) => (
      <section key={kind} id={`src-${kind}`} className="src-group">
        <h2>{PLURAL[kind]}</h2>
      <ul className="source-list">
        {of(kind).map((id) => {
          const s = SOURCES[id]
          const used = lessons.filter((l) => l.refs.some(([r]) => r === id))
          return (
            <li key={id}>
              <div className="source-head">
                <h3>{s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> : s.title}</h3>
                <p className="source-by">{s.by}</p>
              </div>
              <div className="source-body">
              <p>{s.why}</p>
              {used.length > 0 && (
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
              )}
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
