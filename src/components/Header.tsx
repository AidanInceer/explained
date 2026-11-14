import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LESSONS, trackById } from '../curriculum'
import { GLOSSARY } from '../glossary'

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
      <Link to="/" className="wordmark" aria-label="Data Engineering Explained, home">
        <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
          <path d="M8 7v9a8 8 0 0 0 8 8h8" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="8" cy="7" r="4" fill="#2456D6" stroke="#fff" strokeWidth="2" />
          <circle cx="24" cy="24" r="4" fill="#D0356F" stroke="#fff" strokeWidth="2" />
        </svg>
        <span>Data Engineering Explained</span>
      </Link>
      <nav className="top-nav" aria-label="Main">
        <NavLink to="/" end>
          Map
        </NavLink>
        <NavLink to="/glossary">Glossary</NavLink>
        <NavLink to="/sources">Sources</NavLink>
      </nav>
      <div className="search" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
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
    </header>
  )
}
