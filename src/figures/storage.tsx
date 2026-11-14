import { useState } from 'react'

const COLS = ['order_id', 'customer', 'country', 'amount']
const ROWS = [
  ['1001', 'Ana', 'PT', '40'],
  ['1002', 'Ben', 'ES', '25'],
  ['1003', 'Chi', 'PT', '90'],
  ['1004', 'Dev', 'FR', '15'],
  ['1005', 'Eva', 'ES', '60'],
  ['1006', 'Fay', 'PT', '35'],
]

export function RowCol() {
  const [q, setQ] = useState<'sum' | 'one'>('sum')
  // which cells the query needs
  const need = (r: number, c: number) => (q === 'sum' ? c === 3 : r === 3)
  const rowOpen = (r: number) => (q === 'sum' ? true : r === 3)
  const colOpen = (c: number) => (q === 'sum' ? c === 3 : true)
  const rowBlocks = ROWS.filter((_, r) => rowOpen(r)).length
  const colBlocks = COLS.filter((_, c) => colOpen(c)).length

  return (
    <div>
      <span className="ctl-label">Choose a query</span>
      <div className="seg">
        <button aria-pressed={q === 'sum'} onClick={() => setQ('sum')}>
          SELECT SUM(amount) FROM orders
        </button>
        <button aria-pressed={q === 'one'} onClick={() => setQ('one')}>
          SELECT * WHERE order_id = 1004
        </button>
      </div>
      <div className="rc">
        <div>
          <h4>Row store: one block for each row</h4>
          <div className="rc-rows">
            {ROWS.map((row, r) => (
              <div key={r} className={rowOpen(r) ? 'open' : ''}>
                {row.map((v, c) => (
                  <span key={c} className={rowOpen(r) && need(r, c) ? 'need' : ''}>
                    {v}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p>
            Opens <b>{rowBlocks}</b> of 6 blocks and reads <b>{rowBlocks * 4}</b> values to use <b>{q === 'sum' ? 6 : 4}</b>.
          </p>
        </div>
        <div>
          <h4>Column store: one block for each column</h4>
          <div className="rc-cols">
            {COLS.map((_, c) => (
              <div key={c} className={colOpen(c) ? 'open' : ''}>
                {ROWS.map((row, r) => (
                  <span key={r} className={colOpen(c) && need(r, c) ? 'need' : ''}>
                    {row[c]}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p>
            Opens <b>{colBlocks}</b> of 4 blocks and reads <b>{colBlocks * 6}</b> values to use <b>{q === 'sum' ? 6 : 4}</b>.
          </p>
        </div>
      </div>
      <p className="stat">
        {q === 'sum' ? (
          <>
            <b>The column store wins.</b> It reads only the <code>amount</code> block. The row store must read every
            column of every row to get to one column.
          </>
        ) : (
          <>
            <b>The row store wins.</b> The whole order is in one block. The column store must go to four different
            places to put one row back together.
          </>
        )}
      </p>
    </div>
  )
}

const DAYS = ['03-01', '03-02', '03-03', '03-04', '03-05', '03-06', '03-07']
const GB = 40
const FILTERS = [
  { id: 'none', label: 'No filter', scan: (_: number) => true },
  { id: 'day', label: "event_date = '03-05'", scan: (i: number) => i === 4 },
  { id: 'range', label: "event_date >= '03-05'", scan: (i: number) => i >= 4 },
  { id: 'user', label: 'user_id = 42', scan: (_: number) => true },
]

export function Partitions() {
  const [f, setF] = useState('day')
  const filter = FILTERS.find((x) => x.id === f)!
  const scanned = DAYS.filter((_, i) => filter.scan(i)).length
  return (
    <div>
      <span className="ctl-label">
        Table <code>events</code>, partitioned by <code>event_date</code>. Choose a WHERE clause
      </span>
      <div className="seg">
        {FILTERS.map((x) => (
          <button key={x.id} aria-pressed={f === x.id} onClick={() => setF(x.id)}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="parts">
        {DAYS.map((d, i) => (
          <div key={d} className={`part ${filter.scan(i) ? 'scan' : ''}`}>
            <small>event_date=</small>
            <b>{d}</b>
            <i>{GB} GB</i>
          </div>
        ))}
      </div>
      <p className={`stat ${f === 'user' ? 'bad' : ''}`}>
        Scans <b>{scanned} of 7</b> partitions, <b>{scanned * GB} GB</b>.{' '}
        {f === 'user'
          ? 'The filter is not on the partition column, so the engine cannot skip any folder. Partitioning helps only the queries that filter on the partition column.'
          : f === 'none'
            ? 'With no filter the engine reads everything.'
            : `The engine reads the folder names, not the data, to decide. The other ${7 - scanned} folders are never opened.`}
      </p>
    </div>
  )
}
