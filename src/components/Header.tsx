import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { lessonsIn } from '../data/curriculum'
import { useTheme } from '../lib/theme'
import { SITE_NAME } from '../data/site'
import { countsOf, SUBJECTS, subjectOfPath } from '../data/subjects'
import { search } from '../lib/search'
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
  const onLesson = loc.pathname.startsWith('/lesson/')
  const subject = subjectOfPath(loc.pathname)
  const here = subject ? lessonsIn(subject.id) : []
  const mine = { done: here.filter((l) => done.has(l.id)).length, total: here.length }
  const quizzes = here.filter((l) => scores[l.id] && scores[l.id].correct === scores[l.id].total).length
  const [theme, toggleTheme] = useTheme()

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
      <Link to="/" className="wordmark" aria-label={`${SITE_NAME}, home`}>
        <SiteMark />
        <span>{SITE_NAME}</span>
      </Link>
      <nav className="subjects" aria-label="Subjects">
        {SUBJECTS.map((s) => (
          <Link
            key={s.id}
            to={s.path}
            className={[s.id === subject?.id ? 'active' : '', countsOf(s).written ? '' : 'planned'].join(' ')}
            aria-current={s.id === subject?.id ? 'true' : undefined}
            title={countsOf(s).written ? s.name : `${s.name}: planned, no lesson text yet`}
          >
            {s.short}
          </Link>
        ))}
      </nav>
      {subject && (
        <nav className="top-nav" aria-label={`${subject.name} pages`} ref={navEl}>
          <NavLink to={subject.path} end className={({ isActive }) => (isActive || onLesson ? 'active' : '')}>
            Lessons
          </NavLink>
          <NavLink to={`${subject.path}/toolkit`}>Toolkit</NavLink>
          <NavLink to={`${subject.path}/glossary`}>Glossary</NavLink>
          <NavLink to={`${subject.path}/sources`}>Sources</NavLink>
          <NavFlow nav={navEl} path={loc.pathname} />
        </nav>
      )}
      {subject && mine.total > 0 && (
        <Link to={subject.path} className="top-progress" title={`${mine.done} of ${mine.total} ${subject.name} lessons marked as understood. ${quizzes} ${quizzes === 1 ? 'quiz' : 'quizzes'} with all answers correct.`}>
          {mine.done} of {mine.total}
        </Link>
      )}
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Use light colours' : 'Use dark colours'}
        title={theme === 'dark' ? 'Use light colours' : 'Use dark colours'}
      >
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          {theme === 'dark' ? (
            <>
              <circle cx="10" cy="10" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 1.8v2.4M10 15.8v2.4M1.8 10h2.4M15.8 10h2.4M4.2 4.2l1.7 1.7M14.1 14.1l1.7 1.7M4.2 15.8l1.7-1.7M14.1 5.9l1.7-1.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <path d="M16.5 12.6A7 7 0 0 1 7.4 3.5a7 7 0 1 0 9.1 9.1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          )}
        </svg>
      </button>
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
