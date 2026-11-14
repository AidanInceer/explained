import { Fragment, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LESSONS, lessonsIn } from '../../data/curriculum'
import { PROPOSE_LESSON_URL, REPO_URL } from '../../data/site'
import { countsOf, SUBJECTS, type Subject } from '../../data/subjects'
import { trackById } from '../../data/tracks'
import { still, useSeen } from '../../lib/motion'
import { nextUp, useProgress } from '../../lib/progress'
import Corners from '../Corners'
import './intro.css'


/** A station on the opening map: a rounded square, as on the real lesson maps. */
type Stop = { x: number; y: number; done?: number; next?: boolean }
const LINES: { s: Subject; d: string; stops: Stop[]; delay: number }[] = [
  {
    s: SUBJECTS[0],
    d: 'M90 70V210L140 260V400',
    stops: [{ x: 90, y: 105, done: 0 }, { x: 90, y: 170, done: 1 }, { x: 140, y: 270, next: true }, { x: 140, y: 335 }, { x: 140, y: 400 }],
    delay: 0.15,
  },
  {
    s: SUBJECTS[1],
    d: 'M260 70V190L220 230V400',
    stops: [{ x: 260, y: 105 }, { x: 260, y: 170 }, { x: 220, y: 255 }, { x: 220, y: 325 }, { x: 220, y: 400 }],
    delay: 0.3,
  },
  {
    s: SUBJECTS[2],
    d: 'M430 70V150L380 200V300L430 350V400',
    stops: [{ x: 430, y: 110 }, { x: 380, y: 220 }, { x: 380, y: 290 }, { x: 430, y: 400 }],
    delay: 0.45,
  },
]
/** Dashed links between lines: a lesson on one subject that helps with a lesson on another. */
const CROSS = ['M90 170C150 170 220 200 220 255', 'M260 170C320 170 380 180 380 220', 'M220 325C320 325 430 330 430 370']

/** The opening drawing: three subjects drawn as lines of lessons, the same as the maps inside. */
function OpeningMap() {
  const done = useProgress()
  const next = nextUp(done, lessonsIn('data'))
  return (
    <div className="lm">
      <Corners />
      <svg viewBox="0 0 520 440" className="lm-svg" aria-hidden="true">
        {CROSS.map((d, i) => (
          <path key={d} d={d} className="lm-cross" style={{ animationDelay: `${1.3 + i * 0.12}s` }} />
        ))}
        {LINES.map(({ s, d, delay }) => (
          <path key={s.id} id={`lm-${s.id}`} d={d} pathLength={1} className="lm-line" style={{ stroke: s.color, animationDelay: `${delay}s` }} />
        ))}
        {LINES.map(({ s, stops, delay }) =>
          stops.map((p, i) => (
            <g
              key={`${s.id}${i}`}
              className={['lm-st', s.status, p.done !== undefined && 'done', p.next && 'next'].filter(Boolean).join(' ')}
              style={{ ['--c' as string]: s.color, ['--d' as string]: `${delay + 0.25 + (p.y - 70) / 420}s`, ['--f' as string]: `${2 + (p.done ?? 0) * 0.35}s` }}
            >
              {p.next && <rect x={p.x - 19} y={p.y - 19} width="38" height="38" rx="9" className="lm-ring" />}
              <rect x={p.x - 11} y={p.y - 11} width="22" height="22" rx="5" className="lm-box" />
              {p.done !== undefined && <path d={`M${p.x - 5} ${p.y}l3.5 3.5 6.5-7`} className="lm-tick" />}
              {p.next && <rect x={p.x - 5.5} y={p.y - 5.5} width="11" height="11" rx="2" className="lm-core" />}
            </g>
          )),
        )}
        {/* One packet on each line, all at the same speed. */}
        {!still &&
          LINES.map(({ s }, i) => (
            <rect key={s.id} x="-4.5" y="-4.5" width="9" height="9" rx="2" className="lm-packet" fill={s.color} opacity="0">
              <animateMotion dur="4.2s" begin={`${2.4 + i * 0.7}s`} repeatCount="indefinite" calcMode="linear">
                <mpath href={`#lm-${s.id}`} />
              </animateMotion>
              <animate attributeName="opacity" dur="4.2s" begin={`${2.4 + i * 0.7}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.08;0.9;1" />
            </rect>
          ))}
        {LINES.map(({ s, delay }, i) => (
          <g key={s.id} className="lm-pill" style={{ animationDelay: `${delay + 0.1}s` }}>
            <rect x={[90, 260, 430][i] - 44} y="26" width="88" height="28" rx="4" fill={s.color} />
            <text x={[90, 260, 430][i]} y="45" textAnchor="middle">
              {s.short}
            </text>
          </g>
        ))}
      </svg>
      {next ? (
        <Link to={`/lesson/${next.id}`} className="lm-next">
          <i aria-hidden="true" />
          <span>
            <small>{done.size ? 'Next for you' : 'Start here'}</small>
            <b>{next.title}</b>
          </span>
          <span className="lm-meta">
            {trackById[next.track].name}, {next.minutes} min
          </span>
        </Link>
      ) : (
        <p className="lm-next">
          <span>
            <small>Data engineering</small>
            <b>Every lesson understood</b>
          </span>
        </p>
      )}
    </div>
  )
}

/** The words of a heading, each rising into place a little after the one before. */
function Rise({ text, from = 0 }: { text: string; from?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="rise" style={{ animationDelay: `${from + i * 0.055}s` }}>
            {w}
          </span>
        </Fragment>
      ))}
    </>
  )
}

const MINUTES = LESSONS.map((l) => l.minutes)

/** How to use the site, in order. Each step is a station on one short line. */
const STEPS = [
  { title: 'Choose a subject', text: 'Use Data, Software or AI at the top of the page. Each subject has its own map, toolkit, glossary and sources.' },
  { title: 'Start at the top of the map', text: 'Higher lessons come first. A line into a lesson shows what helps to know before it. Nothing is locked.' },
  {
    title: 'Read one lesson',
    text: `One idea, a drawing and a short quiz. A lesson takes ${Math.min(...MINUTES)} to ${Math.max(...MINUTES)} minutes.`,
  },
  { title: 'Mark it as understood', text: 'Progress is saved in this browser, with no account. The map then shows your next lesson.' },
]

function SubjectCard({ s, done }: { s: Subject; done: Set<string> }) {
  const { written, total } = countsOf(s)
  const mine = lessonsIn(s.id).filter((l) => done.has(l.id)).length
  const state = written === total ? 'written' : written === 0 ? 'planned' : 'partial'
  return (
    <Link to={s.path} className={`subject-card ${state}`} style={{ ['--c' as string]: s.color }}>
      <span className="sc-top">
        <h3>{s.name}</h3>
        <span className="sc-tag">{state === 'written' ? 'Written' : state === 'planned' ? 'Planned' : 'In progress'}</span>
      </span>
      <p>{s.blurb}</p>
      <span className="sc-go">
        <span className="sc-count">
          {mine ? `${mine} of ${written} understood` : state === 'partial' ? `${written} of ${total} lessons written` : `${total} lessons`}
        </span>
        <span>
          {state === 'planned' ? 'See the plan' : 'Open the map'}
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path d="M3 8h9M8.5 4 12.5 8 8.5 12" />
          </svg>
        </span>
      </span>
    </Link>
  )
}

/** The home page of the whole site: what Explained is, how to use it, and the subjects. */
export default function Landing() {
  const done = useProgress()
  const loc = useLocation()
  const nav = useNavigate()
  const [howRef, howSeen] = useSeen<HTMLElement>()
  const [subRef, subSeen] = useSeen<HTMLElement>()

  // The lesson map used to be on this page. Old links to "/#map" go to its new place.
  useEffect(() => {
    if (loc.hash === '#map') nav('/data#map', { replace: true })
  }, [loc.hash, nav])

  return (
    <main className="landing">
      <section className="land-hero">
        <div className="land-copy">
          <h1>
            <Rise text="Short lessons on data, software and AI." />
          </h1>
          <p className="lead rise" style={{ animationDelay: '0.35s' }}>
            Each lesson explains one idea, with a drawing and a short quiz. The lessons sit on a map, in the order to
            learn them.
          </p>
          <div className="hero-go row rise" style={{ animationDelay: '0.5s' }}>
            <Link className="btn primary" to="/data">
              {done.size ? 'Continue with data engineering' : 'Start with data engineering'}
            </Link>
            <a className="link-btn" href="#subjects">
              All subjects
            </a>
          </div>
        </div>
        <OpeningMap />
      </section>

      <section className={`land-how ${howSeen ? 'seen' : ''}`} ref={howRef} aria-labelledby="how">
        <h2 id="how">How to use the site</h2>
        <ol className="steps">
          {STEPS.map((st, i) => (
            <li key={st.title} style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="step-n" aria-hidden="true">
                {i + 1}
              </span>
              <b>{st.title}</b>
              {st.text}
            </li>
          ))}
        </ol>
      </section>

      <section className={`land-subjects ${subSeen ? 'seen' : ''}`} ref={subRef} id="subjects" aria-labelledby="subjects-title">
        <h2 id="subjects-title">Subjects</h2>
        <div className="subject-grid">
          {SUBJECTS.map((s) => (
            <SubjectCard key={s.id} s={s} done={done} />
          ))}
        </div>
      </section>

      <p className="land-open">
        <span>All lessons and plans are on GitHub. Found an error, or want to write a planned lesson?</span>
        <a href={PROPOSE_LESSON_URL} target="_blank" rel="noreferrer">
          Propose a lesson
        </a>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          See the code
        </a>
      </p>
    </main>
  )
}
