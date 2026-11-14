/** The list of parts at the top of a lesson. Parts open one at a time, unless the reader chose to open all. */
export default function PartsNav({
  parts,
  shown,
  all,
  onReveal,
  onChooseAll,
}: {
  parts: string[]
  shown: number
  all: boolean
  onReveal: (n: number) => void
  onChooseAll: (v: boolean) => void
}) {
  const last = parts.length - 1
  return (
    <nav className="parts-nav" aria-label="Parts of this lesson">
      <div className="parts-head">
        <b>In this lesson</b>
        <span>{all ? `${last} parts` : `Part ${shown} of ${last} open`}</span>
        <button className="link-btn" onClick={() => onChooseAll(!all)}>
          {all ? 'Open one part at a time' : 'Open all parts'}
        </button>
      </div>
      {!all && (
        <div className="parts-bar" aria-hidden="true">
          <i style={{ width: `${(shown / last) * 100}%` }} />
        </div>
      )}
      <ol>
        {parts.slice(1).map((t, i) => (
          <li key={i} className={i + 1 <= shown ? 'open' : ''}>
            <button onClick={() => onReveal(i + 1)}>
              <i>{i + 1}</i>
              <span>{t}</span>
              {!all && i + 1 > shown && <small>not open yet</small>}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
