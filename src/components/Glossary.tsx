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

  return (
    <main className="page narrow">
      <h1>Glossary</h1>
      <p className="lead">Short definitions of {GLOSSARY.length} terms. Each one links to the lesson that explains it.</p>
      <input
        className="filter"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter terms"
        aria-label="Filter terms"
      />
      {items.length === 0 && <p>No term matches “{q.trim()}”. Try a shorter word.</p>}
      <dl className="glossary">
        {items.map((g) => {
          const l = lessonById[g.lesson]
          return (
            <div key={g.term + g.lesson}>
              <dt>{g.term}</dt>
              <dd>
                {g.def}{' '}
                <Link to={`/lesson/${l.id}`} style={{ ['--line' as string]: trackById[l.track].color }}>
                  {l.title}
                </Link>
              </dd>
            </div>
          )
        })}
      </dl>
    </main>
  )
}
