import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { LESSONS, trackById } from '../curriculum'
import { GLOSSARY } from '../glossary'
import { useProgress } from '../lib/progress'
import { useQuizScores } from '../lib/quizStore'
import SiteMark from './SiteMark'

const still = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** The bar under the open section. When you change section, a small square carries it across,
    like a packet of data in the drawing on the home page, and the bar follows. */
function NavFlow({ nav, path }: { nav: RefObject<HTMLElement | null>; path: string }) {
  const [pos, setPos] = useState<{ x: number; w: number } | null>(null)
  const prev = useRef<{ x: number; w: number } | null>(null)
  const pk = useRef<(HTMLSpanElement | null)[]>([])
  useLayoutEffect(() => {
    const measure = () => {
      const a = nav.current?.querySelector<HTMLElement>('a.active')
      setPos(a ? { x: a.offsetLeft, w: a.offsetWidth } : null)
    }
    measure()
    // Measure again once the link classes and the web fonts have settled.
    const raf = requestAnimationFrame(measure)
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
    }
  }, [nav, path])
  useEffect(() => {
    const p = prev.current
    prev.current = pos
    if (!pos || !p || p.x === pos.x || still) return
    const from = p.x + p.w / 2
    const to = pos.x + pos.w / 2
    pk.current.forEach((el, i) =>
      el?.animate(
        [
          { transform: `translateX(${from}px)`, opacity: 1 },
          { transform: `translateX(${to}px)`, opacity: 1, offset: 0.8 },
          { transform: `translateX(${to}px)`, opacity: 0 },
        ],
        { duration: 560, delay: i * 50, easing: 'cubic-bezier(0.55, 0, 0.25, 1)', fill: 'backwards' },
      ),
    )
  }, [pos])
  return (
    <>
      <span className="nav-bar" aria-hidden="true" style={pos ? { transform: `translateX(${pos.x}px)`, width: pos.w } : { opacity: 0 }} />
      {[0, 1, 2].map((i) => (
        <span key={i} className={`nav-pk t${i}`} aria-hidden="true" ref={(el) => void (pk.current[i] = el)} />
      ))}
    </>
  )
}

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
  const navEl = useRef<HTMLElement>(null)
  const done = useProgress()
  const scores = useQuizScores()
  const quizzes = Object.values(scores).filter((s) => s.correct === s.total).length
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
        <SiteMark />
        <span>
          Data Engineering <em>Explained</em>
        </span>
      </Link>
      <nav className="top-nav" aria-label="Main" ref={navEl}>
        <NavLink to="/" end className={({ isActive }) => (isActive || onLesson ? 'active' : '')}>
          Lessons
        </NavLink>
        <NavLink to="/toolkit">Toolkit</NavLink>
        <NavLink to="/glossary">Glossary</NavLink>
        <NavLink to="/sources">Sources</NavLink>
        <NavFlow nav={navEl} path={loc.pathname} />
      </nav>
      <Link to="/" className="top-progress" title={`${done.size} ${done.size === 1 ? 'lesson' : 'lessons'} marked as understood. ${quizzes} ${quizzes === 1 ? 'quiz' : 'quizzes'} with all answers correct.`}>
        {/* Ten small squares, one for each tenth of the lessons, like the progress rows on the map. */}
        <span className="top-meter" aria-hidden="true">
          {Array.from({ length: 10 }, (_, k) => (
            <i key={k} className={done.size > 0 && k < Math.max(1, Math.round((done.size / LESSONS.length) * 10)) ? 'on' : ''} />
          ))}
        </span>
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
