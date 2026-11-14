import { useState } from 'react'

const Arrow = () => (
  <span className="arrow" aria-hidden="true">
    →
  </span>
)

export function EtlElt() {
  const [m, setM] = useState<'etl' | 'elt'>('etl')
  return (
    <div>
      <div className="seg">
        <button aria-pressed={m === 'etl'} onClick={() => setM('etl')}>
          ETL
        </button>
        <button aria-pressed={m === 'elt'} onClick={() => setM('elt')}>
          ELT
        </button>
      </div>
      {m === 'etl' ? (
        <div className="fx center">
          <div className="box">
            <h4>Sources</h4>
            <p>App database, APIs, files</p>
          </div>
          <Arrow />
          <div className="box solid grow">
            <h4>Transform on a separate server</h4>
            <p>Clean, join and aggregate in pipeline code before loading</p>
          </div>
          <Arrow />
          <div className="box grow">
            <h4>Warehouse</h4>
            <p>Receives finished tables only</p>
          </div>
        </div>
      ) : (
        <div className="fx center">
          <div className="box">
            <h4>Sources</h4>
            <p>App database, APIs, files</p>
          </div>
          <Arrow />
          <div className="box grow" style={{ flex: '2.4 1 0' }}>
            <h4>Warehouse</h4>
            <div className="fx center" style={{ marginTop: 8 }}>
              <div className="box dash grow">
                <h4>Raw tables</h4>
                <p>Loaded as they arrive</p>
              </div>
              <Arrow />
              <div className="box solid grow">
                <h4>Transform in SQL</h4>
                <p>The warehouse engine does the work</p>
              </div>
              <Arrow />
              <div className="box tint grow">
                <h4>Modeled tables</h4>
              </div>
            </div>
          </div>
        </div>
      )}
      <table className="tbl" style={{ marginTop: 16 }}>
        <tbody>
          <tr>
            <th>Is raw data kept?</th>
            <td style={{ fontFamily: 'var(--sans)', fontSize: 14, whiteSpace: 'normal' }}>
              {m === 'etl' ? 'Often not. To change the logic for old data you must extract again.' : 'Yes. Change the SQL and rebuild from the raw tables.'}
            </td>
          </tr>
          <tr>
            <th>Where is compute paid for?</th>
            <td style={{ fontFamily: 'var(--sans)', fontSize: 14, whiteSpace: 'normal' }}>
              {m === 'etl' ? 'On pipeline servers you size and run.' : 'In the warehouse, which scales on demand.'}
            </td>
          </tr>
          <tr>
            <th>When is it the better choice?</th>
            <td style={{ fontFamily: 'var(--sans)', fontSize: 14, whiteSpace: 'normal' }}>
              {m === 'etl'
                ? 'Sensitive fields must be removed before they are stored, or the target cannot run heavy transforms.'
                : 'Most analytics on a cloud warehouse or lakehouse. This is the usual default today.'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const SOURCE = [
  { id: 'A', amount: 10 },
  { id: 'B', amount: 20 },
  { id: 'C', amount: 30 },
]
type Strategy = 'append' | 'overwrite' | 'merge'
const SQL: Record<Strategy, string> = {
  append: "INSERT INTO sales\nSELECT * FROM staging WHERE day = '03-05'",
  overwrite: "DELETE FROM sales WHERE day = '03-05';\nINSERT INTO sales\nSELECT * FROM staging WHERE day = '03-05'",
  merge: 'MERGE INTO sales t USING staging s\n  ON t.order_id = s.order_id\nWHEN MATCHED THEN UPDATE ...\nWHEN NOT MATCHED THEN INSERT ...',
}

export function Idempotency() {
  const [s, setS] = useState<Strategy>('append')
  const [runs, setRuns] = useState(1)
  const copies = s === 'append' ? runs : 1
  const rows = Array.from({ length: copies }, () => SOURCE).flat()
  const total = rows.reduce((a, r) => a + r.amount, 0)
  const pick = (x: Strategy) => {
    setS(x)
    setRuns(1)
  }
  return (
    <div>
      <span className="ctl-label">How the job writes 5 March into the target table</span>
      <div className="seg">
        <button aria-pressed={s === 'append'} onClick={() => pick('append')}>
          Append
        </button>
        <button aria-pressed={s === 'overwrite'} onClick={() => pick('overwrite')}>
          Delete, then insert
        </button>
        <button aria-pressed={s === 'merge'} onClick={() => pick('merge')}>
          Merge on key
        </button>
      </div>
      <div className="fx">
        <div className="grow">
          <pre style={{ margin: 0, background: 'var(--ink)', color: '#e4ecea', padding: 12, borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 12.5, lineHeight: 1.5, overflowX: 'auto' }}>
            {SQL[s]}
          </pre>
          <div className="fx center" style={{ marginTop: 12 }}>
            <button className="act" onClick={() => setRuns(runs + 1)} disabled={runs >= 4}>
              Run the job again
            </button>
            <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              Runs so far: <b>{runs}</b>
            </span>
          </div>
        </div>
        <div className="grow" style={{ maxHeight: 260, overflowY: 'auto' }}>
          <table className="tbl">
            <caption>sales, day = 03-05</caption>
            <thead>
              <tr>
                <th>order_id</th>
                <th>amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={i >= 3 ? 'err' : ''}>
                  <td>{r.id}</td>
                  <td>{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className={`stat ${total === 60 ? (runs > 1 ? 'good' : '') : 'bad'}`}>
        Revenue for 5 March: <b>{total}</b>. The correct value is 60.{' '}
        {runs === 1
          ? 'After one run every method is correct. Run it again, as a retry would.'
          : total === 60
            ? 'The rerun changed nothing. This job is idempotent.'
            : 'Each rerun adds the same rows again. A retry after a timeout is enough to cause this.'}
      </p>
    </div>
  )
}
