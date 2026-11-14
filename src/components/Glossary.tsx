import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonById, trackById } from '../curriculum'
import { GLOSSARY } from '../glossary'

export default function Glossary() {
  const [q, setQ] = useState('')
  const items = useMemo(() => {
    const s = q.trim().toLowerCase()
    return [...GLOSSARY]
      .sort((a, b) => a.term.localeCompare(b.term))
      .filter((g) => !s || g.term.toLowerCase().includes(s) || g.def.toLowerCase().includes(s))
  }, [q])

  const groups = useMemo(() => {
    const m = new Map<string, typeof items>()
    for (const g of items) {
      const k = /[a-z]/i.test(g.term[0]) ? g.term[0].toUpperCase() : '#'
      m.set(k, [...(m.get(k) ?? []), g])
    }
    return [...m.entries()]
  }, [items])

  return (
    <main className="page narrow">
      <h1>Glossary</h1>
      <p className="lead">Short definitions of {GLOSSARY.length} terms. Each one links to the lesson that explains it.</p>
      <div className="filter-bar">
        <input
          className="filter"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter terms"
          aria-label="Filter terms"
        />
        <p className="filter-count" role="status">
          {q.trim() ? `${items.length} of ${GLOSSARY.length} terms` : `${GLOSSARY.length} terms`}
        </p>
      </div>
      {groups.length > 1 && (
        <nav className="az" aria-label="Jump to letter">
          {groups.map(([k]) => (
            <a key={k} href={`#g-${k === '#' ? 'num' : k}`}>
              {k}
            </a>
          ))}
        </nav>
      )}
      {items.length === 0 && <p>No term matches “{q.trim()}”. Try a shorter word.</p>}
      {groups.map(([k, list]) => (
        <section key={k} id={`g-${k === '#' ? 'num' : k}`} className="gl-group" aria-label={`Terms starting with ${k}`}>
          <h2 aria-hidden="true">
            <span className="gl-letter">{k}</span>
            <small>
              {list.length} {list.length === 1 ? 'term' : 'terms'}
            </small>
          </h2>
          <dl className="glossary">
            {list.map((g) => {
              const l = lessonById[g.lesson]
              return (
                <div key={g.term + g.lesson}>
                  <dt>{g.term}</dt>
                  <dd>
                    <p>{g.def}</p>
                    <Link className="gl-lesson" to={`/lesson/${l.id}`} style={{ ['--line' as string]: trackById[l.track].color }}>
                      <i aria-hidden="true" />
                      {l.title}
                    </Link>
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>
      ))}
    </main>
  )
}
