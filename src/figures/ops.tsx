import { useState } from 'react'

const TASKS: { id: string; x: number; y: number; deps: string[] }[] = [
  { id: 'extract_orders', x: 8, y: 20, deps: [] },
  { id: 'extract_customers', x: 8, y: 110, deps: [] },
  { id: 'clean_orders', x: 164, y: 20, deps: ['extract_orders'] },
  { id: 'clean_customers', x: 164, y: 110, deps: ['extract_customers'] },
  { id: 'build_sales', x: 320, y: 65, deps: ['clean_orders', 'clean_customers'] },
  { id: 'test_sales', x: 476, y: 65, deps: ['build_sales'] },
  { id: 'publish', x: 632, y: 65, deps: ['test_sales'] },
]
const NW = 128
const NH = 44

export function Dag() {
  const [failed, setFailed] = useState<string | null>(null)
  const status: Record<string, 'ok' | 'fail' | 'skip'> = {}
  for (const t of TASKS) {
    status[t.id] = t.id === failed ? 'fail' : t.deps.some((d) => status[d] !== 'ok') ? 'skip' : 'ok'
  }
  const byId = Object.fromEntries(TASKS.map((t) => [t.id, t]))
  const skipped = TASKS.filter((t) => status[t.id] === 'skip').map((t) => t.id)
  const toggle = (id: string) => setFailed(failed === id ? null : id)

  return (
    <div className="dag">
      <span className="ctl-label">Select a task to make it fail. Select it again to repair it.</span>
      <div style={{ overflowX: 'auto' }}>
        <svg viewBox="0 0 768 174">
          <defs>
            <marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L10 5 L0 10 z" fill="var(--ink-3)" />
            </marker>
          </defs>
          {TASKS.flatMap((t) =>
            t.deps.map((d) => {
              const a = byId[d]
              return (
                <path
                  key={d + t.id}
                  className="edge"
                  markerEnd="url(#ah)"
                  d={`M${a.x + NW} ${a.y + NH / 2} C${a.x + NW + 16} ${a.y + NH / 2} ${t.x - 16} ${t.y + NH / 2} ${t.x - 2} ${t.y + NH / 2}`}
                />
              )
            }),
          )}
          {TASKS.map((t) => (
            <g
              key={t.id}
              className={`node ${status[t.id]}`}
              role="button"
              tabIndex={0}
              aria-label={`${t.id}: ${{ ok: 'succeeded', fail: 'failed', skip: 'not run' }[status[t.id]]}`}
              onClick={() => toggle(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggle(t.id)
                }
              }}
            >
              <rect x={t.x} y={t.y} width={NW} height={NH} />
              <text x={t.x + NW / 2} y={t.y + 19}>
                {t.id}
              </text>
              <text x={t.x + NW / 2} y={t.y + 35} style={{ fontWeight: 400, fontSize: 11 }}>
                {{ ok: 'success', fail: 'failed', skip: 'upstream failed' }[status[t.id]]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className={`stat ${failed ? 'bad' : 'good'}`}>
        {failed ? (
          <>
            <b>{failed}</b> failed.{' '}
            {skipped.length > 0
              ? `The orchestrator does not run ${skipped.join(', ')}. `
              : 'Nothing depends on it, so every other task ran. '}
            {status.publish !== 'ok'
              ? 'The dashboard keeps yesterday’s data, which is late but correct. After the repair, only the failed and skipped tasks run again.'
              : ''}
          </>
        ) : (
          'All tasks succeeded. The two extract tasks have no dependency on each other, so they run at the same time.'
        )}
      </p>
    </div>
  )
}

const ORDERS = [
  ['1001', '17', '40.00', '2026-03-05'],
  ['1002', 'NULL', '25.00', '2026-03-05'],
  ['1003', '21', '-90.00', '2026-03-05'],
  ['1003', '21', '90.00', '2026-03-05'],
  ['1004', '30', '15.00', '2031-03-05'],
  ['1005', '12', '60.00', '2026-03-05'],
]
const TESTS = [
  { id: 'unique', label: 'unique(order_id)', col: 0, rows: [2, 3] },
  { id: 'notnull', label: 'not_null(customer_id)', col: 1, rows: [1] },
  { id: 'range', label: 'amount >= 0', col: 2, rows: [2] },
  { id: 'date', label: 'order_date <= today', col: 3, rows: [4] },
]

export function Quality() {
  const [on, setOn] = useState<Record<string, boolean>>({ unique: true })
  const active = TESTS.filter((t) => on[t.id])
  const flagged = (r: number, c: number) => active.some((t) => t.col === c && t.rows.includes(r))
  const missed = TESTS.filter((t) => !on[t.id])
  return (
    <div>
      <span className="ctl-label">
        Today’s load of <code>orders</code> has four problems. Turn on tests to find them
      </span>
      <div className="checks">
        {TESTS.map((t) => (
          <label key={t.id}>
            <input type="checkbox" checked={!!on[t.id]} onChange={(e) => setOn({ ...on, [t.id]: e.target.checked })} />
            {t.label}
          </label>
        ))}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>order_id</th>
              <th>customer_id</th>
              <th>amount</th>
              <th>order_date</th>
            </tr>
          </thead>
          <tbody>
            {ORDERS.map((row, r) => (
              <tr key={r}>
                {row.map((v, c) => (
                  <td key={c} className={flagged(r, c) ? 'err' : ''}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={`stat ${missed.length === 0 ? 'good' : 'bad'}`}>
        <b>
          {active.length} of 4 tests on, {active.length} failed.
        </b>{' '}
        {active.length > 0 ? 'The pipeline stops before the dashboard is updated. ' : 'The pipeline reports success. '}
        {missed.length > 0
          ? `Not found: ${missed.map((t) => t.label).join(', ')}. A test finds only the problem it was written for.`
          : 'All four problems are found before a user sees them.'}
      </p>
    </div>
  )
}
