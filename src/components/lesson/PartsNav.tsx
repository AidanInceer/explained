/**
 * The list of sections at the top of a lesson. Sections open in steps of a few at a time, unless the reader chose to
 * open the whole lesson. `parts` holds the section headings of each step.
 */
export default function PartsNav({
  parts,
  shown,
  all,
  onOpen,
  onChooseAll,
}: {
  parts: string[][]
  shown: number
  all: boolean
  onOpen: (step: number, sec: number) => void
  onChooseAll: (v: boolean) => void
}) {
  const steps = parts.length
  const count = parts.reduce((n, p) => n + p.length, 0)
  let sec = 0
  return (
    <nav className="parts-nav" aria-label="Sections of this lesson">
      <div className="parts-head">
        <b>In this lesson</b>
        <span>{all || steps < 2 ? `${count} sections` : `Step ${shown + 1} of ${steps}`}</span>
        {steps > 1 && (
          <button className="link-btn" onClick={() => onChooseAll(!all)}>
            {all ? 'Open in steps' : 'Open the whole lesson'}
          </button>
        )}
      </div>
      {!all && steps > 1 && (
        <div className="parts-bar" aria-hidden="true">
          {parts.map((_, s) => (
            <i key={s} className={s <= shown ? 'on' : undefined} />
          ))}
        </div>
      )}
      <ol>
        {parts.map((heads, step) =>
          heads.map((t, j) => {
            const k = ++sec
            const locked = !all && step > shown
            return (
              <li key={k} className={[locked ? 'locked' : 'open', j === 0 && step > 0 ? 'step-start' : ''].join(' ').trim()}>
                <button onClick={() => onOpen(step, k)}>
                  <i>{k}</i>
                  <span>{t}</span>
                  {locked && j === 0 && <small>Step {step + 1}</small>}
                </button>
              </li>
            )
          }),
        )}
      </ol>
    </nav>
  )
}
