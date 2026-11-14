import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LESSONS, trackById } from '../curriculum'
import { GLOSSARY } from '../glossary'
import { useProgress } from '../lib/progress'
import { MarkTile } from './Brand'

interface Hit {
  key: string
  to: string
  title: string
  sub: string
  color?: string
}

function search(q: string): Hit[] {
  const s = q.trim().toLowerCase()
  if (s.length < 2) return []
  const lessons: Hit[] = LESSONS.filter((l) => (l.title + ' ' + l.summary).toLowerCase().includes(s)).map((l) => ({
    key: 'l' + l.id,
    to: `/lesson/${l.id}`,
    title: l.title,
    sub: `Lesson on the ${trackById[l.track].name} line`,
    color: trackById[l.track].color,
  }))
  const terms: Hit[] = GLOSSARY.filter((g) => g.term.toLowerCase().includes(s)).map((g) => ({
      key: 'g' + g.term,
      to: `/lesson/${g.lesson}`,
      title: g.term,
      sub: g.def,
      color: trackById[LESSONS.find((l) => l.id === g.lesson)!.track].color,
    }))
  return [...lessons, ...terms].slice(0, 8)
}

export default function Header() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const hits = useMemo(() => search(q), [q])
  const nav = useNavigate()
  const loc = useLocation()
  const input = useRef<HTMLInputElement>(null)
  const done = useProgress()
  const onLesson = loc.pathname.startsWith('/lesson/')

  useEffect(() => {
    setOpen(false)
    setQ('')
  }, [loc.pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(t.tagName)) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="top">
      <div className="top-in">
      <Link to="/" className="wordmark" aria-label="Data Engineering Explained, home">
        <MarkTile />
        <span>
          Data Engineering <em>Explained</em>
        </span>
      </Link>
      <nav className="top-nav" aria-label="Main">
        <NavLink to="/" end className={({ isActive }) => (isActive || onLesson ? 'active' : '')}>
          Lessons
        </NavLink>
        <NavLink to="/toolkit">Toolkit</NavLink>
        <NavLink to="/glossary">Glossary</NavLink>
        <NavLink to="/sources">Sources</NavLink>
      </nav>
      <Link to="/" className="top-progress" title="Lessons that you marked as understood">
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--rule)" strokeWidth="3" />
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--good)" strokeWidth="3" strokeLinecap="round" pathLength="100" strokeDasharray={`${(done.size / LESSONS.length) * 100} 100`} transform="rotate(-90 10 10)" />
        </svg>
        <span>
          {done.size} of {LESSONS.length}
        </span>
      </Link>
      <div className="search" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
        <svg className="search-icon" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M13.5 13.5 18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          ref={input}
          type="search"
          value={q}
          placeholder="Search lessons and terms"
          aria-label="Search lessons and terms"
          role="combobox"
          aria-expanded={open && hits.length > 0}
          aria-controls="search-results"
          onChange={(e) => {
            setQ(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, hits.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === 'Enter' && hits[active]) {
              nav(hits[active].to)
              input.current?.blur()
            } else if (e.key === 'Escape') {
              setOpen(false)
              input.current?.blur()
            }
          }}
        />
        <kbd aria-hidden="true">/</kbd>
        {open && q.trim().length >= 2 && (
          <ul className="search-results" id="search-results" role="listbox">
            {hits.length === 0 && <li className="search-empty">No lesson or term matches “{q.trim()}”.</li>}
            {hits.map((h, i) => (
              <li key={h.key} role="option" aria-selected={i === active}>
                <Link to={h.to} className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)}>
                  <i style={{ background: h.color }} />
                  <span>
                    <b>{h.title}</b>
                    <small>{h.sub}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </header>
  )
}
