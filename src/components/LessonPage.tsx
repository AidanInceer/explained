import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LESSONS, SOURCES, dependents, lessonById, lessonsOf, trackById } from '../curriculum'
import { lessonContent } from '../lib/content'
import { addMark, clearMarks, paint, removeMark, useMarks } from '../lib/marks'
import { setDone, useProgress } from '../lib/progress'
import { FIGURES } from '../figures'
import { LESSON_TECH, TECH } from '../tech'
import Quiz from './Quiz'
import Scenario from './Scenario'
import TechNote from './TechNote'
import TrackLine from './TrackLine'

type Tool =
  | { mode: 'add'; x: number; y: number; seg: number; start: number; end: number; text: string }
  | { mode: 'remove'; x: number; y: number; id: string }

export default function LessonPage() {
  const { id = '' } = useParams()
  const lesson = lessonById[id]
  const done = useProgress()
  const nav = useNavigate()
  const marks = useMarks(id)
  const prose = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLElement>(null)
  const [note, setNote] = useState<{ key: string; top: number; pinned: boolean } | null>(null)
  const [tool, setTool] = useState<Tool | null>(null)
  const segs = lesson ? lessonContent(lesson.id) : null

  // A new lesson starts with no open note and no toolbar.
  useEffect(() => {
    setNote(null)
    setTool(null)
  }, [id])

  // Draw the reader's highlights. Each text block is reset to its original HTML first, then painted.
  useEffect(() => {
    const root = prose.current
    if (!root || !segs) return
    root.querySelectorAll<HTMLElement>('[data-seg]').forEach((el) => {
      const i = Number(el.dataset.seg)
      const s = segs[i]
      if (s.type !== 'md') return
      el.innerHTML = s.html
      marks.filter((m) => m.seg === i).forEach((m) => paint(el, m))
    })
  }, [marks, segs, id])

  useEffect(() => {
    if (!tool) return
    const hide = () => setTool(null)
    window.addEventListener('scroll', hide, { passive: true })
    return () => window.removeEventListener('scroll', hide)
  }, [tool])

  if (!lesson) {
    return (
      <main className="page narrow">
        <h1>No lesson at this address</h1>
        <p>
          <Link to="/">Go to the map</Link> and choose a lesson from there.
        </p>
      </main>
    )
  }

  const track = trackById[lesson.track]
  const isDone = done.has(lesson.id)
  const line = lessonsOf(lesson.track)
  const idx = line.indexOf(lesson)
  const leads = dependents(lesson.id)
  const onward = leads.find((l) => l.track === lesson.track)
  const branches = leads.filter((l) => l.id !== onward?.id)
  const elsewhere =
    !onward && branches.length === 0
      ? LESSONS.filter((l) => !done.has(l.id) && l.id !== lesson.id && l.prereqs.every((p) => done.has(p) || p === lesson.id)).slice(0, 3)
      : []
  const techKeys = LESSON_TECH[lesson.id] ?? []

  const techAt = (el: HTMLElement) => ({
    key: el.dataset.tech!,
    top: Math.max(0, el.getBoundingClientRect().top - (rail.current?.getBoundingClientRect().top ?? 0) - 14),
  })

  const onClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const term = target.closest<HTMLElement>('.tech')
    if (term) {
      const at = techAt(term)
      setNote(note?.pinned && note.key === at.key ? null : { ...at, pinned: true })
      return
    }
    // Internal links inside rendered markdown should not reload the page.
    const href = target.closest('a')?.getAttribute('href')
    if (href?.startsWith('/')) {
      e.preventDefault()
      nav(href)
      return
    }
    const mark = target.closest<HTMLElement>('mark.um')
    if (mark && window.getSelection()?.isCollapsed) {
      const r = mark.getBoundingClientRect()
      setTool({ mode: 'remove', x: r.left + r.width / 2, y: r.top, id: mark.dataset.mark! })
    }
  }

  const onOver = (e: React.MouseEvent) => {
    const term = (e.target as HTMLElement).closest<HTMLElement>('.tech')
    if (term && !note?.pinned) setNote({ ...techAt(term), pinned: false })
  }
  const onOut = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tech') && !note?.pinned) setNote(null)
  }

  // After a selection inside one text block, offer to highlight or underline it.
  const onSelect = () => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return setTool((t) => (t?.mode === 'add' ? null : t))
    const range = sel.getRangeAt(0)
    const el = (n: Node) => (n.nodeType === 1 ? (n as HTMLElement) : n.parentElement)
    const a = el(range.startContainer)?.closest<HTMLElement>('[data-seg]')
    const b = el(range.endContainer)?.closest<HTMLElement>('[data-seg]')
    const text = range.toString()
    if (!a || a !== b || !text.trim()) return setTool(null)
    const before = document.createRange()
    before.selectNodeContents(a)
    before.setEnd(range.startContainer, range.startOffset)
    const start = before.toString().length
    const r = range.getBoundingClientRect()
    setTool({ mode: 'add', x: r.left + r.width / 2, y: r.top, seg: Number(a.dataset.seg), start, end: start + text.length, text })
  }

  const mark = (kind: 'hl' | 'ul') => {
    if (tool?.mode !== 'add') return
    addMark(lesson.id, { seg: tool.seg, start: tool.start, end: tool.end, kind, text: tool.text })
    window.getSelection()?.removeAllRanges()
    setTool(null)
  }

  return (
    <main className="lesson" style={{ ['--line' as string]: track.color }}>
      <aside className="lesson-side">
        <Link to="/" className="back">
          All lines
        </Link>
        <h2>{track.name}</h2>
        <p>{track.blurb}</p>
        <TrackLine track={lesson.track} current={lesson.id} />
      </aside>

      <article className="lesson-body" key={lesson.id} onClick={onClick} onMouseOver={onOver} onMouseOut={onOut}>
        <header className="lesson-head">
          <p className="lesson-meta">
            <span className="pill">{track.name}</span>
            <span>
              Lesson {idx + 1} of {line.length}
            </span>
            <span>{lesson.minutes} min read</span>
            {lesson.level === 'deeper' && <span>Goes deeper</span>}
          </p>
          <h1>{lesson.title}</h1>
          <p className="lesson-summary">{lesson.summary}</p>
          {lesson.prereqs.length > 0 && (
            <p className="lesson-pre">
              Helps to know first:{' '}
              {lesson.prereqs.map((p, i) => (
                <span key={p}>
                  {i > 0 && ', '}
                  <Link to={`/lesson/${p}`}>{lessonById[p].title}</Link>
                  {done.has(p) && <span className="tick" title="Understood"> ✓</span>}
                </span>
              ))}
            </p>
          )}
          {techKeys.length > 0 && (
            <p className="lesson-tools">
              Technologies for this topic:{' '}
              {techKeys.map((k) => (
                <button key={k} type="button" className="tech tech-chip" data-tech={k}>
                  {TECH[k].title}
                </button>
              ))}
            </p>
          )}
        </header>

        <div className="prose" ref={prose} onMouseUp={onSelect} onKeyUp={onSelect}>
          {segs ? (
            segs.map((s, i) => {
              if (s.type === 'md') return <div key={i} data-seg={i} dangerouslySetInnerHTML={{ __html: s.html }} />
              if (s.type === 'quiz') return <Quiz key={i} questions={s.questions} />
              if (s.type === 'scenario') return <Scenario key={i} items={s.items} />
              const F = FIGURES[s.name]
              return (
                <figure key={i} className="fig">
                  <div className="fig-body">{F ? <F /> : <p>Figure “{s.name}” is missing.</p>}</div>
                  {s.caption && <figcaption dangerouslySetInnerHTML={{ __html: s.caption }} />}
                </figure>
              )
            })
          ) : (
            <p>This lesson is not written yet.</p>
          )}
        </div>

        <section className="lesson-end">
          <button className={`btn ${isDone ? '' : 'primary'}`} onClick={() => setDone(lesson.id, !isDone)}>
            {isDone ? 'Understood ✓ (select to undo)' : 'Mark as understood'}
          </button>
          <p className="marks-note">
            Select text in the lesson to highlight or underline it. Your marks are saved in this browser.
            {marks.length > 0 && (
              <>
                {' '}
                <button className="link-btn" onClick={() => confirm('Remove all your marks on this lesson?') && clearMarks(lesson.id)}>
                  Remove the {marks.length} on this lesson
                </button>
              </>
            )}
          </p>

          <div className="onward">
            {onward && (
              <Link to={`/lesson/${onward.id}`} className="onward-card main">
                <small>Next on the {track.name} line</small>
                <b>{onward.title}</b>
                <span>{onward.summary}</span>
              </Link>
            )}
            {branches.length > 0 && (
              <div className="onward-branches">
                <h2>{onward ? 'This lesson also leads to' : 'This lesson leads to'}</h2>
                <ul>
                  {branches.map((b) => (
                    <li key={b.id}>
                      <Link to={`/lesson/${b.id}`} style={{ ['--line' as string]: trackById[b.track].color }}>
                        <span className="pill">{trackById[b.track].name}</span>
                        <b>{b.title}</b>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {elsewhere.length > 0 && (
              <div className="onward-branches">
                <h2>End of the {track.name} line. Go to another line</h2>
                <ul>
                  {elsewhere.map((b) => (
                    <li key={b.id}>
                      <Link to={`/lesson/${b.id}`} style={{ ['--line' as string]: trackById[b.track].color }}>
                        <span className="pill">{trackById[b.track].name}</span>
                        <b>{b.title}</b>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="refs">
            <h2>Where this comes from</h2>
            <ul>
              {lesson.refs.map(([sid, where], i) => {
                const s = SOURCES[sid]
                return (
                  <li key={i}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer">
                        {s.title}
                      </a>
                    ) : (
                      <cite>{s.title}</cite>
                    )}
                    . {where}.
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </article>

      <aside className="lesson-rail" ref={rail} aria-live="polite">
        {note && <TechNote note={TECH[note.key]} top={note.top} pinned={note.pinned} onClose={() => setNote(null)} />}
      </aside>

      {tool && (
        <div className="mark-tool" style={{ left: tool.x, top: tool.y }} onMouseDown={(e) => e.preventDefault()}>
          {tool.mode === 'add' ? (
            <>
              <button onClick={() => mark('hl')}>
                <span className="swatch hl" /> Highlight
              </button>
              <button onClick={() => mark('ul')}>
                <span className="swatch ul" /> Underline
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                removeMark(lesson.id, tool.id)
                setTool(null)
              }}
            >
              Remove this mark
            </button>
          )}
        </div>
      )}
    </main>
  )
}
