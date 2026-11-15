import type { Subject } from '../data/subjects'
import { ORDER, TOOLKITS } from '../data/toolkit'
import LessonRef from './LessonRef'

export default function Toolkit({ subject }: { subject: Subject }) {
  const { lead, langsTitle, langs, levelNotes, skillsTitle, skillsNote, skills } = TOOLKITS[subject.id]
  return (
    <main className="page toolkit">
      <p className="page-kicker">{subject.name}</p>
      <h1>The toolkit</h1>
      <p className="lead">{lead}</p>

      <h2>{langsTitle}</h2>
      <p className="tk-note">Each link goes to the official documentation or to a well-known free tutorial.</p>
      {ORDER.filter((level) => langs.some((l) => l.level === level)).map((level) => (
        <section key={level} className={`tk-level ${level === 'Essential' ? 'lv-essential' : level === 'Important' ? 'lv-important' : 'lv-some'}`}>
          <h3>
            <span className="tk-tag">{level}</span>
            <small>{levelNotes[level]}</small>
          </h3>
          <div className="tk-grid">
            {langs.filter((l) => l.level === level).map((l) => (
              <article key={l.name} className="tk-card">
                <h4>{l.name}</h4>
                <p>{l.use}</p>
                <h5>Learn first</h5>
                <ul>
                  {l.first.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <h5>Where to learn it</h5>
                <ul className="tk-links">
                  {l.links.map(([text, url]) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noreferrer">
                        {text}
                      </a>
                    </li>
                  ))}
                </ul>
                {l.lessons && (
                  <p className="tk-lessons">
                    On the map:{' '}
                    {l.lessons.map((id, i) => (
                      <span key={id}>
                        {i > 0 && ', '}
                        <LessonRef id={id} />
                      </span>
                    ))}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <h2>{skillsTitle}</h2>
      <p className="tk-note">{skillsNote}</p>
      <div className="tk-skills">
        {skills.map((g) => (
          <section key={g.group}>
            <h3>{g.group}</h3>
            <p>{g.lead}</p>
            <ul>
              {g.items.map(([text, ids]) => (
                <li key={text}>
                  {text}
                  <span>
                    {ids.map((id) => (
                      <LessonRef key={id} id={id} />
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
