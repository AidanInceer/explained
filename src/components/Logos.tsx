import type { ReactNode } from 'react'

/* Ten logo options. Each mark is drawn on a 32 by 32 grid and uses currentColor for its ink, so that it works on light and dark. */

type Mark = (p: { size?: number }) => ReactNode
const svg = (size: number, children: ReactNode) => (
  <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
    {children}
  </svg>
)
const BLUE = '#2f6bff'
const GREEN = '#0b9a84'
const PINK = '#e0457b'
const AMBER = '#ffcf3f'

const Station: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M16 2v5M16 25v5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="16" cy="16" r="7.5" fill="none" stroke={BLUE} strokeWidth="5" />
    </>,
  )

const Dag: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M5.5 16 16 7l10.5 9L16 25Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="5.5" cy="16" r="4" fill="currentColor" />
      <circle cx="26.5" cy="16" r="4" fill="currentColor" />
      <circle cx="16" cy="7" r="4" fill={GREEN} />
      <circle cx="16" cy="25" r="4" fill={GREEN} />
    </>,
  )

const RowsColumns: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <rect x="3" y="5" width="11.5" height="5.4" rx="1.6" fill="currentColor" />
      <rect x="3" y="13.3" width="11.5" height="5.4" rx="1.6" fill="currentColor" />
      <rect x="3" y="21.6" width="11.5" height="5.4" rx="1.6" fill="currentColor" />
      <rect x="17.6" y="5" width="3.4" height="22" rx="1.6" fill={BLUE} />
      <rect x="21.6" y="5" width="3.4" height="22" rx="1.6" fill={BLUE} opacity="0.7" />
      <rect x="25.6" y="5" width="3.4" height="22" rx="1.6" fill={BLUE} opacity="0.45" />
    </>,
  )

const Layers: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M16 3.5 28.5 10 16 16.5 3.5 10Z" fill={BLUE} />
      <path d="M4.5 16 16 22l11.5-6M4.5 21.5 16 27.5l11.5-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  )

const PipeD: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <circle cx="13" cy="19.5" r="7.2" fill="none" stroke="currentColor" strokeWidth="5" />
      <path d="M22.7 4.5v22.2" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <circle cx="13" cy="19.5" r="2.5" fill={PINK} />
    </>,
  )

const Highlight: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <rect x="1.5" y="6" width="29" height="20" rx="4" fill={AMBER} />
      <text x="16" y="22" textAnchor="middle" fontFamily="'Bricolage Grotesque Variable', 'Segoe UI', sans-serif" fontWeight="800" fontSize="16" letterSpacing="-0.8" fill="#132029">
        de
      </text>
    </>,
  )

const Grain: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      {[7, 16, 25].map((x) =>
        [6.5, 25.5].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.6" fill="currentColor" />),
      )}
      <rect x="3" y="12" width="26" height="8" rx="4" fill={BLUE} />
    </>,
  )

const Partitions: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <rect x="12.2" y="4.5" width="7.6" height="23" fill={GREEN} />
      <rect x="4.5" y="4.5" width="23" height="23" rx="5" fill="none" stroke="currentColor" strokeWidth="2.8" />
      <path d="M12.2 4.5v23M19.8 4.5v23" stroke="currentColor" strokeWidth="2.8" />
    </>,
  )

const Understood: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <circle cx="16" cy="16" r="11.5" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="m10.5 16.5 4 4 7.5-8.8" fill="none" stroke={GREEN} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
    </>,
  )

const StreamBatch: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      {[5, 10.5, 16, 21.5, 27].map((x) => (
        <circle key={x} cx={x} cy="9" r="2.2" fill={PINK} />
      ))}
      <rect x="3" y="16" width="26" height="11" rx="3.2" fill="currentColor" />
    </>,
  )

export const LOGOS: { name: string; mark: Mark; idea: string; note: string; wordOnly?: boolean }[] = [
  { name: 'Station', mark: Station, idea: 'One lesson dot on its line, taken from the map of this site.', note: 'The only mark that comes from the product itself. Very clear at 16 pixels.' },
  { name: 'Small DAG', mark: Dag, idea: 'Four tasks: one splits into two, and they join again.', note: 'Every data engineer reads it at once. A beginner sees a diamond.' },
  { name: 'Rows to columns', mark: RowsColumns, idea: 'The same data as rows, then as columns: the first idea of the Storage line.', note: 'Has a real idea behind it. The most detail of the ten, so the weakest at small size.' },
  { name: 'Layers', mark: Layers, idea: 'Raw, clean and modeled data, as three layers.', note: 'Clear and calm. Many products use a stack of layers, so it is the least distinct.' },
  { name: 'Pipe d', mark: PipeD, idea: 'The letter d drawn as a pipe, with one record inside.', note: 'A letter mark, so it pairs well with the name. Works in one colour.' },
  { name: 'Highlighter', mark: Highlight, idea: 'The word “Explained” marked with the reader’s own yellow highlighter.', note: 'A wordmark, not a symbol. It ties the logo to a feature of the site.', wordOnly: true },
  { name: 'Grain', mark: Grain, idea: 'A table of dots with one row marked: “what is one row?”', note: 'Names the question that the modeling lessons repeat. Reads as a table at once.' },
  { name: 'One partition', mark: Partitions, idea: 'A table in three parts, and the query reads one.', note: 'Simple and geometric. It can look like a layout icon out of context.' },
  { name: 'Understood', mark: Understood, idea: 'The mark that a lesson gets when you understand it.', note: 'About learning, not about data. A check in a ring is a common shape.' },
  { name: 'Stream and batch', mark: StreamBatch, idea: 'Events one by one above, one block below.', note: 'Shows the central choice of the field. Needs the name next to it to be read.' },
]

function Word({ hl }: { hl?: boolean }) {
  return hl ? (
    <span className="lg-word">
      Data Engineering <mark>Explained</mark>
    </span>
  ) : (
    <span className="lg-word">
      Data Engineering <em>Explained</em>
    </span>
  )
}

export default function Logos() {
  return (
    <section className="logos">
      <h2>Ten logo options</h2>
      <p className="brand-more">
        Each one is shown large, on dark, at browser-tab size, and next to the name as it would be in the header. Tell
        me the numbers that you like, and what to change.
      </p>
      <div className="lg-grid">
        {LOGOS.map((l, i) => (
          <article key={l.name} className="lg-card">
            <header>
              <b>
                {i + 1}. {l.name}
              </b>
            </header>
            <div className="lg-show">
              <div className="lg-tile">
                <l.mark size={84} />
              </div>
              <div className="lg-tile dark">
                <l.mark size={84} />
              </div>
              <div className="lg-tile tab">
                <l.mark size={18} />
              </div>
            </div>
            <div className="lg-lock">
              {!l.wordOnly && <l.mark size={28} />}
              <Word hl={l.wordOnly} />
            </div>
            <p>{l.idea}</p>
            <p className="lg-note">{l.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
