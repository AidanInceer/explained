import { INTERVIEWS } from '../data/interviews'
import type { Subject } from '../data/subjects'
import LessonRef from './LessonRef'

/** Links to the lessons that teach an item. */
function Lessons({ ids }: { ids: string[] }) {
  if (!ids.length) return null
  return (
    <p className="iv-lessons">
      Learn it:{' '}
      {ids.map((id, i) => (
        <span key={id}>
          {i > 0 && ', '}
          <LessonRef id={id} />
        </span>
      ))}
    </p>
  )
}

/** The Interviews page of a subject: hiring stages, common questions, gotchas on the job, and places to practise. */
export default function Interviews({ subject }: { subject: Subject }) {
  const g = INTERVIEWS[subject.id]
  return (
    <main className="page interviews" style={{ ['--line' as string]: subject.color }}>
      <p className="page-kicker">{subject.name}</p>
      <h1>Interviews and the job</h1>
      <p className="lead">{g.lead}</p>

      <h2>The stages</h2>
      <p className="tk-note">A typical order. Companies differ, and most use only some of these.</p>
      <ol className="iv-line">
        {g.stages.map((s) => (
          <li key={s.name}>
            <h3>{s.name}</h3>
            <p>{s.tests}</p>
            <ul>
              {s.prepare.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Lessons ids={s.lessons} />
          </li>
        ))}
      </ol>

      <h2>Questions that come up often</h2>
      <p className="tk-note">Answer each one in your head, then open it to compare. The notes say what a good answer covers.</p>
      {g.questions.map((t) => (
        <section key={t.topic} className="iv-topic">
          <h3>{t.topic}</h3>
          {t.items.map((q) => (
            <details key={q.q} className="iv-q">
              <summary>{q.q}</summary>
              <div>
                <p>{q.answer}</p>
                <Lessons ids={q.lessons} />
              </div>
            </details>
          ))}
        </section>
      ))}

      <h2>Gotchas on the job</h2>
      <p className="tk-note">Mistakes that new people make often in the first months. Each one is easy to avoid once you know it.</p>
      <div className="iv-gotchas">
        {g.gotchas.map((x) => (
          <article key={x.title}>
            <h3>{x.title}</h3>
            <p>{x.why}</p>
            <p className="iv-instead">
              <b>Instead:</b> {x.instead}
            </p>
            <Lessons ids={x.lessons} />
          </article>
        ))}
      </div>

      <h2>Where to practise</h2>
      <ul className="iv-practice">
        {g.practice.map(([name, url, note]) => (
          <li key={url}>
            <a href={url} target="_blank" rel="noreferrer">
              {name}
            </a>
            <span>{note}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
