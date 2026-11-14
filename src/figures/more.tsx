import { useState } from 'react'

/* ---------- Foundations ---------- */

const REQ = [
  { q: 'What decision will you make with it?', a: 'Each Monday the sales director moves budget between regions.', so: 'The need is a comparison of regions by week. It is not a list of orders.' },
  { q: 'What is one row?', a: 'One order line. Returns must be subtracted.', so: 'Grain: order line. Returns are needed as a source, and nobody had mentioned them.' },
  { q: 'How fresh must it be?', a: 'Monday at 08:00 with data to Sunday night.', so: 'A daily batch is enough. “Real-time” was never the need.' },
  { q: 'How correct must it be?', a: 'It must agree with the finance report to the cent.', so: 'Use the finance definition of revenue, and add a test that compares the two totals.' },
  { q: 'Who else has this number already?', a: 'Finance has a spreadsheet with a different total.', so: 'Agree on one definition before you build. If not, you add a third number.' },
  { q: 'What will you do if it is late or wrong?', a: 'The meeting uses last week’s numbers, and that is acceptable once a quarter.', so: 'No on-call is needed at night. An alert at 07:00 is enough.' },
]

export function Requirements() {
  const [open, setOpen] = useState<number[]>([])
  return (
    <div className="req">
      <p className="req-ask">The request: “I need a sales dashboard. Real-time if possible.”</p>
      <ol>
        {REQ.map((r, i) => {
          const on = open.includes(i)
          return (
            <li key={i} className={on ? 'on' : ''}>
              <button aria-expanded={on} onClick={() => setOpen(on ? open.filter((x) => x !== i) : [...open, i])}>
                <span>You ask:</span> {r.q}
              </button>
              {on && (
                <div className="req-a">
                  <p>
                    <span>They answer:</span> {r.a}
                  </p>
                  <p className="req-so">
                    <span>So you write:</span> {r.so}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <p className="stat">
        {open.length === 0
          ? 'Select each question to see the answer and what it changes in the design.'
          : open.length < REQ.length
            ? `${open.length} of ${REQ.length} questions asked.`
            : 'The request was “a real-time sales dashboard”. The requirement is a weekly comparison of regions at order-line grain, loaded daily, that agrees with finance.'}
      </p>
    </div>
  )
}

export function Sdlc() {
  const steps = [
    ['Plan', 'Agree the requirement and split it into small changes.'],
    ['Build', 'Write the change on a branch, in a development environment.'],
    ['Test', 'Automated checks run on each commit.'],
    ['Review', 'A second person reads the change before it is merged.'],
    ['Release', 'A pipeline deploys the merged code. Nobody copies files by hand.'],
    ['Operate', 'Monitor the runs and the data. What you learn starts the next plan.'],
  ]
  return (
    <div>
      <ol className="loop">
        {steps.map(([t, d], i) => (
          <li key={t}>
            <b>
              {i + 1}. {t}
            </b>
            <span>{d}</span>
          </li>
        ))}
      </ol>
      <p className="loop-back">After step 6, go back to step 1. Good teams go round this loop many times a day, with small changes.</p>
      <div className="box tint" style={{ marginTop: 12 }}>
        <h4>What is different for data</h4>
        <p>
          An application can be tested with a few made-up records. A pipeline also depends on the data that arrives tomorrow, which you have
          not seen. So data teams add a seventh activity that never stops: tests on the data itself, in production, on each run.
        </p>
      </div>
    </div>
  )
}

export function SqlOrder() {
  const rows: [string, string, string][] = [
    ['FROM, JOIN', 'orders o JOIN customers c ON ...', 'Find the tables and match their rows.'],
    ['WHERE', "o.status = 'paid'", 'Keep the rows that pass the filter.'],
    ['GROUP BY', 'c.country', 'Put the rows that remain into groups.'],
    ['HAVING', 'SUM(o.amount) > 1000', 'Keep the groups that pass the filter.'],
    ['SELECT', 'c.country, SUM(o.amount) AS revenue', 'Compute the output columns. Window functions run here.'],
    ['ORDER BY', 'revenue DESC', 'Sort the result.'],
    ['LIMIT', '10', 'Return the first rows only.'],
  ]
  return (
    <table className="tbl sqlo">
      <caption>You write SELECT first. The engine runs it fifth.</caption>
      <thead>
        <tr>
          <th>Order of execution</th>
          <th>Example</th>
          <th>What it does</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([k, ex, d], i) => (
          <tr key={k}>
            <th>
              {i + 1}. {k}
            </th>
            <td>{ex}</td>
            <td className="plain">{d}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ---------- Storage ---------- */

const UNSORTED: [number, number][] = [[3, 96], [1, 88], [12, 99], [5, 91], [2, 97], [8, 94], [4, 90], [1, 99]]
const SORTED: [number, number][] = [[1, 12], [13, 25], [26, 37], [38, 50], [51, 62], [63, 75], [76, 87], [88, 99]]

export function ZoneMap() {
  const [sorted, setSorted] = useState(false)
  const [id, setId] = useState(42)
  const files = sorted ? SORTED : UNSORTED
  const read = files.filter(([lo, hi]) => id >= lo && id <= hi).length
  return (
    <div>
      <div className="seg">
        <button aria-pressed={!sorted} onClick={() => setSorted(false)}>
          Rows in arrival order
        </button>
        <button aria-pressed={sorted} onClick={() => setSorted(true)}>
          Table clustered by customer_id
        </button>
      </div>
      <label className="ctl-label" htmlFor="zm">
        Query: <code>WHERE customer_id = {id}</code>
      </label>
      <input id="zm" type="range" min="1" max="99" value={id} onChange={(e) => setId(+e.target.value)} style={{ width: '100%', accentColor: 'var(--line)' }} />
      <div className="zm">
        {files.map(([lo, hi], i) => {
          const hit = id >= lo && id <= hi
          return (
            <div key={i} className={`part ${hit ? 'scan' : ''}`}>
              <small>file {i + 1}</small>
              <b>
                {lo} to {hi}
              </b>
              <i>{hit ? 'read' : 'skipped'}</i>
            </div>
          )
        })}
      </div>
      <p className={`stat ${read <= 1 ? 'good' : 'bad'}`}>
        Each file records the smallest and largest customer_id it contains. The engine reads <b>{read} of 8 files</b>.{' '}
        {sorted
          ? 'The ranges do not overlap, so only one file can contain the value.'
          : 'Each file contains customers from the full range, so the minimum and maximum exclude almost nothing.'}
      </p>
    </div>
  )
}

/* ---------- Modeling ---------- */

export function ModelLevels() {
  return (
    <div className="fx">
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>1. Conceptual</h4>
        <div className="box dash">
          <p style={{ color: 'var(--ink)' }}>
            A <b>customer</b> places an <b>order</b>. An order contains <b>products</b>. An order is sent in one or more <b>shipments</b>.
          </p>
        </div>
        <p className="lvl-note">Words and relationships. A business person can check it.</p>
      </div>
      <span className="arrow" aria-hidden="true">
        →
      </span>
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>2. Logical</h4>
        <div className="box tint">
          <p className="mono">
            fact_order_line
            <br />
            &nbsp;grain: one product on one order
            <br />
            &nbsp;keys: customer, product, date
            <br />
            &nbsp;measures: quantity, amount
          </p>
        </div>
        <p className="lvl-note">Tables, keys and grain. No engine is named yet.</p>
      </div>
      <span className="arrow" aria-hidden="true">
        →
      </span>
      <div className="grow fcol">
        <h4 style={{ margin: 0 }}>3. Physical</h4>
        <div className="box solid">
          <p className="mono">
            amount NUMERIC(12,2)
            <br />
            PARTITION BY order_date
            <br />
            CLUSTER BY customer_key
            <br />
            Parquet, in Iceberg
          </p>
        </div>
        <p className="lvl-note">Types, layout and engine. Decides speed and cost.</p>
      </div>
    </div>
  )
}

export function FactTypes() {
  return (
    <div className="ft">
      <div>
        <h4>Transaction</h4>
        <p>One row for each event. Rows are never updated.</p>
        <table className="tbl">
          <thead>
            <tr>
              <th>time</th>
              <th>product</th>
              <th>qty</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>09:02</td><td>pen</td><td>-3</td></tr>
            <tr><td>09:40</td><td>pen</td><td>-1</td></tr>
            <tr><td>11:15</td><td>pen</td><td>+50</td></tr>
          </tbody>
        </table>
        <p className="ft-q">Answers: what happened?</p>
      </div>
      <div>
        <h4>Periodic snapshot</h4>
        <p>One row for each thing for each period. A new set of rows each day.</p>
        <table className="tbl">
          <thead>
            <tr>
              <th>date</th>
              <th>product</th>
              <th>on hand</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>3 Jun</td><td>pen</td><td>14</td></tr>
            <tr><td>4 Jun</td><td>pen</td><td>60</td></tr>
            <tr><td>5 Jun</td><td>pen</td><td>52</td></tr>
          </tbody>
        </table>
        <p className="ft-q">Answers: how much was there?</p>
      </div>
      <div>
        <h4>Accumulating snapshot</h4>
        <p>One row for each item in a process. The row is updated at each step.</p>
        <table className="tbl">
          <thead>
            <tr>
              <th>order</th>
              <th>paid</th>
              <th>shipped</th>
              <th>delivered</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>1001</td><td>3 Jun</td><td>4 Jun</td><td>6 Jun</td></tr>
            <tr className="hl"><td>1002</td><td>4 Jun</td><td>5 Jun</td><td>null</td></tr>
            <tr><td>1003</td><td>5 Jun</td><td>null</td><td>null</td></tr>
          </tbody>
        </table>
        <p className="ft-q">Answers: how long does each step take?</p>
      </div>
    </div>
  )
}

/* ---------- Pipelines ---------- */

export function DbtLayers() {
  const [sel, setSel] = useState('fct_orders')
  const up: Record<string, string[]> = {
    stg_orders: ['raw.orders'],
    stg_payments: ['raw.payments'],
    stg_customers: ['raw.customers'],
    int_orders_paid: ['stg_orders', 'stg_payments'],
    fct_orders: ['int_orders_paid', 'stg_customers'],
    dim_customers: ['stg_customers'],
  }
  const anc = new Set<string>()
  const walk = (n: string) => (up[n] ?? []).forEach((p) => (anc.add(p), walk(p)))
  walk(sel)
  const cols: [string, string, string[]][] = [
    ['Raw', 'Copies of the source. Not built by dbt.', ['raw.orders', 'raw.payments', 'raw.customers']],
    ['Staging', 'One model for each raw table. Rename, cast, no joins.', ['stg_orders', 'stg_payments', 'stg_customers']],
    ['Intermediate', 'Joins and business rules.', ['int_orders_paid']],
    ['Marts', 'What users query.', ['fct_orders', 'dim_customers']],
  ]
  return (
    <div>
      <div className="dbt">
        {cols.map(([name, note, models]) => (
          <div key={name}>
            <h4>{name}</h4>
            <p>{note}</p>
            {models.map((m) =>
              up[m] ? (
                <button key={m} className={`dbt-m ${m === sel ? 'sel' : anc.has(m) ? 'anc' : ''}`} aria-pressed={m === sel} onClick={() => setSel(m)}>
                  {m}
                </button>
              ) : (
                <span key={m} className={`dbt-m src ${anc.has(m) ? 'anc' : ''}`}>
                  {m}
                </span>
              ),
            )}
          </div>
        ))}
      </div>
      <p className="stat">
        <code>dbt build --select +{sel}</code> builds <b>{sel}</b> and the {[...anc].filter((a) => up[a]).length} models before it, in
        dependency order. The tool reads the order from the <code>ref()</code> calls in the SQL. You do not write it.
      </p>
    </div>
  )
}

/* ---------- Processing ---------- */

export function Joins() {
  const [small, setSmall] = useState(true)
  const [sorted, setSorted] = useState(false)
  const kind = small ? 'Broadcast hash join' : sorted ? 'Sort-merge join, with no shuffle' : 'Shuffle, then sort-merge or hash join'
  const text = small
    ? 'The small table is copied to each machine and kept in memory as a hash table. Each machine joins its own part of the large table. No rows of the large table move.'
    : sorted
      ? 'The two tables are stored in buckets by the join key, sorted. Matching buckets are read side by side. Nothing moves, but you must prepare the two tables in advance.'
      : 'Rows of the two tables are sent across the network so that equal keys arrive on the same machine. This is the slowest method, and it is the one that fails when one key is very frequent.'
  return (
    <div>
      <span className="ctl-label">orders has 2 billion rows. The other table, countries, has</span>
      <div className="seg">
        <button aria-pressed={small} onClick={() => setSmall(true)}>
          200 rows
        </button>
        <button aria-pressed={!small} onClick={() => setSmall(false)}>
          500 million rows
        </button>
      </div>
      {!small && (
        <>
          <span className="ctl-label">Are the two tables bucketed and sorted on the join key?</span>
          <div className="seg">
            <button aria-pressed={!sorted} onClick={() => setSorted(false)}>
              No
            </button>
            <button aria-pressed={sorted} onClick={() => setSorted(true)}>
              Yes
            </button>
          </div>
        </>
      )}
      <div className="fx center">
        <div className="box grow">
          <h4>orders</h4>
          <p>2 billion rows on 3 machines</p>
        </div>
        <div className={`box grow ${small ? 'tint' : ''}`}>
          <h4>{small ? 'countries (copied to each machine)' : 'customers'}</h4>
          <p>{small ? '200 rows, in memory' : '500 million rows on 3 machines'}</p>
        </div>
        <span className="arrow" aria-hidden="true">
          →
        </span>
        <div className="box solid grow">
          <h4>{kind}</h4>
          <p>Rows moved across the network: {small ? '200 × 3' : sorted ? 'none' : '2.5 billion'}</p>
        </div>
      </div>
      <p className={`stat ${small || sorted ? 'good' : 'bad'}`}>{text}</p>
    </div>
  )
}

export function Skew() {
  const [salt, setSalt] = useState(false)
  const parts = salt ? [26, 24, 25, 27, 23, 25, 26, 24] : [6, 5, 142, 7, 6, 5, 8, 21]
  const max = Math.max(...parts)
  return (
    <div>
      <div className="seg">
        <button aria-pressed={!salt} onClick={() => setSalt(false)}>
          Group by customer_id
        </button>
        <button aria-pressed={salt} onClick={() => setSalt(true)}>
          Add a salt to the frequent key
        </button>
      </div>
      <div className="skew" role="img" aria-label={`Rows in each of 8 partitions, in millions: ${parts.join(', ')}`}>
        {parts.map((p, i) => (
          <div key={i}>
            <span style={{ height: `${(p / 142) * 150}px` }} className={p === max && !salt ? 'hot' : ''} />
            <b>{p}M</b>
            <small>task {i + 1}</small>
          </div>
        ))}
      </div>
      <p className={`stat ${salt ? 'good' : 'bad'}`}>
        {salt
          ? 'The frequent key is split into 8 sub-keys (customer_id plus a random number from 0 to 7), aggregated, then combined in a second small step. All tasks now finish in about the same time.'
          : 'One customer, a marketplace reseller, has 136 million of the 200 million orders. All of its rows go to one partition. Seven tasks finish in a minute. Task 3 runs for an hour or stops with an out-of-memory error.'}
      </p>
    </div>
  )
}

/* ---------- Operations ---------- */

export function CiPipeline() {
  const [bad, setBad] = useState<number | null>(null)
  const steps: [string, string, string][] = [
    ['Lint and compile', '10 s', 'SQL and Python style. Every model reference resolves.'],
    ['Unit tests', '30 s', 'Small fixed inputs through each transformation function or model.'],
    ['Build in a CI schema', '4 min', 'Only the changed models and the models after them, on a sample of data.'],
    ['Data tests', '1 min', 'Unique keys, not-null columns, accepted values, on the CI build.'],
    ['Compare with production', '1 min', 'Row counts and totals of the new build against the current tables.'],
    ['Deploy', 'after merge', 'The same code is released to production by the pipeline.'],
  ]
  return (
    <div>
      <ol className="ci">
        {steps.map(([t, time, d], i) => {
          const st = bad === null ? 'ok' : i < bad ? 'ok' : i === bad ? 'fail' : 'skip'
          return (
            <li key={t} className={st}>
              <button onClick={() => setBad(bad === i ? null : i)} disabled={i === steps.length - 1} title="Make this step fail">
                <b>{t}</b>
                <small>{st === 'fail' ? 'failed' : st === 'skip' ? 'not run' : time}</small>
              </button>
              <span>{d}</span>
            </li>
          )
        })}
      </ol>
      <p className={`stat ${bad === null ? 'good' : 'bad'}`}>
        {bad === null
          ? 'All checks pass, so the change can be merged. Select a step to make it fail.'
          : `“${steps[bad][0]}” failed. The later steps do not run and the change cannot be merged. Production has not been touched. The author has the result in about ${['10 seconds', '40 seconds', '5 minutes', '6 minutes', '7 minutes'][bad]}.`}
      </p>
    </div>
  )
}
