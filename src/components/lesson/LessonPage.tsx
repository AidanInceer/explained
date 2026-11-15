import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { lessonById, lessonsOf } from '../../data/curriculum'
import { TECH } from '../../data/tech'
import { subjectById } from '../../data/subjects'
import { trackById } from '../../data/tracks'
import { useLessonContent } from '../../lessons/load'
import { paint, useMarks } from '../../lib/marks'
import { onwardFrom, setDone, useProgress } from '../../lib/progress'
import { useQuizScores } from '../../lib/quizStore'
import { useStoredChoice } from '../../lib/storage'
import TrackLine from '../TrackLine'
import LessonEnd from './LessonEnd'
import LessonFigure from './LessonFigure'
import MarkToolbar from './MarkToolbar'
import PartsNav from './PartsNav'
import Quiz from './Quiz'
import Scenario from './Scenario'
import SideNote, { type Note } from './SideNote'
import { useMarkTool } from './useMarkTool'

/** The site's base path, with a final "/". */
const BASE = import.meta.env.BASE_URL

export default function LessonPage() {
  const { id = '' } = useParams()
  const lesson = lessonById[id]
  const done = useProgress()
  const nav = useNavigate()
  const marks = useMarks(id)
  const prose = useRef<HTMLDivElement>(null)
  const rail = useRef<HTMLElement>(null)
  const [note, setNote] = useState<Note | null>(null)
  const { tool, setTool, onSelect, pickMark, mark, unmark } = useMarkTool(id, marks)
  const [sideOpen, setSideOpen] = useState(() => window.matchMedia('(min-width: 861px)').matches)
  const content = useLessonContent(lesson?.id)
  const segs = content?.segs ?? null
  const parts = content?.parts ?? []
  const last = parts.length - 1
  // When the lesson ends with a quiz that is all correct, the quiz box already has the "Mark as understood" button.
  const quizScore = useQuizScores()[id]
  const quizEnds = !!segs && segs.length > 0 && segs[segs.length - 1].type === 'quiz' && !!quizScore && quizScore.correct === quizScore.total
  // Sections open in steps of a few at a time (see groupSteps). A reader who wants the whole page at once can choose
  // that, and it is remembered.
  const [wide, setWide] = useStoredChoice('dee.wide.v1', '1', '0')
  const chooseWide = (v: boolean) => {
    setWide(v)
    setNote(null)
  }
  const [all, chooseAll] = useStoredChoice('dee.read.v1', 'all', 'parts')
  const [open, setOpen] = useState(0)
  const shown = all ? last : Math.max(0, Math.min(open, last))
  const sections = parts.reduce((n, p) => n + p.length, 0)
  /** Open steps up to `n`, then scroll to section `sec`, or to the start of step `n`. */
  const reveal = (n: number, sec?: number) => {
    setOpen((o) => Math.max(o, n))
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => {
      const to = (sec && prose.current?.querySelector(`[data-sec="${sec}"]`)) || document.getElementById(`part-${n}`)
      to?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' })
    })
  }

  // A new lesson starts with no open note and no toolbar.
  useEffect(() => {
    setNote(null)
    setTool(null)
    setOpen(0)
  }, [id, setTool])

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
  }, [marks, segs, id, shown])

  if (!lesson) {
    return (
      <main className="page narrow">
        <h1>No lesson at this address</h1>
        <p>
          <Link to="/">Go to the home page</Link>, choose a subject, and find the lesson on its map.
        </p>
      </main>
    )
  }

  const track = trackById[lesson.track]
  const isDone = done.has(lesson.id)
  const line = lessonsOf(lesson.track)
  const idx = line.indexOf(lesson)
  const onward = onwardFrom(lesson, done)

  const noteAt = (el: HTMLElement): Omit<Note, 'pinned'> => ({
    kind: el.dataset.term ? 'term' : 'tech',
    key: (el.dataset.term ?? el.dataset.tech)!,
    top: Math.max(0, el.getBoundingClientRect().top - (rail.current?.getBoundingClientRect().top ?? 0) - 14),
  })

  const onClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const term = target.closest<HTMLElement>('.tech, .term')
    if (term) {
      const at = noteAt(term)
      setNote(note?.pinned && note.key === at.key && note.kind === at.kind ? null : { ...at, pinned: true })
      return
    }
    // Internal links inside rendered markdown should not reload the page. Their address includes the site's base path.
    const href = target.closest('a')?.getAttribute('href')
    if (href?.startsWith('/')) {
      e.preventDefault()
      nav(href.startsWith(BASE) ? href.slice(BASE.length - 1) : href)
      return
    }
    const markEl = target.closest<HTMLElement>('mark.um')
    if (markEl && window.getSelection()?.isCollapsed) pickMark(markEl)
  }

  const onOver = (e: React.MouseEvent) => {
    const term = (e.target as HTMLElement).closest<HTMLElement>('.tech, .term')
    if (term && !note?.pinned) setNote({ ...noteAt(term), pinned: false })
  }
  const onOut = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.tech, .term') && !note?.pinned) setNote(null)
  }

  return (
    <main className={wide ? 'lesson wide' : 'lesson'} style={{ ['--line' as string]: track.color }}>
      <aside className="lesson-side">
        <a className="skip" href="#lesson-title">
          Skip the lesson list
        </a>
        <Link to={subjectById[lesson.subject].path} className="back">
          {subjectById[lesson.subject].name}: all lines
        </Link>
        <h2>{track.name}</h2>
        <p>{track.blurb}</p>
        <details className="side-lessons" open={sideOpen} onToggle={(e) => setSideOpen(e.currentTarget.open)}>
          <summary>
            Lessons in {track.name} <span>{line.length}</span>
          </summary>
          <TrackLine track={lesson.track} current={lesson.id} />
        </details>
      </aside>

      <article className="lesson-body" key={lesson.id} onClick={onClick} onMouseOver={onOver} onMouseOut={onOut}>
        <header className="lesson-head">
          <p className="lesson-meta">
            <span className="pill">{track.name}</span>
            <span>
              Lesson {idx + 1} of {line.length}
            </span>
            <span>{lesson.minutes} min read</span>
            {lesson.level === 'deeper' && <span className="meta-deeper">Goes deeper</span>}
            <button className="link-btn wide-btn" onClick={() => chooseWide(!wide)} aria-pressed={wide}>
              {wide ? 'Normal width' : 'Wide view'}
            </button>
          </p>
          <h1 id="lesson-title" tabIndex={-1}>
            {lesson.title}
          </h1>
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
          {lesson.tech.length > 0 && (
            <p className="lesson-tools">
              Technologies for this topic:{' '}
              {lesson.tech.map((k) => (
                <button key={k} type="button" className="tech tech-chip" data-tech={k}>
                  {TECH[k].title}
                </button>
              ))}
            </p>
          )}
        </header>

        {sections > 2 && <PartsNav parts={parts} shown={shown} all={all} onOpen={reveal} onChooseAll={chooseAll} />}

        <div className="prose" ref={prose} onMouseUp={onSelect} onKeyUp={onSelect}>
          {segs ? (
            parts.map((_, n) =>
              n > shown ? null : (
                <section key={n} id={`part-${n}`} className={n > 0 && !all ? 'lpart opened' : 'lpart'}>
                  {segs.map((s, i) => {
                    if (s.part !== n) return null
                    if (s.type === 'md') return <div key={i} data-seg={i} dangerouslySetInnerHTML={{ __html: s.html }} />
                    if (s.type === 'quiz')
                      return (
                        <Quiz
                          key={`${lesson.id}-${i}`}
                          questions={s.questions}
                          lessonId={lesson.id}
                          next={onward.next}
                          understood={isDone}
                          onUnderstood={(v) => setDone(lesson.id, v)}
                        />
                      )
                    if (s.type === 'scenario') return <Scenario key={i} items={s.items} />
                    return <LessonFigure key={i} name={s.name} caption={s.caption} />
                  })}
                </section>
              ),
            )
          ) : content === undefined ? (
            <p className="lesson-loading" role="status">
              Loading the lesson…
            </p>
          ) : (
            <p>This lesson is not written yet.</p>
          )}
        </div>

        {shown < last && (
          <div className="part-next">
            <button className="btn primary" onClick={() => reveal(shown + 1)}>
              Continue
            </button>
            <p>
              <span>
                Step {shown + 2} of {last + 1}
              </span>
              <b>{parts[shown + 1].join(', ')}</b>
            </p>
          </div>
        )}

        <LessonEnd lesson={lesson} hidden={shown < last} isDone={isDone} quizEnds={quizEnds} markCount={marks.length} onward={onward} />
      </article>

      <aside className="lesson-rail" ref={rail} aria-live="polite">
        {note && <SideNote note={note} onClose={() => setNote(null)} />}
      </aside>

      {tool && <MarkToolbar tool={tool} onMark={mark} onUnmark={unmark} />}
    </main>
  )
}
