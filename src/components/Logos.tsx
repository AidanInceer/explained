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

/* ---- round two: refinements of 10, 3 and 8, and the pipeline and bronze-to-gold idea ---- */
const BRONZE = '#b8692e'
const SILVER = '#9aa6ad'
const GOLD = '#e8b21e'

const DotsBar: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      {[5.5, 12.5, 19.5, 26.5].map((x) => (
        <circle key={x} cx={x} cy="10.5" r="3" fill={BLUE} />
      ))}
      <rect x="2.5" y="18" width="27" height="6" rx="3" fill="currentColor" />
    </>,
  )

const DotsBarTile: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#132029" />
      {[8, 13.3, 18.7, 24].map((x) => (
        <circle key={x} cx={x} cy="11.5" r="2.1" fill="#7fa6ff" />
      ))}
      <rect x="6" y="17" width="20" height="6.5" rx="2.4" fill="#fff" />
    </>,
  )

const RowColumn: Mark = ({ size = 26 }) => {
  const at = [3, 12.5, 22]
  return svg(
    size,
    <>
      {at.map((y, r) =>
        at.map((x, c) => (
          <rect key={`${r}${c}`} x={x} y={y} width="7" height="7" rx="1.8" fill={r === 1 && c === 1 ? GOLD : c === 1 ? BLUE : 'currentColor'} opacity={r === 1 || c === 1 ? 1 : 0.2} />
        )),
      )}
    </>,
  )
}

const RowsColumnsTile: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <rect x="1" y="1" width="30" height="30" rx="8" fill="#132029" />
      {[7, 13.5, 20].map((y) => (
        <rect key={y} x="6" y={y} width="8.5" height="5" rx="1.4" fill="#fff" />
      ))}
      {[17.5, 21.6, 25.7].map((x) => (
        <rect key={x} x={x - 0.6} y="7" width="3" height="18" rx="1.4" fill="#7fa6ff" />
      ))}
    </>,
  )

const Slabs: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M4 9a5 5 0 0 1 5-5h1.6v24H9a5 5 0 0 1-5-5Z" fill="currentColor" />
      <rect x="12.6" y="4" width="6.8" height="24" fill={GREEN} />
      <path d="M21.4 4H23a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5h-1.6Z" fill="currentColor" />
    </>,
  )

const SlabsBSG: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M4 9a5 5 0 0 1 5-5h1.6v24H9a5 5 0 0 1-5-5Z" fill={BRONZE} />
      <rect x="12.6" y="4" width="6.8" height="24" fill={SILVER} />
      <path d="M21.4 4H23a5 5 0 0 1 5 5v14a5 5 0 0 1-5 5h-1.6Z" fill={GOLD} />
    </>,
  )

const ThreeStops: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M3 16h26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="6.5" cy="16" r="4.1" fill={BRONZE} />
      <circle cx="16" cy="16" r="4.1" fill={SILVER} />
      <circle cx="25.5" cy="16" r="4.1" fill={GOLD} />
    </>,
  )

const PipeBSG: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M3 9.5h10" stroke={BRONZE} strokeWidth="7" fill="none" />
      <path d="M13 9.5h2.5a7 7 0 0 1 7 7V18" stroke={SILVER} strokeWidth="7" fill="none" />
      <path d="M22.5 18v11" stroke={GOLD} strokeWidth="7" fill="none" />
    </>,
  )

const Steps: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      <path d="M3 20h8.7v8H5a2 2 0 0 1-2-2Z" fill={BRONZE} />
      <path d="M11.7 12h8.6v16h-8.6Z" fill={SILVER} />
      <path d="M20.3 4H27a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2h-6.7Z" fill={GOLD} />
    </>,
  )

const Chevrons: Mark = ({ size = 26 }) =>
  svg(
    size,
    <>
      {[
        [3.5, BRONZE],
        [12, SILVER],
        [20.5, GOLD],
      ].map(([x, c]) => (
        <path key={x} d={`M${x} 6l8 10-8 10`} fill="none" stroke={c as string} strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" />
      ))}
    </>,
  )

export const LOGOS2: typeof LOGOS = [
  { name: 'Dots and bar', mark: DotsBar, idea: 'From 10. Stream above, batch below, at equal weight.', note: 'Four dots, not five, and the bar is as thin as the dots. Calmer than 10, and it still reads as two kinds of flow.' },
  { name: 'Dots and bar, on a tile', mark: DotsBarTile, idea: 'From 10, inside a dark tile.', note: 'The tile holds the two parts together at browser-tab size. It looks the same on light and dark.' },
  { name: 'Row and column', mark: RowColumn, idea: 'From 3. One table, with one row and one column marked.', note: 'Says “row or column?” in one shape. The cell where they meet is gold.' },
  { name: 'Rows to columns, on a tile', mark: RowsColumnsTile, idea: 'From 3, with equal bars, inside a dark tile.', note: 'Closest to the first version. The tile and the even weights correct its weakness at small size.' },
  { name: 'Three slabs', mark: Slabs, idea: 'From 8, with no outline. Three parts, and one is read.', note: 'The boldest of the ten. Clear at 16 pixels.' },
  { name: 'Bronze, silver, gold slabs', mark: SlabsBSG, idea: '8 and the layers together: the three stages as three parts of one table.', note: 'The colours carry the meaning, so it is weaker in one colour.' },
  { name: 'Three stops', mark: ThreeStops, idea: 'A pipeline with three stops: bronze, silver, gold.', note: 'It is also a line of the lesson map, so it says “pipeline” and “this site” at once.' },
  { name: 'Pipe, bronze to gold', mark: PipeBSG, idea: 'One pipe that turns a corner, and the data gets better along it.', note: 'The most literal pipeline. The bend makes it distinct from a plain bar.' },
  { name: 'Steps', mark: Steps, idea: 'Each layer is a step up in quality.', note: 'Simple and strong. Out of context it can be read as a bar chart.' },
  { name: 'Three chevrons', mark: Chevrons, idea: 'Three transformations in a row, each one a stage.', note: 'Shows direction, which the other marks do not. Light strokes, so check it at small size.' },
]

/* ---- round three: from 14, reversed. Columns make the D, rows make the E. ---- */
const LIGHT = '#7fa6ff'

/** D from vertical bars, E from three horizontal bars, on the 32 grid between y 6 and y 26. */
function de(o: { heights?: number[]; w?: number; gap?: number; d: string | string[]; e: string | string[]; rx?: number; sliced?: boolean; spine?: boolean }) {
  const heights = o.heights ?? [20, 20, 13]
  const w = o.w ?? 3.6
  const gap = o.gap ?? 0.7
  const rx = o.rx ?? 1.3
  const col = (c: string | string[], i: number) => (Array.isArray(c) ? c[i % c.length] : c)
  return (
    <>
      {o.sliced ? (
        <>
          <clipPath id="de-d">
            <path d="M3 6h2a10 10 0 0 1 0 20H3Z" />
          </clipPath>
          <g clipPath="url(#de-d)">
            {[3, 7.4, 11.8].map((x, i) => (
              <rect key={x} x={x} y="6" width="3.3" height="20" fill={col(o.d, i)} />
            ))}
          </g>
        </>
      ) : (
        heights.map((h, i) => <rect key={i} x={3 + i * (w + gap)} y={16 - h / 2} width={w} height={h} rx={rx} fill={col(o.d, i)} />)
      )}
      {o.spine && <rect x="18" y="6" width="3.4" height="20" rx={rx} fill={col(o.e, 0)} />}
      {[6, 13.4, 20.8].map((y, i) => (
        <rect key={y} x="18" y={y} width={i === 1 && o.spine ? 8.5 : 11} height="5.2" rx={rx} fill={col(o.e, i)} />
      ))}
    </>
  )
}
const inTile = (fill: string, inner: ReactNode, stroke?: boolean) => (
  <>
    {stroke ? <rect x="2" y="2" width="28" height="28" rx="7.5" fill="none" stroke="currentColor" strokeWidth="2.4" /> : <rect x="1" y="1" width="30" height="30" rx="8" fill={fill} />}
    <g transform="translate(5.1 5.1) scale(0.68)">{inner}</g>
  </>
)

const DE1: Mark = ({ size = 26 }) => svg(size, inTile('#132029', de({ d: LIGHT, e: '#fff' })))
const DE2: Mark = ({ size = 26 }) => svg(size, de({ d: 'currentColor', e: BLUE }))
const DE3: Mark = ({ size = 26 }) => svg(size, de({ heights: [20, 20, 16, 9], w: 2.6, gap: 0.65, d: 'currentColor', e: BLUE }))
const DE4: Mark = ({ size = 26 }) => svg(size, de({ sliced: true, d: 'currentColor', e: BLUE }))
const DE5: Mark = ({ size = 26 }) => svg(size, inTile('#132029', de({ sliced: true, d: '#fff', e: LIGHT })))
const DE6: Mark = ({ size = 26 }) => svg(size, de({ sliced: true, spine: true, d: 'currentColor', e: ['currentColor', BLUE, 'currentColor'] }))
const DE7: Mark = ({ size = 26 }) => svg(size, de({ rx: 2.6, w: 3.7, gap: 0.6, d: GREEN, e: 'currentColor' }))
const DE8: Mark = ({ size = 26 }) => svg(size, de({ d: [BRONZE, SILVER, GOLD], e: 'currentColor' }))
const DE9: Mark = ({ size = 26 }) => svg(size, inTile(BLUE, de({ sliced: true, d: '#fff', e: '#fff' })))
const DE10: Mark = ({ size = 26 }) => svg(size, inTile('', de({ d: BLUE, e: 'currentColor' }), true))

export const LOGOS3: typeof LOGOS = [
  { name: 'D and E, on a tile', mark: DE1, idea: '14 reversed: three columns make the D, three rows make the E.', note: 'The direct answer to your note. The short third column gives the D its curve.' },
  { name: 'D and E, open', mark: DE2, idea: 'The same letters with no tile: ink columns, blue rows.', note: 'Lighter in the header. It needs the two colours to keep the letters apart.' },
  { name: 'D with four columns', mark: DE3, idea: 'Four thin columns that step down, so the D has a rounder side.', note: 'The best D of the bar versions. Thin bars, so it is weaker at browser-tab size.' },
  { name: 'Sliced D', mark: DE4, idea: 'A true D shape, cut into three columns.', note: 'Reads as “DE” first and as columns and rows second. My pick of this round.' },
  { name: 'Sliced D, on a tile', mark: DE5, idea: 'The sliced D in white on the dark tile, rows in light blue.', note: 'The same on light and dark, and the strongest at 16 pixels.' },
  { name: 'Sliced D, E with a spine', mark: DE6, idea: 'The E gets its upright, and its middle row is blue: one row selected.', note: 'The most letter-like. The E is less clearly “rows”.' },
  { name: 'Soft bars', mark: DE7, idea: 'Rounded bars, green columns and ink rows.', note: 'Friendlier. The round ends make the letters a little less clear.' },
  { name: 'Bronze, silver, gold columns', mark: DE8, idea: 'The three columns of the D are the three layers.', note: 'Joins this idea with the bronze-to-gold one. Three colours and ink is the limit.' },
  { name: 'Blue tile', mark: DE9, idea: 'The sliced D and the rows in white on one blue tile.', note: 'One colour and white. Easy to use anywhere, and it stands out in a row of browser tabs.' },
  { name: 'Outline tile', mark: DE10, idea: 'Blue columns and ink rows inside a thin frame.', note: 'Lighter than a filled tile. The frame is thin at small size.' },
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

function Set({ title, lead, items, from }: { title: string; lead: string; items: typeof LOGOS; from: number }) {
  return (
    <section className="logos">
      <h2>{title}</h2>
      <p className="brand-more">{lead}</p>
      <div className="lg-grid">
        {items.map((l, i) => (
          <article key={l.name} className="lg-card">
            <header>
              <b>
                {from + i}. {l.name}
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

export default function Logos() {
  return (
    <>
      <Set
        title="Round three: D from columns, E from rows"
        lead="Built on 14, reversed as you asked: the columns come first and form a D, the rows come second and form an E."
        items={LOGOS3}
        from={21}
      />
      <Set
        title="Round two: ten refinements"
        lead="Built on 10, 3 and 8 of the first round, and on the pipeline and bronze-to-gold idea. Numbers continue from the first round."
        items={LOGOS2}
        from={11}
      />
      <Set
        title="Round one"
        lead="The first ten. Each one is shown large, on dark, at browser-tab size, and next to the name as it would be in the header."
        items={LOGOS}
        from={1}
      />
    </>
  )
}
