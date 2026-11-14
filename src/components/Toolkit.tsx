import { Link } from 'react-router-dom'
import { lessonById } from '../data/curriculum'
import Corners from './Corners'
import { LANGS, ORDER, SKILLS } from '../data/toolkit'

export default function Toolkit() {
  return (
    <main className="page toolkit">
      <h1>The toolkit</h1>
      <p className="lead">
        The map explains ideas. This page lists what you need in your hands: the languages that data engineers write,
        and the things that a useful colleague can do. Nobody knows all of it on the first day. The first three
        languages and the “Build” list are enough to start.
      </p>

      <h2>Languages</h2>
      <p className="tk-note">Each link goes to the official documentation or to a well-known free tutorial.</p>
      {ORDER.map((level) => (
        <section key={level} className={`tk-level ${level === 'Essential' ? 'lv-essential' : level === 'Important' ? 'lv-important' : 'lv-some'}`}>
          <h3>
            <span className="tk-tag">{level}</span>
            <small>
              {level === 'Essential' ? 'You use these every day, in every data engineering job.' : level === 'Important' ? 'Most jobs use most of these. Learn each one when a project needs it.' : 'Depends on the team. Know what they are for. Learn them if your role needs them.'}
            </small>
          </h3>
          <div className="tk-grid">
            {LANGS.filter((l) => l.level === level).map((l) => (
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
                        <Link to={`/lesson/${id}`}>{lessonById[id].title}</Link>
                      </span>
                    ))}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <h2>What a good data engineer can do</h2>
      <p className="tk-note">
        A list to measure yourself against, and to find the next lesson. Tools change each few years. These abilities do
        not.
      </p>
      <div className="tk-skills">
        <Corners />
        {SKILLS.map((g) => (
          <section key={g.group}>
            <h3>{g.group}</h3>
            <p>{g.lead}</p>
            <ul>
              {g.items.map(([text, ids]) => (
                <li key={text}>
                  {text}
                  <span>
                    {ids.map((id) => (
                      <Link key={id} to={`/lesson/${id}`}>
                        {lessonById[id].title}
                      </Link>
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
